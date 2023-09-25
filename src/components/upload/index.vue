<template>
  <el-dialog title="上传文件" :close-on-click-modal="false" :before-close="handleCancel" :visible.sync="visible">
    <el-row type="flex" class="upload-header">
      <el-col :span="16" class="tip">
        已选中{{fileList.length}}个文件，共{{totalFileSize | formatFileSize}}
      </el-col>
      <el-col :span="8" class="btn-group">
        <el-button @click="handleKeepAdding">继续添加</el-button>
        <el-button type="primary" @click="submitUpload">开始上传</el-button>
      </el-col>
    </el-row>
    <el-upload ref="upload" list-type="picture-card" :auto-upload="false" :action="url" :on-change="handleChange" :before-upload="handleBeforeUpload" multiple :headers="headers" :http-request="handleUpload" :on-success="handleSuccess" :accept="accept" :limit="limit">
      <i slot="default" class="el-icon-plus"></i>
      <div slot="file" slot-scope="{file}" class="file-wrapper">
        <el-image v-if="file.status !== 'uploading'" class="el-upload-list__item-thumbnail" :src="file.url" fit="cover">
          <div slot="error" class="image-slot">
            <i class="el-icon-document"></i>
          </div>
        </el-image>
        <!-- <img style="object-fit:cover" class="el-upload-list__item-thumbnail" v-if="file.status !== 'uploading'" :src="file.url" alt=""> -->
        <label class="el-upload-list__item-status-label">
          <i class="el-icon-upload-success el-icon-check"></i>
        </label>
        <el-progress v-if="file.status === 'uploading'" type="circle" :stroke-width="6" :percentage="parseInt(file.percentage, 10)">
        </el-progress>
        <span class="el-upload-list__item-actions">
          <span class="el-upload-list__item-delete" @click="handleRemove(file)">
            <i class="el-icon-delete"></i>
          </span>
        </span>
      </div>
    </el-upload>
    <div style="text-align:right;margin-top:30px">
      <el-button size="mini" @click="handleConfirm">确认</el-button>
      <el-button size="mini" @click="handleCancel">取消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getUUID } from "@/utils";
import dayjs from "dayjs";
import MyOSS from "./oss";
export default {
  props: {
    mimeType: String,
    limit: Number,
    uploadDomain: String,
  },
  data() {
    return {
      visible: false,
      url: "",
      accept: "",
      headers: {
        Authorization: `Bearer ${this.$cookie.get("token")}`,
      },
      num: 0,
      successNum: 0,
      AllowMimeType: [],
      uploadTip: "",
      myOSSClient: null,
      fileList: [],
    };
  },
  computed: {
    totalFileSize() {
      return this.fileList.reduce((total, file) => {
        return total + file.size;
      }, 0);
    },
  },
  methods: {
    async init(id) {
      if (!this.myOSSClient) {
        this.myOSSClient = await new MyOSS().client();
      }
      this.url = this.$http.createUrl(`/v1/upload`);
      this.visible = true;
      let mimeType = [];
      switch (this.mimeType) {
        case "images":
          this.accept = "image/*";
          mimeType = ["jpeg", "jpg", "png", "gif"];
          this.uploadTip = `请上传 ${mimeType.join(",")} 格式文件`;
          mimeType.forEach((value, index) => {
            this.AllowMimeType.push(`image/${value}`);
          });
          break;
        case "videos":
          this.accept = "video/*";
          mimeType = ["mp4", "mov", "mpg", "avi"];
          this.uploadTip = `请上传 ${mimeType.join(",")} 格式文件`;
          mimeType.forEach((value, index) => {
            this.AllowMimeType.push(`video/${value}`);
          });
          break;
        case "audios":
          this.accept = "audio/*";
          mimeType = ["mp4", "mp3"];
          this.uploadTip = `请上传 ${mimeType.join(",")} 格式文件`;
          mimeType.forEach((value, index) => {
            this.AllowMimeType.push(`audio/${value}`);
          });
          break;
        default:
      }
    },
    handleKeepAdding() {
      this.$refs.upload.$refs["upload-inner"].handleClick();
    },
    // 上传之前
    handleBeforeUpload(file) {
      let fileTypeAllow = this.AllowMimeType.find((v) => {
        return v === file.type;
      });
      if (!fileTypeAllow) {
        this.$message.error(this.uploadTip);
        return false;
      }
      this.num++;
    },
    submitUpload() {
      this.$refs.upload.submit();
    },
    handleUpload(e) {
      switch (this.uploadDomain) {
        case "aliyunOss":
          this.uploadToAliyunOss(e);
          break;
        case "aliyunOssBySTS":
          this.uploadToAliyunOssBySTS(e);
          break;
        default:
          this.uploadToLocal(e);
          break;
      }
    },
    uploadToLocal(e) {
      let data = new FormData();
      data.append("file", e.file, e.file.name);
      this.$http
        .postUploadFileToLocal(this.url, data, (progress) => {
          e.onProgress({ percent: progress });
        })
        .then(({ data }) => {
          e.file.url = data.data.url;
          e.file.mimeType = this.mimeType;
          e.onSuccess(data, e.file);
        });
    },
    uploadToAliyunOss(e) {
      let pro = new Promise((resolve, rej) => {
        let res = JSON.parse(this.$cookie.get("aliyunOSSSign"));
        let now = Date.parse(new Date()) / 1000;
        if (res && res.expire - 3 > now) {
          resolve(res);
        } else {
          let oAjax = new XMLHttpRequest();
          oAjax.open(
            "GET",
            this.$http.createUrl("/oss/generatesignature"),
            false
          ); //false表示同步请求
          oAjax.onreadystatechange = () => {
            if (oAjax.readyState == 4 && oAjax.status == 200) {
              this.$cookie.set("aliyunOSSSign", oAjax.responseText);
              let data = JSON.parse(oAjax.responseText);
              resolve(data);
            } else {
              reject(new Error("fail"));
            }
          };
          oAjax.send();
        }
      });
      pro.then((OSSSign) => {
        let ossData = new FormData();
        ossData.append(
          "key",
          `${OSSSign.dir}${getUUID()}.${e.file.name.split(".").pop()}`
        );
        ossData.append("policy", OSSSign.policy);
        ossData.append("OSSAccessKeyId", OSSSign.accessid);
        ossData.append("signature", OSSSign.signature);
        ossData.append("file", e.file, e.file.name);
        this.$http
          .postUploadFileToOSS(OSSSign.host, ossData, (progress) => {
            e.onProgress({ percent: progress });
          })
          .then(({ data }) => {
            e.file.url = `${OSSSign.host}/${ossData.get("key")}`;
            e.file.mimeType = this.mimeType;
            e.onSuccess(data, e.file);
          });
      });
    },
    uploadToAliyunOssBySTS(e) {
      const options = {
        progress: (p, cpt, res) => {
          e.onProgress({ percent: Math.floor(p * 100) });
        },
        partSize: 500 * 1024,
        timeout: 60000,
      };
      const key = `${dayjs().format("YYYYMMDD")}/${getUUID()}.${e.file.name
        .split(".")
        .pop()}`;
      this.myOSSClient
        .multipartUpload(key, e.file, options)
        .then((res) => {
          e.file.url = `https://${this.myOSSClient.options.bucket}.${this.myOSSClient.options.region}.aliyuncs.com/${res.name}`;
          e.file.mimeType = this.mimeType;
          e.onSuccess(res, e.file);
        })
        .catch((err) => {
          if (this.myOSSClient && this.myOSSClient.isCancel()) {
            console.log("stop-upload!");
          } else {
            console.error(err);
            console.log(`err.name : ${err.name}`);
            console.log(`err.message : ${err.message}`);
          }
        });
    },
    handleChange(file, fileList) {
      this.fileList = fileList;
    },
    // 上传成功
    handleSuccess(response, file) {},
    // 确认
    handleConfirm() {
      let fileNoUploaded = this.fileList.filter((file) => {
        return file.status === "ready";
      });
      if (fileNoUploaded.length > 0) {
        this.$message.error(
          `有${fileNoUploaded.length}个未上传的文件，请先上传。`
        );
        return;
      }
      let fileList = this.fileList.filter((file) => {
        return file.status === "success";
      });
      this.$emit("uploadSuccess", fileList);
      this.clearFiles();
      this.visible = false;
    },
    //取消
    handleCancel(done) {
      let fileUploading = this.fileList.filter((file) => {
        return file.status === "uploading" || file.status === "ready";
      });
      if (fileUploading.length > 0) {
        this.$confirm(
          `有${fileUploading.length}个文件正在或等待上传，是否取消？`,
          "提示",
          {
            confirmButtonText: "取消上传",
            cancelButtonText: "继续上传",
            type: "warning",
          }
        )
          .then(() => {
            this.myOSSClient && this.myOSSClient.cancel();
            this.clearFiles();
          })
          .catch(() => {});
        return;
      }
      this.myOSSClient && this.myOSSClient.cancel();
      this.clearFiles();
      this.visible = false;
    },
    handleRemove(file) {
      this.$refs.upload.handleRemove(file);
    },
    clearFiles() {
      this.fileList = [];
      this.$refs.upload.clearFiles();
    },
  },
};
</script>

<style lang="scss" scoped>
.upload-header {
  margin-top: -30px;
  margin-bottom: 20px;
  .tip {
    line-height: 2.5;
  }
  .btn-group {
    text-align: right;
  }
}
.file-wrapper {
  width: 100%;
  height: 100%;
  /deep/ .image-slot {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background: #f5f7fa;
    color: #909399;
    font-size: 40px;
  }
}
</style>