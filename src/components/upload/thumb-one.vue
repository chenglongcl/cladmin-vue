<template>
  <div>
    <div class="thumb">
      <img :src='defaultUrl?defaultUrl:"/static/img/thumb_fakeimg.png"' alt="">
    </div>
    <el-button @click="handleUpload()">上传图片</el-button>
    <!-- 弹窗, 上传文件 -->
    <UploaderOSS v-if="uploaderVisible" ref="uploaderOSS" :limit="uploaderLimit" :inputAttrs="uploaderInputAtrrs" @on-success-files="handleSuccessFiles" @on-fail-files="handleFailFiles"></UploaderOSS>
  </div>
</template>

<script>
import UploaderOSS from "@/components/upload/uploader-oss";
export default {
  props: {
    defaultUrl: String,
  },
  components: { UploaderOSS },
  data() {
    return {
      url: "",
      uploaderVisible: false,
      uploaderInputAtrrs: {
        accept: "image/*",
      },
      uploaderLimit: 1,
    };
  },
  computed: {
    thumbUrl() {
      let url;
      switch (true) {
        case this.url != "":
          url = this.url;
          break;
        case this.defaultUrl != "" && this.url == "":
          url = this.defaultUrl;
          break;
        default:
          url = "/static/img/thumb_fakeimg.png";
          break;
      }
      return url;
    },
  },
  methods: {
    // 上传文件
    handleUpload() {
      this.uploaderVisible = true;
      this.$nextTick(() => {
        this.$refs.uploaderOSS.init();
      });
    },
    //上传成功
    handleSuccessFiles(files) {
      console.log("上传成功的文件", files);
      this.$emit("uploadSuccess", files);
    },
    //上传失败
    handleFailFiles(files) {
      console.log("上传成失败的文件", files);
      this.$emit("uploadFail", files);
    },
  },
};
</script>

<style lang="scss" scoped>
.thumb {
  width: 260px;
  height: 145px;
  overflow: hidden;
  margin-bottom: 10px;
  img {
    width: 100%;
    height: 100%;
  }
}
</style>
