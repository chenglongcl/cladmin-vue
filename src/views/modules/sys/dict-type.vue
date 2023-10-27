<template>
  <div class="mod-dict-type">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item>
        <el-input v-model="dataForm.dictName" placeholder="字典名称" clearable />
      </el-form-item>
      <el-form-item>
        <el-input v-model="dataForm.dictType" placeholder="字典类型" clearable />
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">
          查询
        </el-button>
        <el-button v-if="isAuth('sys:dictType:save')" type="primary" @click="handleAddOrUpdate()">
          新增
        </el-button>
        <el-button v-if="isAuth('sys:dictType:delete')" type="danger" :disabled="dataListSelections.length <= 0" @click="handleDelete()">
          批量删除
        </el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="dataListLoading" :data="dataList" border style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" header-align="center" align="center" width="50" />
      <el-table-column prop="dictName" header-align="center" align="center" label="字典名称" />
      <el-table-column prop="dictType" label="字典类型" header-align="center" align="center">
        <template #default="scope">
          <el-link type="primary" @click="showTypeList(scope.row)">{{ scope.row.dictType }}</el-link>
        </template>
      </el-table-column>
      <el-table-column prop="sort" header-align="center" align="center" width="180" label="排序" />
      <el-table-column prop="remark" header-align="center" align="center" label="备注" />
      <el-table-column prop="createTime" header-align="center" align="center" width="180" label="创建时间" />
      <el-table-column fixed="right" header-align="center" align="center" width="180" label="操作">
        <template slot-scope="scope">
          <el-button v-if="isAuth('sys:dictData:list')" type="text" size="small" @click="showTypeList(scope.row)">
            字典配置
          </el-button>
          <el-button v-if="isAuth('sys:dictType:update')" type="text" size="small" @click="handleAddOrUpdate(scope.row.dictTypeId)">
            修改
          </el-button>
          <el-button v-if="isAuth('sys:dictType:delete')" type="text" size="small" @click="handleDelete(scope.row.dictTypeId)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination :current-page="pageIndex" :page-sizes="[10, 20, 50, 100]" :page-size="pageSize" :total="totalCount" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList" />
    <!-- 字典类型数据 -->
    <el-drawer v-if="dictDataVisible" :visible.sync="dictDataVisible" :title="focusDictTypeTitle" :size="800" :close-on-press-escape="false" class="rr-drawer">
      <DictDataList :dict-type-id="focusDictTypeId" />
    </el-drawer>
  </div>
</template>

<script>
import { getDictTypeList, deletelDictType } from '@/api/dict-type'
import AddOrUpdate from './dict-type-add-or-update'
import DictDataList from './dict-data.vue'
export default {
  components: {
    AddOrUpdate,
    DictDataList
  },
  data() {
    return {
      dataForm: {
        dictType: '',
        dictName: ''
      },
      dataList: [],
      pageIndex: 1,
      pageSize: 10,
      totalCount: 0,
      dataListLoading: false,
      dataListSelections: [],
      addOrUpdateVisible: false,
      dictDataVisible: false,
      focusDictTypeId: '',
      focusDictTypeTitle: ''
    }
  },
  activated() {
    this.getDataList()
  },
  methods: {
    // 获取数据列表
    async getDataList() {
      this.dataListLoading = true
      const { data } = await getDictTypeList({
        page: this.pageIndex,
        limit: this.pageSize,
        dictType: this.dataForm.dictType,
        dictName: this.dataForm.dictName
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
    //
    showTypeList(row) {
      this.dictDataVisible = true
      this.focusDictTypeId = row.dictTypeId
      this.focusDictTypeTitle = `${this.$route.meta.title} - ${row.dictType}`
    },
    // 删除
    async handleDelete(id) {
      const ids = id
        ? [id]
        : this.dataListSelections.map((item) => {
          return item.dictTypeId
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
        const { data } = await deletelDictType({ ids })
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

<style>
</style>
