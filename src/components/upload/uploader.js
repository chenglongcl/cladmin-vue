import httpRequest from '@/utils/httpRequest'
import path from 'path';
import mime from 'mime'
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import xml from "xml2js";
dayjs.extend(utc)

function getHeader(headers, name) {
  return headers[name] || headers[name.toLowerCase()];
}

function delHeader(headers, name) {
  delete headers[name];
  delete headers[name.toLowerCase()];
}

export default class {
  constructor() {}
  async initMultipartUpload(object, options) {
    options = options || {}
    options.headers = options.headers || {};
    options.headers["Accept"] = "*/*"
    if (!getHeader(options.headers, "Content-Type")) {
      options.headers["Content-Type"] = mime.getType(path.extname(object || ''));
    }
    if (!getHeader(options.headers, "Content-Type")) {
      delHeader(options.headers, "Content-Type");
    }
    const {
      data
    } = await httpRequest({
      url: httpRequest.adornUrl(`/multipartUpload/${object}`),
      headers: options.headers,
      method: 'post',
      data: "",
      params: httpRequest.adornParams({})
    })
    const result = await this.parseXML(data)
    return {
      name: result.Key,
      uploadId: result.UploadId,
      requestUrl: result.RequestUrl,
      fileUrl: result.Location
    };
  }
  async completeMultipartUpload(object, uploadId, parts) {
    const completeParts = parts
      .concat()
      .sort((a, b) => a.number - b.number)
      .filter((item, index, arr) => !index || item.number !== arr[index - 1].number);
    let xmlData = '<?xml version="1.0" encoding="UTF-8"?>\n<CompleteMultipartUpload>\n';
    for (let i = 0; i < completeParts.length; i++) {
      const p = completeParts[i];
      xmlData += '<Part>\n';
      xmlData += `<PartNumber>${p.number}</PartNumber>\n`;
      xmlData += `<ETag>${p.etag}</ETag>\n`;
      xmlData += '</Part>\n';
    }
    xmlData += '</CompleteMultipartUpload>';
    return await httpRequest({
      url: httpRequest.adornUrl(`/multipartUpload/${object}`),
      headers: {
        "Content-Type": "application/xml"
      },
      data: xmlData,
      method: 'post',
      params: httpRequest.adornParams({
        uploadId
      })
    })
  }
  createListPartsHeader(chunk, options) {

  }
  parseXML(str) {
    return new Promise((resolve, reject) => {
      if (Buffer.isBuffer(str)) {
        str = str.toString();
      }
      xml.parseString(
        str, {
          explicitRoot: false,
          explicitArray: false
        },
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
  };
}
