import request from '@/utils/request'

export const getRefreshToken = (params = {}) => {
  return request({
    url: request.adornUrl('/refresh'),
    method: 'get',
    params: request.adornParams(params)
  })
}

export const postLogin = (data = {}) => {
  return request({
    url: request.adornUrl('/login'),
    method: 'post',
    data: request.adornData(data)
  })
}

export const getLogout = (params = {}) => {
  return request({
    url: request.adornUrl('/logout'),
    method: 'get',
    params: request.adornParams(params)
  })
}
