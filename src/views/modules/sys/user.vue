<template>
  <div class="mod-user">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item>
        <el-input v-model="dataForm.userName" placeholder="用户名" clearable />
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">
          查询
        </el-button>
        <el-button v-if="isAuth('sys:user:save')" type="primary" @click="handleAddOrUpdate()">
          新增
        </el-button>
        <el-button v-if="isAuth('sys:user:delete')" type="danger" :disabled="dataListSelections.length <= 0" @click="handleDelete()">
          批量删除
        </el-button>
        <el-button v-if="isAuth('sys:user:logout')" type="warning" :disabled="dataListSelections.length <= 0" @click="handleLogout()">
          批量注销登录
        </el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="dataListLoading" :data="dataList" border style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" header-align="center" align="center" width="50" />
      <el-table-column prop="userId" header-align="center" align="center" width="80" label="ID" />
      <el-table-column prop="username" header-align="center" align="center" label="用户名" />
      <el-table-column prop="gender" header-align="center" align="center" label="性别">
        <template slot-scope="scope">
          {{ $getDictLabel("gender", scope.row.gender) }}
        </template>
      </el-table-column>
      <el-table-column prop="email" header-align="center" align="center" label="邮箱" />
      <el-table-column prop="mobile" header-align="center" align="center" label="手机号" />
      <el-table-column prop="status" header-align="center" align="center" label="状态">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === 0" size="small" type="danger">
            禁用
          </el-tag>
          <el-tag v-else size="small">
            正常
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" header-align="center" align="center" width="180" label="创建时间" />
      <el-table-column fixed="right" header-align="center" align="center" width="150" label="操作">
        <template slot-scope="scope">
          <el-button v-if="isAuth('sys:user:update')" type="text" size="small" @click="handleAddOrUpdate(scope.row.userId)">
            修改
          </el-button>
          <el-button v-if="isAuth('sys:user:delete') && !scope.row.superAdmin" type="text" size="small" @click="handleDelete(scope.row.userId)">
            删除
          </el-button>
          <el-button v-if="isAuth('sys:user:logout') && !scope.row.superAdmin" type="text" size="small" @click="handleLogout(scope.row.userId)">
            注销登录
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
import { getUserList, deleteUser, postLogoutUser } from '@/api/user'
import AddOrUpdate from './user-add-or-update'

export default {
  components: {
    AddOrUpdate
  },
  data() {
    return {
      dataForm: {
        userName: ''
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
  activated() {
    this.getDataList()
  },
  methods: {
    // 获取数据列表
    async getDataList() {
      this.dataListLoading = true
      const { data } = await getUserList({
        page: this.pageIndex,
        limit: this.pageSize,
        username: this.dataForm.userName
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
          return item.userId
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
        deleteUser({ ids }).then(({ data }) => {
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
        })
      }
    },
    // 注销登录
    async handleLogout(id) {
      const ids = id
        ? [id]
        : this.dataListSelections.map((item) => {
          return item.userId
        })
      const confirmRes = await this.$confirm(
        `确定对[id=${ids.join(',')}]进行[${
          id ? '注销登录' : '批量注销登录'
        }]操作?`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => console.log(err, '已取消注销登录'))
      if (confirmRes === 'confirm') {
        postLogoutUser({ ids }).then(({ data }) => {
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
        })
      }
    }
  }
}
</script>
