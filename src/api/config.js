import request from '@/utils/request'

export const getConfigInfo = (params = {}) => {
  return request({
    url: request.adornUrl('/v1/config/get'),
    method: 'get',
    params: request.adornParams(params)
  })
}

export const postOrPutConfig = (data = {}) => {
  return request({
    url: request.adornUrl(
      `/v1/config/${data.configId ? 'update' : 'create'}`
    ),
    method: `${data.configId ? 'put' : 'post'}`,
    data: request.adornData(data)
  })
}

export const getConfigList = (params = {}) => {
  return request({
    url: request.adornUrl('/v1/config/list'),
    method: 'get',
    params: request.adornParams(params)
  })
}

export const deleteConfig = (data = {}) => {
  return request({
    url: request.adornUrl('/v1/config/delete'),
    method: 'delete',
    data: request.adornData(data)
  })
}
