import OSS from 'ali-oss'
import { setSTSToken } from 'ali-oss/lib/common/utils/setSTSToken'
import { isFunction } from 'ali-oss/lib/common/utils/isFunction'
import { createRequest } from 'ali-oss/lib/common/utils/createRequest'
import { isFile } from 'ali-oss/lib/common/utils/isFile'
import { isBuffer } from 'ali-oss/lib/common/utils/isBuffer'
import path from 'path'
import mime from 'mime'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import request from '@/utils/request'

dayjs.extend(utc)

export default class {
  ossClient;
  async client(region, bucket) {
    const { data } = await request({
      url: request.adornUrl('/sts/assumeRole'),
      method: 'get',
      params: request.adornParams({})
    })
    if (data.code === 0) {
      this.ossClient = new OSS({
        region: region || data.data.region,
        bucket: bucket || data.data.bucket,
        accessKeyId: data.data.accessKeyId,
        accessKeySecret: data.data.accessKeySecret,
        stsToken: data.data.securityToken,
        refreshSTSToken: async() => {
          const { data } = await request({
            url: request.adornUrl('/sts/assumeRole'),
            method: 'get',
            params: request.adornParams({})
          })
          return {
            accessKeyId: data.data.accessKeyId,
            accessKeySecret: data.data.accessKeySecret,
            stsToken: data.data.securityToken
          }
        },
        refreshSTSTokenInterval: 300000
      })
      return this.ossClient
    }
    return null
  }

  createMultipartUploadHeader(chunk, options) {
    if (
      this.ossClient.options.stsToken &&
      isFunction(this.ossClient.options.refreshSTSToken)
    ) {
      setSTSToken.call(this.ossClient)
    }
    const { file } = chunk.file
    options = options || {}
    if (!options.mime) {
      if (isFile(file)) {
        options.mime = mime.getType(path.extname(file.name))
      } else if (isBuffer(file)) {
        options.mime = ''
      } else {
        options.mime = mime.getType(path.extname(file))
      }
    }
    options.headers = options.headers || {}
    this.ossClient._convertMetaToHeaders(options.meta, options.headers)
    options.subres = {
      partNumber: chunk.getParams().chunkNumber,
      uploadId: chunk.file.uploadId
    }
    const params = this.ossClient._objectRequestParams(
      'PUT',
      chunk.file.key,
      options
    )
    params.mime = options.mime
    const cr = createRequest.call(this.ossClient, params)
    const { headers } = cr.params
    return headers
  }

  createListPartsHeader(chunk, options) {
    if (
      this.ossClient.options.stsToken &&
      isFunction(this.ossClient.options.refreshSTSToken)
    ) {
      setSTSToken.call(this.ossClient)
    }
    options = options || {}
    options.subres = {
      uploadId: chunk.file.uploadId
    }
    options.headers = options.headers || {}
    const params = this.ossClient._objectRequestParams(
      'GET',
      chunk.file.key,
      options
    )
    const cr = createRequest.call(this.ossClient, params)
    const { headers } = cr.params
    return headers
  }
}
