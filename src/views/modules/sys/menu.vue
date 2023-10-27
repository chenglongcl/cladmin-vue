<template>
  <div class="mod-menu">
    <el-form :inline="true" :model="dataForm">
      <el-form-item>
        <el-button v-if="isAuth('sys:menu:save')" type="primary" @click="handleAddOrUpdate()">
          新增
        </el-button>
      </el-form-item>
    </el-form>
    <el-table :data="dataList" border style="width: 100%" row-key="menuId" :tree-props="{children: 'children'}">
      <el-table-column prop="name" header-align="center" min-width="150" label="名称" />
      <el-table-column prop="parentName" header-align="center" align="center" width="120" label="上级菜单" />
      <el-table-column header-align="center" align="center" label="图标">
        <template slot-scope="scope">
          <icon-svg :name="scope.row.icon || ''" />
        </template>
      </el-table-column>
      <el-table-column prop="type" header-align="center" align="center" label="类型">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.type === 0" size="small">
            目录
          </el-tag>
          <el-tag v-else-if="scope.row.type === 1" size="small" type="success">
            菜单
          </el-tag>
          <el-tag v-else-if="scope.row.type === 2" size="small" type="info">
            按钮
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="orderNum" header-align="center" align="center" label="排序号" />
      <el-table-column prop="url" header-align="center" align="center" width="150" :show-overflow-tooltip="true" label="菜单URL" />
      <el-table-column prop="perms" header-align="center" align="center" width="150" :show-overflow-tooltip="true" label="授权标识" />
      <el-table-column fixed="right" header-align="center" align="center" width="150" label="操作">
        <template slot-scope="scope">
          <el-button v-if="isAuth('sys:menu:update')" type="text" size="small" @click="handleAddOrUpdate(scope.row.menuId)">
            修改
          </el-button>
          <el-button v-if="isAuth('sys:menu:delete')" type="text" size="small" @click="handleDelete(scope.row.menuId)">
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
import { getMenuList, deleteMenu } from '@/api/menu'
import AddOrUpdate from './menu-add-or-update'

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
      const { data } = await getMenuList()
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
        const { data } = await deleteMenu({ id })
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
