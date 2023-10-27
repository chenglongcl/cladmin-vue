import request from '@/utils/request'

export const getArticleList = (params = {}) => {
  return request({
    url: request.adornUrl('/v1/articles/list'),
    method: 'get',
    params: request.adornParams(params)
  })
}

export const getArticleInfo = (params = {}) => {
  return request({
    url: request.adornUrl('/v1/articles/get'),
    method: 'get',
    params: request.adornParams(params)
  })
}

export const postOrPutArticle = (data = {}) => {
  return request({
    url: request.adornUrl(
      `/v1/articles/${data.articleId ? 'update' : 'create'}`
    ),
    method: `${data.articleId ? 'put' : 'post'}`,
    data: request.adornData(data)
  })
}

export const deleteArticle = (data = {}) => {
  return request({
    url: request.adornUrl('/v1/articles/delete'),
    method: 'delete',
    data: request.adornData(data)
  })
}
