import request from '@/utils/request'

export const getDictDataList = (params = {}) => {
  return request({
    url: request.adornUrl('/v1/dictData/list'),
    method: 'get',
    params: request.adornParams(params)
  })
}

export const getDictDataInfo = (params = {}) => {
  return request({
    url: request.adornUrl('/v1/dictData/get'),
    method: 'get',
    params: request.adornParams(params)
  })
}

export const postOrPutDictData = (data = {}) => {
  return request({
    url: request.adornUrl(
      `/v1/dictData/${data.dictDataId ? 'update' : 'create'}`
    ),
    method: `${data.dictDataId ? 'put' : 'post'}`,
    data: request.adornData(data)
  })
}

export const deleteDictData = (data = {}) => {
  return request({
    url: request.adornUrl('/v1/dictData/delete'),
    method: 'delete',
    data: request.adornData(data)
  })
}
