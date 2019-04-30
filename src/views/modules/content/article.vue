<template>
  <div class="mod-role">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item>
        <el-cascader :options="categories" :props="cascaderProps" @change="handleItemChange" placeholder="分类"></el-cascader>
      </el-form-item>
      <el-form-item>
        <el-input v-model="dataForm.title" placeholder="文章标题" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
        <el-button v-if="isAuth('sys:article:save')" type="primary" @click="addOrUpdateHandle()">新增</el-button>
        <el-button v-if="isAuth('sys:article:delete')" type="danger" @click="deleteHandle()" :disabled="dataListSelections.length <= 0">批量删除</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="dataList" border v-loading="dataListLoading" @selection-change="selectionChangeHandle" style="width: 100%;">
      <el-table-column type="selection" header-align="center" align="center" width="50">
      </el-table-column>
      <el-table-column prop="articleId" header-align="center" align="center" width="80" label="ID">
      </el-table-column>
      <el-table-column prop="title" header-align="center" align="left" label="标题">
      </el-table-column>
      <el-table-column prop="createTime" header-align="center" align="center" width="180" label="创建时间">
      </el-table-column>
      <el-table-column fixed="right" header-align="center" align="center" width="150" label="操作">
        <template slot-scope="scope">
          <el-button v-if="isAuth('sys:article:update')" type="text" size="small" @click="addOrUpdateHandle(scope.row.articleId)">编辑</el-button>
          <el-button v-if="isAuth('sys:article:delete')" type="text" size="small" @click="deleteHandle(scope.row.roleId)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle" :current-page="pageIndex" :page-sizes="[10, 20, 50, 100]" :page-size="pageSize" :total="totalCount" layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>
  </div>
</template>

<script>
import { treeDataTranslate } from "@/utils";
export default {
  data() {
    return {
      dataForm: {
        cateId: 0,
        title: ""
      },
      dataList: [],
      pageIndex: 1,
      pageSize: 10,
      totalCount: 0,
      dataListLoading: false,
      dataListSelections: [],
      categories: [],
      cascaderProps: {
        label: "name",
        value: "categoryId"
      }
    };
  },
  activated() {
    this.getDataList();
    this.getCategoryData();
  },
  methods: {
    // 获取数据列表
    getDataList() {
      this.dataListLoading = true;
      this.$http
        .getArticleList({
          page: this.pageIndex,
          limit: this.pageSize,
          cateId: this.dataForm.cateId,
          title: this.dataForm.title
        })
        .then(({ data }) => {
          if (data && data.code === 0) {
            this.dataList = data.data.list;
            this.totalCount = data.data.totalCount;
          } else {
            this.dataList = [];
            this.totalCount = 0;
          }
          this.dataListLoading = false;
        });
    },
    // 每页数
    sizeChangeHandle(val) {
      this.pageSize = val;
      z;
      this.pageIndex = 1;
      this.getDataList();
    },
    // 当前页
    currentChangeHandle(val) {
      this.pageIndex = val;
      this.getDataList();
    },
    // 多选
    selectionChangeHandle(val) {
      this.dataListSelections = val;
    },
    // 新增 / 修改
    addOrUpdateHandle(id) {
      this.$router.push({ name: "article-add-or-update", query: { id: id } });
    },
    //
    getCategoryData() {
      this.$http.getCategoryList().then(({ data }) => {
        if (data.code == 0 && data.data) {
          data.data.unshift({
            categoryId: "",
            parentId: 0,
            name: "全部",
            icon: "",
            orderNum: 0
          });
          this.categories = treeDataTranslate(data.data, "categoryId");
        }
      });
    },
    handleItemChange(val) {
      const { length, last = length - 1 } = val;
      this.dataForm.cateId = val[last];
    }
  }
};
</script>
