<template>
  <el-dialog title="上传文件" :close-on-click-modal="false" :before-close="handleClose" :visible.sync="uploaderVisible">
    <uploader ref="uploader" :key="uploaderKey" :auto-start="false" :options="options" :file-status-text="fileStatusText" class="uploader-warpper" @file-progress="handleFileProgress" @file-added="handleFileAdded" @file-error="handleFileError" @file-success="handleSuccess">
      <uploader-unsupport />
      <uploader-drop v-if="fileList.length === 0" class="drop-warpper">
        <div class="panel">
          <p class="tip">
            点击选择素材或拖拽到本区域
          </p>
          <div>
            <uploader-btn :attrs="inputAttrs">
              点击选择素材
            </uploader-btn>
          </div>
        </div>
      </uploader-drop>
      <template v-else>
        <div class="upload-header btn-group">
          <div class="btn-warpper">
            <uploader-btn class="custom-btn" :attrs="inputAttrs">
              <i class="el-icon-plus" /> <span>继续添加</span>
            </uploader-btn>
          </div>
          <el-button size="mini" type="primary" icon="el-icon-upload" @click="handleUpload()">
            开始上传
          </el-button>
        </div>
        <el-scrollbar class="cd-scrollbar">
          <uploader-list />
        </el-scrollbar>
        <div class="upload-footer btn-group">
          <span style="float: left; line-height: 2.3">{{ uploader.fileList.length }}个文件，{{
            stat.sizeUploaded | formatFileSize
          }}
            / {{ uploader.getFormatSize() }}，上传成功{{
              stat.numberOfSuccessFiles
            }}个，失败{{ stat.numberOfFailFiles }}个。</span>
          <el-button v-debounce="{fun: 'handleConfirm', event: 'click', wait: 500}" size="mini">
            确认
          </el-button>
          <el-button size="mini" @click="handleClose">
            取消
          </el-button>
        </div>
      </template>
    </uploader>
  </el-dialog>
</template>

<script>
import dayjs from 'dayjs'
import { parseString } from 'xml2js'
import MyOSS from './js/oss'
import { getUUID } from '@/utils'
import { typeid } from 'typeid-js'

export default {
  name: 'UploaderOSS',
  props: {
    limit: {
      type: Number,
      default: 0
    },
    inputAttrs: {
      type: Object,
      default: () => {
        return {
          accept: ''
        }
      }
    }
  },
  data() {
    const myOSS = new MyOSS()
    return {
      uploaderVisible: false,
      uploader: null,
      uploaderKey: dayjs().valueOf(),
      fileList: [],
      myOSS,
      ossClient: null,
      options: {
        target: (file, chunk, testMode) => {
          const url = `${file.requestUrl}?uploadId=${file.uploadId}`
          if (testMode) {
            return url
          }
          return `${url}&partNumber=${chunk.getParams().chunkNumber}`
        },
        headers: (file, chunk, testMode) => {
          if (testMode) {
            return myOSS.createListPartsHeader(chunk)
          }
          return myOSS.createMultipartUploadHeader(chunk)
        },
        processParams: (params) => {
          // 删除多余参数
          return {}
        },
        processResponse: (response, cb, file, chunk) => {
          if (chunk.xhr.status === 200) {
            const etag = chunk.xhr
              .getResponseHeader('etag')
              .replace(new RegExp('"', 'g'), '')
            file.multipartUploadParts.push({
              number: chunk.getParams().chunkNumber,
              etag
            })
            cb(null, response)
          } else {
            // 失败
            cb(true, response)
          }
        },
        method: 'octet',
        uploadMethod: 'PUT',
        testChunks: true,
        checkChunkUploadedByResponse: (chunk, message) => {
          let uploadedChunks = []
          parseString(message, { explicitArray: false }, (err, result) => {
            if (err) {
              return false
            }
            if (
              Object.prototype.toString.call(result.ListPartsResult.Part) ===
              '[object Array]'
            ) {
              uploadedChunks = result.ListPartsResult.Part.map((item) => {
                return parseInt(item.PartNumber)
              })
            }
          })
          const part = chunk.file.multipartUploadParts.find((item) => {
            return item.number === chunk.getParams().chunkNumber
          })
          return (
            // 本地和oss都有分片记录，则认为已上传
            uploadedChunks.indexOf(chunk.getParams().chunkNumber) >= 0 &&
            part !== undefined
          )
        },
        parseTimeRemaining: (timeRemaining, parsedTimeRemaining) => {
          return parsedTimeRemaining
            .replace(/\syears?/, '年')
            .replace(/\days?/, '天')
            .replace(/\shours?/, '小时')
            .replace(/\sminutes?/, '分钟')
            .replace(/\sseconds?/, '秒')
        }
      },
      fileStatusText: {
        success: '完成',
        error: '失败，请重试',
        uploading: '上传中',
        paused: '等待上传',
        waiting: '等待上传'
      },
      stat: {
        numberOfSuccessFiles: 0,
        numberOfFailFiles: 0,
        sizeUploaded: 0
      }
    }
  },
  computed: {},
  watch: {
    uploaderVisible: {
      handler(val) {
        if (!val) {
          this.uploader.cancel()
          Object.assign(this.$data, this.$options.data.call(this))
          this.$emit('on-close')
        }
      }
    }
  },
  methods: {
    async init(id) {
      this.uploaderVisible = true
      this.uploaderKey = dayjs().valueOf()
      this.ossClient = await this.myOSS.client()
      this.$nextTick(() => {
        this.uploader = this.$refs.uploader.uploader
        this.fileList = this.uploader.fileList
      })
    },
    async handleFileAdded(file) {
      if (this.limit && this.fileList.length > this.limit) {
        file.ignored = true
        setTimeout(() => {
          this.$message({
            message: `最多上传${this.limit}个文件`,
            type: 'warning'
          })
        }, 100)
        return
      }
      const fileUniqueId = typeid().toString()
      const objectName = `${
        file.fileType.split('/')[0] || 'other'
      }/${dayjs().format('YYYYMMDD')}/${getUUID()}.${file.getExtension()}`
      try {
        const initResult = await this.ossClient.initMultipartUpload(
          objectName,
          {
            meta: {
              'unique-id': fileUniqueId
            }
          }
        )
        file.bucket = initResult.bucket
        file.key = initResult.name
        file.uniqueId = fileUniqueId
        file.uploadId = initResult.uploadId
        file.multipartUploadParts = []
        file.requestUrl = `${initResult.res.requestUrls[0].split('?')[0]}`
      } catch (error) {
        console.log(error)
        file.ignored = true
        this.uploader.removeFile(file)
        this.$message.error('初始化失败，请检查阿里云STS AssumeRole配置')
        return
      }
      const ele = document.querySelector('.cd-scrollbar .el-scrollbar__wrap')
      ele.scrollTop = ele.scrollHeight
    },
    handleUpload() {
      this.uploader.resume()
    },
    handleFileProgress() {
      this.handleStat()
    },
    async handleFileError(rootFile, file, message, chunk) {
      // 此处设置_firstResponse参数，解决特定条件下的BUG
      file._firstResponse = undefined
      file.params = await this.handleCombParams(file)
      this.handleStat()
    },
    async handleSuccess(rootFile, file, message, chunk) {
      await this.ossClient.completeMultipartUpload(
        file.key,
        file.uploadId,
        file.multipartUploadParts
      )
      file.params = await this.handleCombParams(file)
      this.handleStat()
    },
    handleConfirm() {
      const unCompleteFiles = this.fileList.filter((file) => {
        return !file.isComplete() && !file.error
      })
      if (unCompleteFiles.length > 0) {
        this.$message({
          message: `有${unCompleteFiles.length}个文件未完成上传，请先上传。`,
          type: 'warning'
        })
        return
      }
      const successFiles = []
      const failFiles = []
      this.fileList.forEach((file, index) => {
        if (file.isComplete()) {
          successFiles.push(file.params)
        } else if (file.error) {
          failFiles.push(file.params)
        }
      })
      this.$emit('on-success-files', successFiles)
      this.$emit('on-fail-files', failFiles)
      this.uploaderVisible = false
    },
    // 弹窗关闭时
    handleClose(done) {
      const { fileList } = this.uploader
      const unCompleteFiles = fileList.filter((file) => {
        return !file.isComplete()
      })
      if (unCompleteFiles.length > 0) {
        this.uploader.pause()
        this.$confirm(
          `有${unCompleteFiles.length}个文件未完成上传，是否取消？`,
          '提示',
          {
            confirmButtonText: '取消上传',
            cancelButtonText: '继续上传',
            type: 'warning',
            showClose: false,
            distinguishCancelAndClose: true
          }
        )
          .then(() => {
            if (typeof done === 'function') {
              done()
            } else {
              this.uploaderVisible = false
            }
          })
          .catch((action) => {
            if (action === 'cancel') {
              this.uploader.resume()
            }
          })
      } else if (typeof done === 'function') {
        done()
      } else {
        this.uploaderVisible = false
      }
    },
    handleStat() {
      let numberOfSuccessFiles = 0
      let numberOfFailFiles = 0
      this.fileList.forEach((file) => {
        if (file.isComplete()) {
          numberOfSuccessFiles++
        }
        if (file.error) {
          numberOfFailFiles++
        }
      })
      this.stat.numberOfSuccessFiles = numberOfSuccessFiles
      this.stat.numberOfFailFiles = numberOfFailFiles
      this.stat.sizeUploaded = this.uploader.sizeUploaded()
    },
    async handleCombParams(file) {
      let params = {}
      try {
        params = await this.handleMediaRes(file.fileType.split('/')[0])(file)
      } catch (error) {
        console.log(`${file.name}:获取文件信息失败-不支持的文件类型`)
      }
      return {
        fileUniqueId: file.uniqueId,
        fileName: file.name,
        fileDescription: '',
        key: file.key,
        contentType: file.fileType || 'application/octet-stream',
        contentLength: file.size,
        url: file.requestUrl,
        ...params
      }
    },
    handleMediaRes(type) {
      return {
        async image(file) {
          return new Promise((resolve) => {
            const reader = new FileReader()
            reader.onload = function(e) {
              const data = e.target.result
              // 加载图片获取图片真实宽度和高度
              const image = new Image()
              image.onload = function() {
                resolve({
                  width: this.width,
                  height: this.height
                })
              }
              image.src = data
            }
            reader.readAsDataURL(file.file)
          })
        },
        async audio(file) {
          return new Promise((resolve) => {
            const audioUrl = URL.createObjectURL(file.file)
            const audio = document.createElement('audio')
            audio.src = audioUrl
            audio.onloadeddata = function() {
              resolve({
                duration: parseInt(this.duration * 1000)
              })
            }
            audio.onerror = function() {
              resolve({})
            }
          })
        },
        async video(file) {
          return new Promise((resolve) => {
            const videoUrl = URL.createObjectURL(file.file)
            const video = document.createElement('video')
            video.src = videoUrl
            video.onloadeddata = function() {
              resolve({
                coverImg: `${file.requestUrl}?x-oss-process=video/snapshot,t_3000,f_jpg`,
                duration: parseInt(this.duration * 1000),
                width: this.videoWidth,
                height: this.videoHeight
              })
            }
            video.onerror = function() {
              resolve({})
            }
          })
        }
      }[type]
    }
  }
}
</script>

<style lang="scss" scoped>
.uploader-warpper {
  font-size: 12px;
  height: 400px;
  .drop-warpper {
    margin-top: -20px;
    position: relative;
    padding: 0;
    height: 100%;
    text-align: center;
    background-color: #fff;
    border: 1px dashed $--color-primary;
    font-size: 16px;
    .panel {
      position: absolute;
      left: 50%;
      top: 20%;
      transform: translateX(-50%);
      .tip {
        color: #999;
      }
      .uploader-btn {
        color: #fff;
        height: 40px;
        width: 120px;
        line-height: 30px;
        border-radius: 3px;
        background-color: $--color-primary;
        border: none;
      }
    }
  }
  .upload-header.btn-group {
    margin-top: -20px;
    margin-bottom: 10px;
    .btn-warpper {
      display: inline-block;
      cursor: not-allowed;
      &.disabled {
        label.custom-btn {
          pointer-events: none;
          color: #c0c4cc;
          background-image: none;
          background-color: #fff;
          border-color: #ebeef5;
        }
      }
    }

    .custom-btn {
      display: inline-block;
      line-height: 1;
      white-space: nowrap;
      cursor: pointer;
      background: #fff;
      border: 1px solid #dcdfe6;
      color: #606266;
      text-align: center;
      -webkit-box-sizing: border-box;
      box-sizing: border-box;
      outline: 0;
      margin: 0;
      -webkit-transition: 0.1s;
      transition: 0.1s;
      font-weight: 500;
      padding: 7px 15px;
      font-size: 12px;
      border-radius: 3px;
      height: 28.5px;
      margin-right: 10px;
      span {
        margin-left: 5px;
      }
    }
  }
  .upload-footer.btn-group {
    margin-top: 20px;
    text-align: right;
  }
  .cd-scrollbar {
    height: 310px;
    ::v-deep .el-scrollbar__wrap {
      overflow-x: hidden;
    }
  }
}
::v-deep .uploader-file-icon {
  font-family: element-icons !important;
  &::before {
    content: '\e77d';
  }
  &[icon='folder']::before {
    content: '\e78a';
  }
  &[icon='image']::before {
    content: '\e75e';
  }
  &[icon='video']::before {
    content: '\e772';
  }
  &[icon='audio']::before {
    content: '\e76f';
  }
  &[icon='document']::before {
    content: '\e785';
  }
}
</style>
