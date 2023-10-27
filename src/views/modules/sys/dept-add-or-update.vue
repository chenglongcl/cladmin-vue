<template>
  <el-dialog :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false" :visible.sync="visible">
    <el-form ref="dataForm" :model="dataForm" :rules="dataRule" label-width="80px" @keyup.enter.native="dataFormSubmit()">
      <el-form-item label="部门名称" prop="name">
        <el-input v-model="dataForm.name" placeholder="部门名称" />
      </el-form-item>
      <el-form-item label="上级部门" prop="parentName">
        <el-popover ref="menuListPopover" placement="bottom-start" trigger="click">
          <template #reference>
            <el-input v-model="dataForm.parentName" :readonly="true" placeholder="点击选择上级菜单" class="menu-list__input" />
          </template>
          <el-tree ref="menuListTree" :data="menuList" :props="menuListTreeProps" node-key="deptId" :default-expand-all="true" :highlight-current="true" :expand-on-click-node="false" @current-change="handleMenuListTreeCurrentChange" />
        </el-popover>
      </el-form-item>
      <el-form-item label="排序号" prop="sort">
        <el-input-number v-model="dataForm.sort" controls-position="right" :min="0" label="排序号" />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getDeptList, getDeptInfo, postOrPutDept } from '@/api/dept'

export default {
  data() {
    return {
      visible: false,
      dataForm: {
        id: 0,
        name: '',
        parentId: 0,
        parentName: '',
        sort: 0
      },
      dataRule: {
        name: [
          { required: true, message: '部门名称不能为空', trigger: 'blur' }
        ],
        parentName: [
          { required: true, message: '上级部门不能为空', trigger: 'change' }
        ]
      },
      menuList: [],
      menuListTreeProps: {
        label: 'name',
        children: 'children'
      }
    }
  },
  created() {},
  methods: {
    init(id) {
      this.dataForm.id = id || 0
      this.visible = true
      this.$nextTick(async() => {
        this.$refs.dataForm.resetFields()
        this.dataForm.parentId = 0
        try {
          const { data: deptListData } = await getDeptList()
          if (deptListData && deptListData.code === 0) {
            this.menuList = deptListData.data
          }
          if (this.dataForm.id) {
            const { data: deptData } = await getDeptInfo({
              id: this.dataForm.id
            })
            if (deptData && deptData.code === 0) {
              this.dataForm.id = deptData.data.deptId
              this.dataForm.name = deptData.data.name
              this.dataForm.parentId = deptData.data.parentId
              this.dataForm.sort = deptData.data.sort
            }
          }
          this.menuListTreeSetCurrentNode()
        } catch (error) {
          console.error(error)
          this.$message.error('分类数据加载失败')
        }
      })
    },
    // 菜单树选中
    handleMenuListTreeCurrentChange(data, node) {
      this.dataForm.parentId = data.deptId
      this.dataForm.parentName = data.name
      this.$refs.menuListPopover && this.$refs.menuListPopover.doClose()
    },
    // 菜单树设置当前选中节点
    menuListTreeSetCurrentNode() {
      if (this.dataForm.parentId) {
        this.$refs.menuListTree.setCurrentKey(this.dataForm.parentId)
      } else {
        this.$refs.menuListTree.setCurrentKey(null)
      }
      this.dataForm.parentName = (
        this.$refs.menuListTree.getCurrentNode() || { name: '无' }
      ).name
    },
    // 表单提交
    dataFormSubmit() {
      this.$refs.dataForm.validate(async(valid) => {
        if (valid) {
          const { data } = await postOrPutDept({
            deptId: this.dataForm.id || undefined,
            name: this.dataForm.name,
            parentId: this.dataForm.parentId,
            sort: this.dataForm.sort
          })
          if (data && data.code === 0) {
            this.$message({
              message: '操作成功',
              type: 'success',
              duration: 1500,
              onClose: () => {
                this.visible = false
                this.$emit('refreshDataList')
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
.mod-category {
  .menu-list__input {
    cursor: pointer;
  }
}
</style>
