import request from '@/utils/request'

export const getMenuNav = (params = {}) => {
  return request({
    url: request.adornUrl('/v1/menus/nav'),
    method: 'get',
    params: request.adornParams(params)
  })
}

export const getDeptInfo = (params = {}) => {
  return request({
    url: request.adornUrl('/v1/dept/get'),
    method: 'get',
    params: request.adornParams(params)
  })
}

export const postOrPutDept = (data = {}) => {
  return request({
    url: request.adornUrl(
      `/v1/dept/${data.deptId ? 'update' : 'create'}`
    ),
    method: `${data.deptId ? 'put' : 'post'}`,
    data: request.adornData(data)
  })
}

export const deleteDept = (params = {}) => {
  return request({
    url: request.adornUrl('/v1/dept/delete'),
    method: 'delete',
    params: request.adornParams(params)
  })
}

export const getDeptList = (params = {}) => {
  return request({
    url: request.adornUrl('/v1/dept/list'),
    method: 'get',
    params: request.adornParams(params)
  })
}
