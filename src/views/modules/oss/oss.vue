<template>
  <div class="mod-oss">
    <el-form :inline="true" :model="dataForm">
      <el-form-item>
        <el-button type="primary" @click="handleConfig()">
          阿里云存储配置
        </el-button>
        <el-button type="primary" @click="handleConfigAliYunSTS()">
          阿里云STS配置
        </el-button>
        <el-button type="primary" @click="handleUploaderOSS()">
          上传文件OSS(STS认证)
        </el-button>
        <el-button type="primary" @click="handleUploaderLocal()">
          上传文件本地
        </el-button>
      </el-form-item>
    </el-form>
    <!-- 弹窗, 云存储配置 -->
    <config v-if="configVisible" ref="config" />
    <!-- 弹窗, 阿里云STS配置 -->
    <STSConfig v-if="configAliYunSTSVisible" ref="stsConfig" />
    <!--弹窗, 上传文件OSS-->
    <UploaderOSS v-if="uploaderVisible" ref="uploaderOSS" :limit="8" :input-attrs="{}" @on-success-files="handleSuccessFiles" @on-fail-files="handleFailFiles" />
    <!--弹窗, 上传文件本地-->
    <UploaderLocal v-if="uploaderLocalVisible" ref="uploaderLocal" :limit="18" :input-attrs="{}" @on-success-files="handleSuccessFiles" @on-fail-files="handleFailFiles" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import Config from './oss-config'
import STSConfig from './sts-config'
import UploaderOSS from '@/components/upload/uploader-oss'
import UploaderLocal from '@/components/upload/uploader-local'

export default {
  components: {
    Config,
    STSConfig,
    UploaderOSS,
    UploaderLocal
  },
  data() {
    return {
      dataForm: {},
      configVisible: false,
      configAliYunSTSVisible: false,
      uploadVisible: false,
      uploaderVisible: false,
      uploaderLocalVisible: false,
      images: [],
      videos: [],
      audios: [],
      doucments: [],
      fileList: [],
      updateOptions: {
        region: 'oss-cn-shanghai',
        bucket: 'aisyweixinpic',
        path: dayjs().format('YYYYMMDD')
      }
    }
  },
  methods: {
    // 云存储配置
    handleConfig() {
      this.configVisible = true
      this.$nextTick(() => {
        this.$refs.config.init()
      })
    },
    // STS配置
    handleConfigAliYunSTS() {
      this.configAliYunSTSVisible = true
      this.$nextTick(() => {
        this.$refs.stsConfig.init()
      })
    },
    // 上传文件OSS
    handleUploaderOSS() {
      this.uploaderVisible = true
      this.$nextTick(() => {
        this.$refs.uploaderOSS.init()
      })
    },
    // 上传文件本地
    handleUploaderLocal() {
      this.uploaderLocalVisible = true
      this.$nextTick(() => {
        this.$refs.uploaderLocal.init()
      })
    },
    // 上传成功
    handleSuccessFiles(files) {
      console.log('上传成功的文件', files)
    },
    // 上传失败
    handleFailFiles(files) {
      console.log('上传失败的文件', files)
    },
    //
    uploadSuccess(fileList) {
      fileList.forEach((file, index, arr) => {
        this[file.raw.mimeType].push(file.raw.url)
      })
    },
    handleCloseUpload() {
      this.fileList = []
    },
    handleConfirm(files) {
      console.log(files)
    }
  }
}
</script>
