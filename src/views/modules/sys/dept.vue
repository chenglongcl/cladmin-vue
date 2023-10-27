<template>
  <div class="mod-dept">
    <el-form :inline="true" :model="dataForm">
      <el-form-item>
        <el-button v-if="isAuth('sys:dept:save')" type="primary" @click="handleAddOrUpdate()">
          新增
        </el-button>
      </el-form-item>
    </el-form>
    <el-table :data="dataList" border style="width: 100%" row-key="deptId" :tree-props="{children: 'children'}">
      <el-table-column prop="name" header-align="center" min-width="150" label="名称" />
      <el-table-column prop="parentName" label="上级部门" header-align="center" align="center" />
      <el-table-column prop="sort" header-align="center" align="center" width="80" label="排序号" />
      <el-table-column fixed="right" header-align="center" align="center" width="150" label="操作">
        <template slot-scope="scope">
          <el-button v-if="isAuth('sys:dept:update')" type="text" size="small" @click="handleAddOrUpdate(scope.row.deptId)">
            修改
          </el-button>
          <el-button v-if="isAuth('sys:dept:delete')" type="text" size="small" @click="handleDelete(scope.row.deptId)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList" />
  </div>
</template>

<script>
import { getDeptList, deleteDept } from '@/api/dept'
import AddOrUpdate from './dept-add-or-update.vue'

export default {
  components: {
    AddOrUpdate
  },
  data() {
    return {
      dataForm: {},
      dataList: [],
      dataListLoading: false,
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
      const { data } = await getDeptList()
      if (data && data.code === 0) {
        this.dataList = data.data
        this.dataListLoading = false
      }
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
      const confirmRes = await this.$confirm(
        `确定对[id=${id}]进行[删除]操作?`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => console.log(err, '已取消删除'))
      if (confirmRes === 'confirm') {
        const { data } = await deleteDept({ id })
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
