import request from '@/utils/request'

export const getBulletinList = (params = {}) => {
  return request({
    url: request.adornUrl('/v1/bulletin/list'),
    method: 'get',
    params: request.adornParams(params)
  })
}
