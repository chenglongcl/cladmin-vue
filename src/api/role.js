import request from '@/utils/request'

export const getRoleSelect = (params = {}) => {
  return request({
    url: request.adornUrl('/v1/roles/select'),
    method: 'get',
    params: request.adornParams(params)
  })
}

export const getRoleInfo = (params = {}) => {
  return request({
    url: request.adornUrl('/v1/roles/get'),
    method: 'get',
    params: request.adornParams(params)
  })
}

export const postOrPutRole = (data = {}) => {
  return request({
    url: request.adornUrl(
      `/v1/roles/${data.roleId ? 'update' : 'create'}`
    ),
    method: `${data.roleId ? 'put' : 'post'}`,
    data: request.adornData(data)
  })
}

export const deleteRole = (data = {}) => {
  return request({
    url: request.adornUrl('/v1/roles/delete'),
    method: 'delete',
    data: request.adornData(data)
  })
}

export const getRoleList = (params = {}) => {
  return request({
    url: request.adornUrl('/v1/roles/list'),
    method: 'get',
    params: request.adornParams(params)
  })
}
