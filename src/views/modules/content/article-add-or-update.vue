<template>
  <el-form ref="dataForm" v-loading="loading" :model="dataForm" :rules="rules" class="mod-article" label-position="top" element-loading-text="正在提交中">
    <splitpanes class="default-theme" :style="siteContentViewHeight">
      <pane max-size="74" size="74" class="left-container">
        <el-scrollbar class="cd-scrollbar">
          <el-form-item label="文章标题" prop="title">
            <el-input v-model="dataForm.title" placeholder="请输入文章标题" />
          </el-form-item>
          <el-form-item style="margin-bottom:0" prop="content">
            <rich-text-editor ref="editor" v-model="dataForm.content" :height="editorHeight" />
          </el-form-item>
        </el-scrollbar>
      </pane>
      <pane class="right-container">
        <el-form-item style="margin-top:10px;">
          <el-button type="primary" @click="dataFormSubmit()">
            保存
          </el-button>
          <el-button @click="cancelFormSubmit()">
            取消
          </el-button>
        </el-form-item>
        <el-divider />
        <el-scrollbar class="cd-scrollbar">
          <el-form-item label="所在分类" prop="parentName">
            <el-popover ref="menuListPopover" placement="bottom-start" trigger="click">
              <template #reference>
                <el-input v-model="dataForm.parentName" :readonly="true" placeholder="点击选择分类" class="menu-list__input" />
              </template>
              <el-tree ref="menuListTree" :data="menuList" :props="menuListTreeProps" node-key="categoryId" :default-expand-all="true" :highlight-current="true" :expand-on-click-node="false" @current-change="handleMenuListTreeCurrentChange" />
            </el-popover>
          </el-form-item>
          <el-form-item label="封面图片" prop="thumb" class="is-required">
            <upload-thumb :default-url="dataForm.thumb" @uploadSuccess="uploadThumbSuccess" />
          </el-form-item>
          <el-form-item label="发布时间" prop="releaseTime">
            <el-date-picker v-model="dataForm.releaseTime" type="datetime" placeholder="发布时间" class="createTime" value-format="yyyy-MM-dd HH:mm:ss" />
          </el-form-item>
        </el-scrollbar>
      </pane>
    </splitpanes>
  </el-form>
</template>

<script>
import { getCategoryList } from '@/api/category'
import { getArticleInfo, postOrPutArticle } from '@/api/article'
import RichTextEditor from '@/components/rich-text-editor'
import UploadThumb from '@/components/upload/thumb-one'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'

export default {
  components: { UploadThumb, Splitpanes, Pane, RichTextEditor },
  data() {
    const validateThumb = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请上传一张封面图片'))
      } else {
        callback()
      }
    }
    return {
      dataForm: {
        articleId: this.$route.query.id || 0,
        title: '',
        cateId: 0,
        parentName: '',
        thumb: '',
        content: '',
        releaseTime: '',
        userId: 0
      },
      loading: false,
      menuList: [],
      menuListTreeProps: {
        label: 'name',
        children: 'children'
      },
      rules: {
        title: [{ required: true, message: '请输入文章标题' }],
        parentName: [
          { required: true, message: '所在分类不能为空', trigger: 'change' }
        ],
        content: [
          { required: true, message: '文章内容不能为空', trigger: 'change' }
        ],
        thumb: [{ validator: validateThumb }]
      }
    }
  },
  computed: {
    documentClientHeight: {
      get() {
        return this.$store.state.common.documentClientHeight
      }
    },
    siteContentViewHeight() {
      const height = this.documentClientHeight - 50 - 30 - 2 - 20
      return { height: `${height}px` }
    },
    editorHeight() {
      return this.documentClientHeight - 50 - 30 - 2 - 20 - 104
    },
    userName: {
      get() {
        return this.$store.state.user.name
      }
    },
    userId: {
      get() {
        return this.$store.state.user.id
      }
    }
  },
  activated() {
    this.getData()
  },
  methods: {
    getData() {
      this.$nextTick(async() => {
        try {
          const { data: categoryListData } = await getCategoryList()
          if (categoryListData && categoryListData.code === 0) {
            this.menuList = categoryListData.data
          }
          if (this.dataForm.articleId) {
            const { data: articleInfoData } = await getArticleInfo({
              id: this.dataForm.articleId
            })
            if (articleInfoData && articleInfoData.code === 0) {
              this.dataForm.articleId = articleInfoData.data.articleId
              this.dataForm.cateId = articleInfoData.data.cateId
              this.dataForm.content = articleInfoData.data.content
              this.dataForm.thumb = articleInfoData.data.thumb
              this.dataForm.title = articleInfoData.data.title
              this.dataForm.releaseTime = articleInfoData.data.releaseTime
              this.menuListTreeSetCurrentNode()
            } else {
              this.$message.error(articleInfoData.message)
              this.$router.go(-1)
            }
          }
        } catch (error) {
          console.log(error)
          this.$message.error('文章数据加载失败')
          this.$router.go(-1)
        }
      })
    },
    // 菜单树选中
    handleMenuListTreeCurrentChange(data, node) {
      this.dataForm.cateId = data.categoryId
      this.dataForm.parentName = data.name
      this.$refs.menuListPopover && this.$refs.menuListPopover.doClose()
    },
    // 菜单树设置当前选中节点
    menuListTreeSetCurrentNode() {
      this.$refs.menuListTree.setCurrentKey(this.dataForm.cateId)
      this.dataForm.parentName = (
        this.$refs.menuListTree.getCurrentNode() || {}
      ).name
    },
    uploadThumbSuccess(files) {
      this.dataForm.thumb = files[0].url
    },
    cancelFormSubmit() {
      this.$router.go(-1)
    },
    dataFormSubmit() {
      this.dataForm.userId = this.userId
      this.$refs.dataForm.validate(async(valid) => {
        if (valid) {
          this.loading = true
          const { data } = await postOrPutArticle(this.dataForm)
          this.loading = false
          if (data && data.code === 0) {
            this.$message({
              message: '发布成功',
              type: 'success',
              duration: 1000,
              onClose: () => {
                this.$router.replace({ name: 'content-article' })
              }
            })
          } else {
            this.$message.error(data.message)
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.mod-article {
  margin: -10px;
  .cd-scrollbar {
    height: 100%;
    ::v-deep .el-scrollbar__wrap {
      overflow-x: hidden;
    }
  }
  .warp-divider {
    height: 100%;
    margin: 0 10px;
    width: 3px;
    background-color: #f2f2f2;
  }
  ::v-deep .splitpanes.default-theme .splitpanes__splitter {
    background-color: #f2f2f2;
  }
  .left-container {
    background-color: #ffffff;
  }
  .right-container {
    background-color: #ffffff;
    padding: 10px;
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
</style>
