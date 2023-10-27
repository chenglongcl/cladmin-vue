import request from '@/utils/request'

export const getMenuNav = (params = {}) => {
  return request({
    url: request.adornUrl('/v1/menus/nav'),
    method: 'get',
    params: request.adornParams(params)
  })
}

export const getMenuInfo = (params = {}) => {
  return request({
    url: request.adornUrl('/v1/menus/get'),
    method: 'get',
    params: request.adornParams(params)
  })
}

export const postOrPutMenu = (data = {}) => {
  return request({
    url: request.adornUrl(
      `/v1/menus/${data.menuId ? 'update' : 'create'}`
    ),
    method: `${data.menuId ? 'put' : 'post'}`,
    data: request.adornData(data)
  })
}

export const deleteMenu = (params = {}) => {
  return request({
    url: request.adornUrl('/v1/menus/delete'),
    method: 'delete',
    params: request.adornParams(params)
  })
}

export const getMenuList = (params = {}) => {
  return request({
    url: request.adornUrl('/v1/menus/list'),
    method: 'get',
    params: request.adornParams(params)
  })
}
