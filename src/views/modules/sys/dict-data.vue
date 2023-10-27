<template>
  <div class="mod-dict-data">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item>
        <el-input v-model="dataForm.dictValue" placeholder="字典值" clearable />
      </el-form-item>
      <el-form-item>
        <el-input v-model="dataForm.dictLabel" placeholder="字典标签" clearable />
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">
          查询
        </el-button>
        <el-button v-if="isAuth('sys:dictData:save')" type="primary" @click="handleAddOrUpdate()">
          新增
        </el-button>
        <el-button v-if="isAuth('sys:dictData:delete')" type="danger" :disabled="dataListSelections.length <= 0" @click="handleDelete()">
          批量删除
        </el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="dataListLoading" :data="dataList" border style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" header-align="center" align="center" width="50" />
      <el-table-column prop="dictValue" header-align="center" align="center" label="字典值" />
      <el-table-column prop="dictLabel" header-align="center" align="center" label="字典标签" />
      <el-table-column prop="sort" header-align="center" align="center" width="100" label="排序" />
      <el-table-column prop="remark" header-align="center" align="center" label="备注" />
      <el-table-column prop="createTime" header-align="center" align="center" width="180" label="创建时间" />
      <el-table-column fixed="right" header-align="center" align="center" width="150" label="操作">
        <template slot-scope="scope">
          <el-button v-if="isAuth('sys:dictType:update')" type="text" size="small" @click="handleAddOrUpdate(scope.row.dictDataId)">
            修改
          </el-button>
          <el-button v-if="isAuth('sys:dictType:delete')" type="text" size="small" @click="handleDelete(scope.row.dictDataId)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination :current-page="pageIndex" :page-sizes="[10, 20, 50, 100]" :page-size="pageSize" :total="totalCount" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList" />
  </div>
</template>

<script>
import { getDictDataList, deleteDictData } from '@/api/dict-data'
import AddOrUpdate from './dict-data-add-or-update.vue'
export default {
  components: {
    AddOrUpdate
  },
  props: {
    dictTypeId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      dataForm: {
        dictLabel: '',
        dictValue: ''
      },
      dataList: [],
      pageIndex: 1,
      pageSize: 10,
      totalCount: 0,
      dataListLoading: false,
      dataListSelections: [],
      addOrUpdateVisible: false
    }
  },
  mounted() {
    this.getDataList()
  },
  methods: {
    async getDataList() {
      this.dataListLoading = true
      const { data } = await getDictDataList({
        page: this.pageIndex,
        limit: this.pageSize,
        dictLabel: this.dataForm.dictLabel,
        dictValue: this.dataForm.dictValue,
        dictTypeId: this.dictTypeId
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
      this.addOrUpdateVisible = true
      this.$nextTick(() => {
        this.$refs.addOrUpdate.dataForm.dictTypeId = this.dictTypeId
        this.$refs.addOrUpdate.init(id)
      })
    },
    // 删除
    async handleDelete(id) {
      const ids = id
        ? [id]
        : this.dataListSelections.map((item) => {
          return item.dictDataId
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
        const { data } = await deleteDictData({ ids })
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

<style lang="scss" scoped>
.mod-dict-data {
  padding: 0 15px;
}
</style>
