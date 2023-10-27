<template>
  <div>
    <el-input v-model="showDeptName" readonly :placeholder="placeholder" @focus="deptDialog">
      <el-button slot="append" icon="el-icon-search" @click="deptDialog" />
    </el-input>
    <el-input :value="value" style="display: none" />
    <el-dialog :visible.sync="visibleDept" width="30%" :modal="false" :title="placeholder" :close-on-click-modal="false" :close-on-press-escape="false">
      <el-form size="mini" :inline="true">
        <el-form-item label="关键字">
          <el-input v-model="filterText" />
        </el-form-item>
        <el-form-item>
          <el-button type="default">查询</el-button>
        </el-form-item>
      </el-form>
      <el-tree ref="tree" class="filter-tree" :data="deptList" :default-expanded-keys="expandedKeys" :props="{ label: 'name', children: 'children' }" :expand-on-click-node="false" :filter-node-method="filterNode" :highlight-current="true" node-key="deptId" />
      <template slot="footer">
        <el-button type="default" size="mini" @click="handleCancel()">取消</el-button>
        <el-button v-if="query" type="info" size="mini" @click="handleClear()">清除</el-button>
        <el-button type="primary" size="mini" @click="handleCommit()">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script>
import { getDeptList } from '@/api/dept'
export default {
  name: 'RenDeptTree',
  props: {
    value: {
      type: [Number, String],
      default: ''
    },
    deptName: {
      type: String,
      default: ''
    },
    query: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      filterText: '',
      visibleDept: false,
      deptList: [],
      showDeptName: '',
      expandedKeys: null,
      defaultProps: {
        children: 'children',
        label: 'label'
      }
    }
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val)
    },
    deptName(val) {
      this.showDeptName = val
    }
  },
  methods: {
    deptDialog() {
      this.expandedKeys = null
      if (this.$refs.tree) {
        this.$refs.tree.setCurrentKey(null)
      }
      this.visibleDept = true
      this.getDeptList(this.value)
    },
    filterNode(value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    async getDeptList(id) {
      const { data } = await getDeptList()
      if (data && data.code !== 0) {
        return this.$message.error(data.message)
      }
      this.deptList = data.data
      this.$nextTick(() => {
        this.$refs.tree.setCurrentKey(id)
        this.expandedKeys = [id]
      })
    },
    handleCancel() {
      this.visibleDept = false
      this.deptList = []
      this.filterText = ''
    },
    handleClear() {
      this.$emit('input', '')
      this.$emit('update:deptName', '')
      this.showDeptName = ''
      this.visibleDept = false
      this.deptList = []
      this.filterText = ''
    },
    handleCommit() {
      const node = this.$refs.tree.getCurrentNode()
      if (!node) {
        this.$message.error('请选择部门')
        return
      }
      this.$emit('input', node.deptId)
      this.$emit('update:deptName', node.name)
      this.showDeptName = node.name
      this.visibleDept = false
      this.deptList = []
      this.filterText = ''
    }
  }
}
</script>
