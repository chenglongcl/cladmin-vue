import request from '@/utils/request'

export const getDictTypeList = (params = {}) => {
  return request({
    url: request.adornUrl('/v1/dictType/list'),
    method: 'get',
    params: request.adornParams(params)
  })
}

export const getDictTypeInfo = (params = {}) => {
  return request({
    url: request.adornUrl('/v1/dictType/get'),
    method: 'get',
    params: request.adornParams(params)
  })
}

export const postOrPutDictType = (data = {}) => {
  return request({
    url: request.adornUrl(
      `/v1/dictType/${data.dictTypeId ? 'update' : 'create'}`
    ),
    method: `${data.dictTypeId ? 'put' : 'post'}`,
    data: request.adornData(data)
  })
}

export const deletelDictType = (data = {}) => {
  return request({
    url: request.adornUrl('/v1/dictType/delete'),
    method: 'delete',
    data: request.adornData(data)
  })
}
