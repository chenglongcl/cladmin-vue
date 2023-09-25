<template>
  <div class="mod-oss">
    <el-form :inline="true" :model="dataForm">
      <el-form-item>
        <el-button type="primary" @click="configHandle()">云存储配置</el-button>
        <el-button type="primary" @click="configAliYunSTSHandle()">阿里云STS配置</el-button>
        <el-button type="primary" @click="uploadHandle()">上传文件</el-button>
        <el-button type="primary" @click="handleUploaderOSS()">上传文件OSS</el-button>
        <el-button type="primary" @click="handleUploaderLocal()">上传文件本地</el-button>
      </el-form-item>
    </el-form>
    <!-- 弹窗, 云存储配置 -->
    <config v-if="configVisible" ref="config"></config>
    <!-- 弹窗, 阿里云STS配置 -->
    <STSConfig v-if="configAliYunSTSVisible" ref="stsConfig"></STSConfig>
    <!-- 弹窗, 上传文件 -->
    <upload v-if="uploadVisible" ref="upload" @uploadSuccess="uploadSuccess" :mimeType="'videos'" :uploadDomain="'aliyunOssBySTS'"></upload>
    <!---->
    <UploaderOSS v-if="uploaderVisible" ref="uploaderOSS" :limit="8" :inputAttrs="{}" @on-success-files="handleSuccessFiles" @on-fail-files="handleFailFiles"></UploaderOSS>
    <!---->
    <UploaderLocal v-if="uploaderLocalVisible" ref="uploaderLocal" :limit="18" :inputAttrs="{}" @on-success-files="handleSuccessFiles" @on-fail-files="handleFailFiles"></UploaderLocal>
  </div>
</template>

<script>
import Config from "./oss-config";
import STSConfig from "./sts-config";
import Upload from "@/components/upload";
import UploaderOSS from "@/components/upload/uploader-oss";
import UploaderLocal from "@/components/upload/uploader";
import dayjs from "dayjs";
export default {
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
        region: "oss-cn-shanghai",
        bucket: "aisyweixinpic",
        path: dayjs().format("YYYYMMDD"),
      },
    };
  },
  components: {
    Config,
    Upload,
    STSConfig,
    UploaderOSS,
    UploaderLocal,
  },
  methods: {
    // 云存储配置
    configHandle() {
      this.configVisible = true;
      this.$nextTick(() => {
        this.$refs.config.init();
      });
    },
    // STS配置
    configAliYunSTSHandle() {
      this.configAliYunSTSVisible = true;
      this.$nextTick(() => {
        this.$refs.stsConfig.init();
      });
    },
    // 上传文件
    uploadHandle() {
      this.uploadVisible = true;
      this.$nextTick(() => {
        this.$refs.upload.init();
      });
    },
    // 上传文件OSS
    handleUploaderOSS() {
      this.uploaderVisible = true;
      this.$nextTick(() => {
        this.$refs.uploaderOSS.init();
      });
    },
    //上传文件本地
    handleUploaderLocal() {
      this.uploaderLocalVisible = true;
      this.$nextTick(() => {
        this.$refs.uploaderLocal.init();
      });
    },
    //上传成功
    handleSuccessFiles(files) {
      console.log("上传成功的文件", files);
    },
    //上传失败
    handleFailFiles(files) {
      console.log("上传失败的文件", files);
    },
    //
    uploadSuccess(fileList) {
      fileList.forEach((file, index, arr) => {
        this[file.raw.mimeType].push(file.raw.url);
      });
    },
    handleCloseUpload() {
      this.fileList = [];
    },
    handleConfirm(files) {
      console.log(files);
    },
  },
};
</script>
