import VueCookie from 'vue-cookie'
import router, { resetRouter } from '@/router'
import store from '@/store'

/**
 * 获取uuid
 */
export function getUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    return (c === 'x' ? (Math.random() * 16) | 0 : 'r&0x3' | '0x8').toString(
      16
    )
  })
}

/**
 * 是否有权限
 * @param {*} key
 */
export function isAuth(key) {
  return (
    JSON.parse(sessionStorage.getItem('permissions') || '[]').indexOf(key) !==
    -1 || false
  )
}

/**
 * 获取字典数据列表
 * @param dictType  字典类型
 */
export function getDictDataList(dictType) {
  const type = JSON.parse(sessionStorage.getItem('dicts') || '[]').find((element) => (element.dictType === dictType))
  if (type) {
    return type.dataList
  } else {
    return []
  }
}

/**
 * 获取字典名称
 * @param dictType  字典类型
 * @param dictValue  字典值
 */
export function getDictLabel(dictType, dictValue) {
  const type = JSON.parse(sessionStorage.getItem('dicts') || '[]').find((element) => (element.dictType === dictType))
  if (type) {
    const val = type.dataList.find((element) => (element.dictValue === dictValue + ''))
    if (val) {
      return val.dictLabel
    } else {
      return dictValue
    }
  } else {
    return dictValue
  }
}

/**
 * 树形数据转换
 * @param {*} data
 * @param {*} id
 * @param {*} pid
 */
export function treeDataTranslate(data, id = 'id', pid = 'parentId') {
  const res = []
  const temp = {}
  for (let i = 0; i < data.length; i++) {
    temp[data[i][id]] = data[i]
  }
  for (let k = 0; k < data.length; k++) {
    if (temp[data[k][pid]] && data[k][id] !== data[k][pid]) {
      if (!temp[data[k][pid]].children) {
        temp[data[k][pid]].children = []
      }
      if (!temp[data[k][pid]]._level) {
        temp[data[k][pid]]._level = 1
      }
      data[k]._level = temp[data[k][pid]]._level + 1
      temp[data[k][pid]].children.push(data[k])
    } else {
      res.push(data[k])
    }
  }
  return res
}

/**
 * 清除登录信息
 */
export function clearLoginInfo() {
  VueCookie.delete('token')
  VueCookie.delete('token_valid_time')
  store.commit('resetStore')
  router.options.isAddDynamicMenuRoutes = false
  resetRouter()
}

export function formatFileSize(size) {
  if (size < 1024) {
    return `${size.toFixed(0)} bytes`
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024.0).toFixed(0)} KB`
  }
  if (size < 1024 * 1024 * 1024) {
    return `${(size / 1024.0 / 1024.0).toFixed(1)} MB`
  }
  return `${(size / 1024.0 / 1024.0 / 1024.0).toFixed(1)} GB`
}
