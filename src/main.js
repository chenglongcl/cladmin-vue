import Vue from 'vue'
import VueCookie from 'vue-cookie' // api: https://github.com/alfhen/vue-cookie
import cloneDeep from 'lodash/cloneDeep'
import uploader from 'vue-simple-uploader'
import vDebounceThrottle from 'v-debounce-throttle'
import App from '@/App'
import router from '@/router' // api: https://github.com/vuejs/vue-router
import store from '@/store' // api: https://github.com/vuejs/vuex
import '@/filters'
import '@/element-ui' // api: https://github.com/ElemeFE/element
import '@/icons' // api: http://www.iconfont.cn/
import '@/element-ui-theme'
import '@/assets/scss/index.scss'

import request from '@/utils/request' // api: https://github.com/axios/axios
import renSelect from '@/components/ren-select'
import renRadioGroup from '@/components/ren-radio-group'
import renDeptTree from '@/components/ren-dept-tree'
import { isAuth, getDictLabel } from '@/utils'

Vue.use(uploader)
Vue.use(vDebounceThrottle)
Vue.use(VueCookie)
Vue.use(renSelect)
Vue.use(renRadioGroup)
Vue.use(renDeptTree)

Vue.config.productionTip = false

// 非生产环境, 适配mockjs模拟数据                 // api: https://github.com/nuysoft/Mock
if (process.env.NODE_ENV !== 'production') {
  require('@/mock')
}

// 挂载全局
Vue.prototype.$http = request
Vue.prototype.isAuth = isAuth // 权限方法
Vue.prototype.$getDictLabel = getDictLabel // 字典翻译方法

// 保存整站vuex本地储存初始状态
window.SITE_CONFIG.storeState = cloneDeep(store.state)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: (h) => h(App)
})
