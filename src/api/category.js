import request from '@/utils/request'

export const getCategoryInfo = (params = {}) => {
  return request({
    url: request.adornUrl('/v1/categories/get'),
    method: 'get',
    params: request.adornParams(params)
  })
}

export const postOrPutCategory = (data = {}) => {
  return request({
    url: request.adornUrl(
      `/v1/categories/${data.categoryId ? 'update' : 'create'}`
    ),
    method: `${data.categoryId ? 'put' : 'post'}`,
    data: request.adornData(data)
  })
}

export const getCategoryList = (params = {}) => {
  return request({
    url: request.adornUrl('/v1/categories/list'),
    method: 'get',
    params: request.adornParams(params)
  })
}

export const deleteCategory = (params = {}) => {
  return request({
    url: request.adornUrl('/v1/categories/delete'),
    method: 'delete',
    params: request.adornParams(params)
  })
}
