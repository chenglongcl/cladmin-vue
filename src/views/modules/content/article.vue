<template>
  <div class="mod-role">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="search()">
      <el-form-item>
        <el-cascader v-model="dataForm.cateId" :options="categories" :props="cascaderProps" placeholder="分类" @change="handleItemChange" />
      </el-form-item>
      <el-form-item>
        <el-input v-model="dataForm.keyword" placeholder="文章标题" clearable />
      </el-form-item>
      <el-form-item>
        <el-button @click="search()">
          查询
        </el-button>
        <el-button v-if="isAuth('sys:article:save')" type="primary" @click="handleAddOrUpdate()">
          新增
        </el-button>
        <el-button v-if="isAuth('sys:article:delete')" type="danger" :disabled="dataListSelections.length <= 0" @click="handleDelete()">
          批量删除
        </el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="dataListLoading" :data="dataList" border style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" header-align="center" align="center" width="50" />
      <el-table-column prop="articleId" header-align="center" align="center" width="80" label="ID" />
      <el-table-column prop="title" header-align="center" align="left" label="标题" />
      <el-table-column prop="releaseTime" header-align="center" align="center" width="180" label="发布时间" />
      <el-table-column fixed="right" header-align="center" align="center" width="150" label="操作">
        <template slot-scope="scope">
          <el-button v-if="isAuth('sys:article:update')" type="text" size="small" @click="handleAddOrUpdate(scope.row.articleId)">
            编辑
          </el-button>
          <el-button v-if="isAuth('sys:article:delete')" type="text" size="small" @click="handleDelete(scope.row.articleId)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination :current-page="pageIndex" :page-sizes="[10, 20, 50, 100]" :page-size="pageSize" :total="totalCount" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
  </div>
</template>

<script>
import { getArticleList, deleteArticle } from '@/api/article'
import { getCategoryList } from '@/api/category'

export default {
  data() {
    return {
      dataForm: {
        cateId: parseInt(this.$route.query.cateId) || 0,
        keyword: this.$route.query.keyword || ''
      },
      dataList: [],
      pageIndex: parseInt(this.$route.query.page) || 1,
      pageSize: 10,
      totalCount: 0,
      dataListLoading: false,
      dataListSelections: [],
      categories: [],
      cascaderProps: {
        label: 'name',
        value: 'categoryId'
      }
    }
  },
  activated() {
    this.getDataList()
    this.getCategoryData()
  },
  methods: {
    // 获取数据列表
    async getDataList() {
      this.dataListLoading = true
      this.$router.push({
        query: {
          ...this.dataForm,
          page: this.pageIndex
        }
      })
      const { data } = await getArticleList({
        page: this.pageIndex,
        limit: this.pageSize,
        cateId: this.dataForm.cateId,
        keyword: this.dataForm.keyword
      })
      if (data && data.code === 0) {
        this.dataList = data.data.list
        this.totalCount = data.data.totalCount
      } else {
        this.dataList = []
        this.totalCount = 0
      }
      this.dataListLoading = false
    },
    async getCategoryData() {
      const { data } = await getCategoryList()
      if (data && data.code === 0) {
        data.data.unshift({
          categoryId: '',
          parentId: 0,
          name: '全部',
          icon: '',
          orderNum: 0
        })
        this.categories = data.data
      }
    },
    // 每页数
    handleSizeChange(val) {
      this.pageSize = val
      this.pageIndex = 1
      this.getDataList()
    },
    // 当前页
    handleCurrentChange(val) {
      this.pageIndex = val
      this.getDataList()
    },
    // 多选
    handleSelectionChange(val) {
      this.dataListSelections = val
    },
    // 新增 / 修改
    handleAddOrUpdate(id) {
      this.$router.push({
        name: 'content-article-add-or-update',
        query: { id }
      })
    },
    search() {
      this.pageIndex = 1
      this.getDataList()
    },
    handleItemChange(val) {
      const { length, last = length - 1 } = val
      this.dataForm.cateId = val[last]
    },
    // 删除
    async handleDelete(id) {
      const ids = id
        ? [id]
        : this.dataListSelections.map((item) => {
          return item.articleId
        })
      const confirmRes = await this.$confirm(
        `确定对[id=${ids.join(',')}]进行[${id ? '删除' : '批量删除'}]操作?`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => console.log(err, '已取消删除'))
      if (confirmRes === 'confirm') {
        const { data } = await deleteArticle({ ids })
        if (data && data.code === 0) {
          this.$message({
            message: '操作成功',
            type: 'success',
            duration: 1500,
            onClose: () => {
              this.getDataList()
            }
          })
        } else {
          this.$message.error(data.message)
        }
      }
    }
  }
}
</script>
