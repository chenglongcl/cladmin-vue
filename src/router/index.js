/**
 * 全站路由配置
 *
 * 建议:
 * 1. 代码中路由统一使用name属性跳转(不使用path属性)
 */
import Vue from 'vue'
import Router from 'vue-router'
import store from '@/store'
import cloneDeep from 'lodash/cloneDeep'
import request from '@/utils/request'
import { isURL } from '@/utils/validate'
import { clearLoginInfo } from '@/utils'

const originalPush = Router.prototype.push
Router.prototype.push = function push(location, onResolve, onReject) {
  if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject)
  return originalPush.call(this, location).catch(err => err)
}
Router.prototype.replace = function replace(location, onResolve, onReject) {
  if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject)
  return originalPush.call(this, location).catch(err => err)
}

Vue.use(Router)

// 开发环境不使用懒加载, 因为懒加载页面太多的话会造成webpack热更新太慢, 所以只有生产环境使用懒加载
const _import = require(`./import-${process.env.NODE_ENV}`)

// 全局路由(无需嵌套上左右整体布局)
const globalRoutes = [
  {
    path: '/404',
    component: _import('common/404'),
    name: '404',
    meta: {
      title: '404未找到'
    }
  },
  {
    path: '/login',
    component: _import('common/login'),
    name: 'login',
    meta: {
      title: '登录'
    }
  }
]

// 主入口路由(需嵌套上左右整体布局)
const mainRoutes = {
  path: '/',
  component: _import('main'),
  name: 'main',
  redirect: {
    name: 'home'
  },
  meta: {
    title: '主入口整体布局'
  },
  children: [
    // 通过meta对象设置路由展示方式
    // 1. isTab: 是否通过tab展示内容, true: 是, false: 否
    // 2. iframeUrl: 是否通过iframe嵌套展示内容, '以http[s]://开头': 是, '': 否
    // 提示: 如需要通过iframe嵌套展示内容, 但不通过tab打开, 请自行创建组件使用iframe处理!
    {
      path: '/home',
      component: _import('common/home'),
      name: 'home',
      meta: {
        title: '首页'
      }
    },
    {
      path: '/theme',
      component: _import('common/theme'),
      name: 'theme',
      meta: {
        title: '主题'
      }
    },
    {
      path: '/demo-echarts',
      component: _import('demo/echarts'),
      name: 'demo-echarts',
      meta: {
        title: 'demo-echarts',
        isTab: false
      }
    }
  ],
  beforeEnter(to, from, next) {
    const token = Vue.cookie.get('token')
    if (!token || !/\S/.test(token)) {
      clearLoginInfo()
      next({
        name: 'login'
      })
    }
    next()
  }
}

const createRouter = () => {
  return new Router({
    mode: 'history',
    scrollBehavior: () => ({
      y: 0
    }),
    globalInitialized: false, // 是否已经初始化全局路由
    isAddDynamicMenuRoutes: false, // 是否已经添加动态(菜单)路由
    routes: globalRoutes.concat(mainRoutes)
  })
}

const router = createRouter()

router.beforeEach(async(to, from, next) => {
  //
  if (!router.options.globalInitialized) {
    try {
      await initGlobalApp()
    } catch (error) {
      console.log(
        `%c${error} 初始化全局路由失败`,
        'color:blue'
      )
    }
  }
  // 添加动态(菜单)路由
  // 1. 已经添加 or 全局路由, 直接访问
  // 2. 获取菜单列表, 添加并保存本地存储
  if (
    router.options.isAddDynamicMenuRoutes ||
    fnCurrentRouteType(to, globalRoutes) === 'global'
  ) {
    next()
  } else {
    initApp().then((res) => {
      res ? next({
        ...to,
        replace: true
      }) : next()
    }).catch((e) => {
      console.log(
        `%c${e} 请求菜单列表和权限失败，跳转至登录页！！`,
        'color:blue'
      )
      router.push({
        name: 'login'
      })
    })
  }
})

async function initGlobalApp() {
  // 字典数组
  const [dicts] = await Promise.all([
    await request({
      url: request.adornUrl('/external/dictType/all'),
      method: 'get',
      params: request.adornParams()
    })
  ])
  const { data: dictsData = {}} = dicts
  let result = true
  //
  if (dictsData && dictsData.code === 0) {
    sessionStorage.setItem(
      'dicts',
      JSON.stringify(dictsData.data || '[]')
    )
  } else {
    result = false
  }
  if (!result) {
    sessionStorage.setItem('dicts', '[]')
  }
  //
  router.options.globalInitialized = true
  return result
}

async function initApp() {
  const [menus, permissions, user] = await Promise.all([
    await request({
      url: request.adornUrl('/v1/menus/nav'),
      method: 'get',
      params: request.adornParams()
    }),
    await request({
      url: request.adornUrl('/v1/menus/permissions'),
      method: 'get',
      params: request.adornParams()
    }),
    await request({
      url: request.adornUrl('/v1/users/personal'),
      method: 'get',
      params: request.adornParams()
    })
  ])
  const { data: menusData = {}} = menus
  const { data: permissionsData = {}} = permissions
  const { data: userData = {}} = user
  let result = true
  // 菜单
  if (menusData && menusData.code === 0) {
    fnAddDynamicMenuRoutes(menusData.data)
    router.options.isAddDynamicMenuRoutes = true
    sessionStorage.setItem(
      'menuList',
      JSON.stringify(menusData.data || '[]')
    )
  } else {
    result = false
  }
  // 权限
  if (permissionsData && permissionsData.code === 0) {
    sessionStorage.setItem(
      'permissions',
      JSON.stringify(permissionsData.data || '[]')
    )
  } else {
    result = false
  }
  // 用户信息
  if (userData && userData.code === 0) {
    store.commit('user/updateId', userData.data.userId)
    store.commit('user/updateName', userData.data.username)
  } else {
    result = false
  }
  if (!result) {
    sessionStorage.setItem('menuList', '[]')
    sessionStorage.setItem('permissions', '[]')
    sessionStorage.setItem('dicts', '[]')
  }
  return result
}

/**
 * 判断当前路由类型, global: 全局路由, main: 主入口路由
 * @param {*} route 当前路由
 */
function fnCurrentRouteType(route, globalRoutes = []) {
  let temp = []
  for (let i = 0; i < globalRoutes.length; i++) {
    if (route.path === globalRoutes[i].path) {
      return 'global'
    }
    if (globalRoutes[i].children && globalRoutes[i].children.length >= 1) {
      temp = temp.concat(globalRoutes[i].children)
    }
  }
  return temp.length >= 1 ? fnCurrentRouteType(route, temp) : 'main'
}

/**
 * 添加动态(菜单)路由
 * @param {*} menuList 菜单列表
 * @param {*} routes 递归创建的动态(菜单)路由
 */
function fnAddDynamicMenuRoutes(menuList = [], routes = []) {
  let temp = []
  for (let i = 0; i < menuList.length; i++) {
    if (menuList[i].children && menuList[i].children.length >= 1) {
      temp = temp.concat(menuList[i].children)
    } else if (menuList[i].url && /\S/.test(menuList[i].url)) {
      menuList[i].url = menuList[i].url.replace(/^\//, '')
      const route = {
        path: menuList[i].url.replace('/', '-'),
        component: null,
        name: menuList[i].url.replace('/', '-'),
        meta: {
          menuId: menuList[i].menuId,
          title: menuList[i].name,
          isDynamic: true,
          isTab: menuList[i].isTab,
          iframeUrl: ''
        }
      }
      // url以http[s]://开头, 通过iframe展示
      if (isURL(menuList[i].url)) {
        route.path = `i-${menuList[i].menuId}`
        route.name = `i-${menuList[i].menuId}`
        route.meta.iframeUrl = menuList[i].url
      } else {
        try {
          route.component = _import(`modules/${menuList[i].url}`) || null
        } catch (e) {
          console.log(e)
        }
      }
      routes.push(route)
    }
  }
  if (temp.length >= 1) {
    fnAddDynamicMenuRoutes(temp, routes)
  } else {
    const dynamicRoutes = cloneDeep(mainRoutes)
    dynamicRoutes.name = 'main-dynamic'
    dynamicRoutes.children = routes
    router.addRoute(dynamicRoutes)
    router.addRoute({
      path: '*',
      redirect: {
        name: '404'
      }
    })
    sessionStorage.setItem(
      'dynamicMenuRoutes',
      JSON.stringify(dynamicRoutes.children || '[]')
    )
    console.log('\n')
    console.log(
      '%c!<-------------------- 动态(菜单)路由 s -------------------->',
      'color:blue'
    )
    console.log(dynamicRoutes.children)
    console.log(
      '%c!<-------------------- 动态(菜单)路由 e -------------------->',
      'color:blue'
    )
  }
}

// 重置路由函数 export
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // 替换成新的空路由
}

export default router
