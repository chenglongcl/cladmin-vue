<template>
  <div>
    <quill-editor v-model="content" ref="myQuillEditor" :options="editorOption" @blur="onEditorBlur($event)" @focus="onEditorFocus($event)" @ready="onEditorReady($event)" @change="onEditorChange($event)">
    </quill-editor>
    <!-- 弹窗, 上传文件 -->
    <upload v-if="uploadVisible" ref="upload" @uploadSuccess="uploadSuccess" @removeFile="removeFile" :mimeType="mimeType"></upload>
  </div>
</template>
<script>
import Upload from "@/components/aliyun-oss/upload";
import * as Quill from "quill";
export default {
  name: "QuillEditorOk",
  props: {
    editorOption: Object,
  },
  components: { Upload },
  data() {
    return {
      addRange: {},
      mimeType: "",
      content: "",
      uploadType: "",
      uploadVisible: false,
    };
  },
  mounted() {
    // 为图片ICON绑定事件  getModule 为编辑器的内部属性
    this.$refs.myQuillEditor.quill
      .getModule("toolbar")
      .addHandler("image", this.imgHandler);
    this.$refs.myQuillEditor.quill
      .getModule("toolbar")
      .addHandler("video", this.videoHandler); // 为视频ICON绑定事件
  },
  methods: {
    imgHandler(state) {
      this.addRange = this.$refs.myQuillEditor.quill.getSelection();
      if (state) {
        this.uploadVisible = true;
        this.$nextTick(() => {
          this.$refs.upload.init();
        });
      }
      this.uploadType = "image";
      this.mimeType = "images";
    },
    //上传成功
    uploadSuccess(info) {
      if (info.url != null && info.url.length > 0) {
        // 将文件上传后的URL地址插入到编辑器文本中
        let value = info.url;
        //this.addRange = this.$refs.myQuillEditor.quill.getSelection();
        value = value.indexOf("http") !== -1 ? value : "http:" + value;
        this.$refs.myQuillEditor.quill.insertEmbed(
          this.addRange !== null ? this.addRange.index : 0,
          this.uploadType,
          value,
          Quill.sources.USER
        ); // 调用编辑器的 insertEmbed 方法，插入URL
      } else {
      }
    },
    //移除上传文件
    removeFile(info) {
      console.log("remove file");
      console.log(info);
    },
    onEditorBlur(quill) {
      console.log("editor blur!", quill);
    },
    onEditorFocus(quill) {
      console.log("editor focus!", quill);
    },
    onEditorReady(quill) {
      console.log("editor ready!", quill);
    },
    onEditorChange({ quill, html, text }) {
      console.log("editor change!", quill, html, text);
      this.content = html;
    },
  },
};
</script>

<style lang="scss">
.quill-editor {
  .ql-container {
    height: 480px;
  }
}

.limit {
  height: 30px;
  border: 1px solid #ccc;
  line-height: 30px;
  text-align: right;

  span {
    color: #ee2a7b;
  }
}

.ql-snow .ql-editor img {
  max-width: 480px;
}

.ql-editor .ql-video {
  max-width: 480px;
}
</style>
