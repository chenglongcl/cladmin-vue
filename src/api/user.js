import request from '@/utils/request'

export const getPersonalUserInfo = (params = {}) => {
  return request({
    url: request.adornUrl('/v1/users/personal'),
    method: 'get',
    params: request.adornParams(params)
  })
}

export const putPersonalUserInfo = (data = {}) => {
  return request({
    url: request.adornUrl(`/v1/users/updatePersonal`),
    method: 'put',
    data: request.adornData(data)
  })
}

export const getUserInfo = (params = {}) => {
  return request({
    url: request.adornUrl('/v1/users/get'),
    method: 'get',
    params: request.adornParams(params)
  })
}

export const postOrPutUser = (data = {}) => {
  return request({
    url: request.adornUrl(
      `/v1/users/${data.userId ? 'update' : 'create'}`
    ),
    method: `${data.userId ? 'put' : 'post'}`,
    data: request.adornData(data)
  })
}

export const deleteUser = (data = {}) => {
  return request({
    url: request.adornUrl('/v1/users/delete'),
    method: 'delete',
    data: request.adornData(data)
  })
}

export const postLogoutUser = (data = {}) => {
  return request({
    url: request.adornUrl('/v1/users/logout'),
    method: 'post',
    data: request.adornData(data)
  })
}

export const getUserList = (params = {}) => {
  return request({
    url: request.adornUrl('/v1/users/list'),
    method: 'get',
    params: request.adornParams(params)
  })
}
