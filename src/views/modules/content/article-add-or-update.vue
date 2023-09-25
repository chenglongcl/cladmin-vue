<template>
  <div>
    <el-form ref="dataForm" :model="dataForm" :rules="rules" class="mod-article" label-position="top" :style="siteContentViewHeight" v-loading="loading" element-loading-text="正在提交中">
      <el-container style="height:100%">
        <el-container>
          <el-main style="padding:0 20px">
            <el-row>
              <el-col :span="24">
                <el-form-item style="margin-bottom: 40px;" prop="title">
                  <MDinput v-model="dataForm.title" :maxlength="16" name="name" required>
                    文章标题
                  </MDinput>
                </el-form-item>
                <el-form-item style="line-height:0" prop="content">
                  <ueditor-ok ref="ueditorOk" :frameHeight="540" @contentHandle="setContent"></ueditor-ok>
                </el-form-item>
              </el-col>
            </el-row>
          </el-main>
          <el-footer>
            <el-form-item>
              <el-button type="primary" @click="dataFormSubmit()">保存</el-button>
              <el-button @click="cancelFormSubmit()">取消</el-button>
            </el-form-item>
          </el-footer>
        </el-container>
        <el-aside width="300px" class="aside">
          <div class="postInfo-container">
            <el-form-item label="所在分类" prop="parentName">
              <el-popover ref="menuListPopover" placement="bottom-start" trigger="click">
                <el-tree :data="menuList" :props="menuListTreeProps" node-key="categoryId" ref="menuListTree" @current-change="menuListTreeCurrentChangeHandle" :default-expand-all="true" :highlight-current="true" :expand-on-click-node="false">
                </el-tree>
              </el-popover>
              <el-input v-model="dataForm.parentName" v-popover:menuListPopover :readonly="true" placeholder="点击选择分类" class="menu-list__input"></el-input>
            </el-form-item>
            <el-form-item label="封面图片" prop="thumb" class="is-required">
              <upload-thumb :defaultUrl="dataForm.thumb" @uploadSuccess="uploadThumbSuccess"></upload-thumb>
            </el-form-item>
            <el-form-item label="发布时间" prop="releaseTime">
              <el-date-picker v-model="dataForm.releaseTime" type="datetime" placeholder="发布时间" class="createTime" value-format="yyyy-MM-dd HH:mm:ss">
              </el-date-picker>
            </el-form-item>
          </div>
        </el-aside>
      </el-container>
    </el-form>
  </div>
</template>

<script>
import MDinput from "@/components/md-input";
import UeditorOk from "@/components/ueditor-ok";
import UploadThumb from "@/components/upload/thumb-one";
import { treeDataTranslate } from "@/utils";
export default {
  data() {
    const validateThumb = (rule, value, callback) => {
      if (value == "") {
        callback(new Error("请上传一张封面图片"));
      } else {
        callback();
      }
    };
    return {
      dataForm: {
        articleId: this.$route.query.id || 0,
        title: "",
        cateId: 0,
        parentName: "",
        thumb: "",
        content: "",
        releaseTime: "",
        userId: 0,
      },
      loading: false,
      menuList: [],
      menuListTreeProps: {
        label: "name",
        children: "children",
      },
      rules: {
        title: [{ required: true, message: "请输入文章标题" }],
        parentName: [
          { required: true, message: "所在分类不能为空", trigger: "change" },
        ],
        content: [
          { required: true, message: "文章内容不能为空", trigger: "change" },
        ],
        thumb: [{ validator: validateThumb }],
      },
    };
  },
  components: { MDinput, UeditorOk, UploadThumb },
  activated() {
    this.getCategoryData();
  },
  computed: {
    documentClientHeight: {
      get() {
        return this.$store.state.common.documentClientHeight;
      },
    },
    siteContentViewHeight() {
      var height = this.documentClientHeight - 50 - 30 - 2 - 40;
      return { height: height + "px" };
    },
    userName: {
      get() {
        return this.$store.state.user.name;
      },
    },
    userId: {
      get() {
        return this.$store.state.user.id;
      },
    },
  },
  methods: {
    getCategoryData() {
      this.$http
        .getCategoryList()
        .then(({ data }) => {
          if (data.code == 0 && data.data) {
            this.menuList = treeDataTranslate(data.data, "categoryId");
          }
        })
        .then(() => {
          if (this.dataForm.articleId) {
            this.$http
              .getArticleInfo({ id: this.dataForm.articleId })
              .then(({ data }) => {
                if (data && data.code === 0) {
                  this.dataForm.articleId = data.data.articleId;
                  this.dataForm.cateId = data.data.cateId;
                  this.dataForm.content = data.data.content;
                  this.dataForm.thumb = data.data.thumb;
                  this.dataForm.title = data.data.title;
                  this.dataForm.releaseTime = data.data.releaseTime;
                  this.menuListTreeSetCurrentNode();
                  this.$refs.ueditorOk.ueContent = this.dataForm.content;
                } else {
                  this.$message.error(data.message);
                  this.$router.go(-1);
                }
              });
          }
        });
    },
    // 菜单树选中
    menuListTreeCurrentChangeHandle(data, node) {
      this.dataForm.cateId = data.categoryId;
      this.dataForm.parentName = data.name;
    },
    // 菜单树设置当前选中节点
    menuListTreeSetCurrentNode() {
      this.$refs.menuListTree.setCurrentKey(this.dataForm.cateId);
      this.dataForm.parentName = (this.$refs.menuListTree.getCurrentNode() ||
        {})["name"];
    },
    uploadThumbSuccess(files) {
      this.dataForm.thumb = files[0].url;
    },
    setContent(content) {
      this.dataForm.content = content;
    },
    cancelFormSubmit() {
      this.$router.go(-1);
    },
    dataFormSubmit() {
      this.dataForm.userId = this.userId;
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          this.loading = true;
          this.$http.postOrPutArticle(this.dataForm).then(({ data }) => {
            this.loading = false;
            if (data && data.code === 0) {
              this.$message({
                message: "操作成功",
                type: "success",
                duration: 1000,
                onClose: () => {
                  this.$router.go(-1);
                },
              });
            } else {
              this.$message.error(data.message);
            }
          });
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.mod-article {
  .aside {
    background-color: #f2f6fc;
    .postInfo-container {
      padding: 20px;
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
      .createTime {
        width: 100%;
      }
    }
  }
}
</style>