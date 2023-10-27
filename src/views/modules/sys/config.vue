<template>
  <div class="mod-config">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item>
        <el-input v-model="dataForm.paramKey" placeholder="参数名" clearable />
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">
          查询
        </el-button>
        <el-button v-if="isAuth('sys:config:save')" type="primary" @click="handleAddOrUpdate()">
          新增
        </el-button>
        <el-button v-if="isAuth('sys:config:delete')" type="danger" :disabled="dataListSelections.length <= 0" @click="handleDelete()">
          批量删除
        </el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="dataListLoading" :data="dataList" border style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" header-align="center" align="center" width="50" />
      <el-table-column prop="configId" header-align="center" align="center" width="80" label="ID" />
      <el-table-column prop="paramKey" header-align="center" align="center" label="参数名" />
      <el-table-column prop="paramValue" header-align="center" align="center" label="参数值" show-overflow-tooltip />
      <el-table-column prop="remark" header-align="center" align="center" label="备注" />
      <el-table-column header-align="center" align="center" label="状态">
        <template slot-scope="scope">
          {{ scope.row.status ? '正常' : '禁用' }}
        </template>
      </el-table-column>
      <el-table-column fixed="right" header-align="center" align="center" width="150" label="操作">
        <template slot-scope="scope">
          <template v-if="!scope.row.locked">
            <el-button type="text" size="small" @click="handleAddOrUpdate(scope.row.configId)">
              修改
            </el-button>
            <el-button type="text" size="small" @click="handleDelete(scope.row.configId)">
              删除
            </el-button>
          </template>
          <template v-else>
            <i class="el-icon-lock" />已锁定
          </template>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination :current-page="pageIndex" :page-sizes="[10, 20, 50, 100]" :page-size="pageSize" :total="totalPage" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList" />
  </div>
</template>

<script>
import { getConfigList, deleteConfig } from '@/api/config'
import AddOrUpdate from './config-add-or-update'

export default {
  components: {
    AddOrUpdate
  },
  data() {
    return {
      dataForm: {
        paramKey: ''
      },
      dataList: [],
      pageIndex: 1,
      pageSize: 10,
      totalPage: 0,
      dataListLoading: false,
      dataListSelections: [],
      addOrUpdateVisible: false
    }
  },
  activated() {
    this.getDataList()
  },
  methods: {
    // 获取数据列表
    async getDataList() {
      this.dataListLoading = true
      const { data } = await getConfigList({
        page: this.pageIndex,
        limit: this.pageSize,
        paramKey: this.dataForm.paramKey
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
        this.$refs.addOrUpdate.init(id)
      })
    },
    // 删除
    async handleDelete(id) {
      const ids = id
        ? [id]
        : this.dataListSelections.map((item) => {
          return item.configId
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
        const { data } = await deleteConfig({ ids })
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
