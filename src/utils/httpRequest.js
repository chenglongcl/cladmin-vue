import Vue from 'vue'
import axios from 'axios'
import router from '@/router'
import qs from 'qs'
import merge from 'lodash/merge'
import dayjs from 'dayjs'
import {
  Message
} from 'element-ui';
import {
  clearLoginInfo
} from '@/utils'

const http = axios.create({
  timeout: 1000 * 30,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json; charset=utf-8'
  },
  isRetryRequest: false
})

/**
 * 请求拦截
 */
http.interceptors.request.use(config => {
  config.headers['Authorization'] = `Bearer ${Vue.cookie.get('token')}` // 请求头带上token
  return config
}, error => {
  return Promise.reject(error)
})

/**
 * 响应拦截
 */
http.interceptors.response.use(response => {
  return response
}, error => {
  if (error.response) {
    switch (error.response.status) {
      case 401:
        let ReLogin = false
        let config = error.config
        let tokenValidTime = JSON.parse(Vue.cookie.get('token_valid_time'))
        if (tokenValidTime !== null) {
          let expiredAt = tokenValidTime["expired_at"]
          let refreshExpiredAt = tokenValidTime["refresh_expired_at"]
          let now = dayjs()
          if (!config.isRetryRequest && now.isAfter(expiredAt) && now.isBefore(refreshExpiredAt)) {
            const refresh = new Promise((resolve, reject) => {
              //刷新token
              Vue.http.getRefreshToken().then(({
                data
              }) => {
                if (data && data.code === 0) {
                  //修改flag
                  config.isRetryRequest = true;
                  //修改cookie token
                  Vue.cookie.set("token", data.data.token);
                  Vue.cookie.set(
                    "token_valid_time",
                    JSON.stringify({
                      expired_at: data.data.expired_at,
                      refresh_expired_at: data.data.refresh_expired_at
                    })
                  );
                  //修改原请求的token
                  config.headers.Authorization = `Bearer ${data.data.token}`;
                  resolve(axios(config))
                } else {
                  ReLogin = true
                }
              }).catch(() => {
                //失败重新登录
                clearLoginInfo()
                router.push({
                  name: 'login'
                })
                throw error;
              })
            })
            return refresh;
          } else {
            ReLogin = true
          }
        } else {
          ReLogin = true
        }
        if (ReLogin) {
          clearLoginInfo()
          router.push({
            name: 'login'
          })
        }
        break;
      default:
        Message.error(error.response.data.message);
    }
  }
  return Promise.reject(error)
})

/**
 * 请求地址处理
 * @param {*} actionName action方法名称
 */
http.adornUrl = (actionName) => {
  // 非生产环境 && 开启代理, 接口前缀统一使用[/proxyApi/]前缀做代理拦截!
  return (process.env.NODE_ENV !== 'production' && process.env.OPEN_PROXY ? '/proxyApi/' : window.SITE_CONFIG.baseUrl) + actionName
}

/**
 * get请求参数处理
 * @param {*} params 参数对象
 * @param {*} openDefultParams 是否开启默认参数?
 */
http.adornParams = (params = {}, openDefultParams = true) => {
  var defaults = {
    't': new Date().getTime()
  }
  return openDefultParams ? merge(defaults, params) : params
}

/**
 * post请求数据处理
 * @param {*} data 数据对象
 * @param {*} openDefultdata 是否开启默认数据?
 * @param {*} contentType 数据格式
 *  json: 'application/json; charset=utf-8'
 *  form: 'application/x-www-form-urlencoded; charset=utf-8'
 */
http.adornData = (data = {}, openDefultdata = true, contentType = 'json') => {
  var defaults = {
    't': new Date().getTime()
  }
  data = openDefultdata ? merge(defaults, data) : data
  return contentType === 'json' ? JSON.stringify(data) : qs.stringify(data)
}

export default http
