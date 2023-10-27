<template>
  <el-dialog :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false" :visible.sync="visible">
    <el-form ref="dataForm" :model="dataForm" :rules="dataRule" label-width="80px" @keyup.enter.native="dataFormSubmit()">
      <el-form-item label="角色名称" prop="roleName">
        <el-input v-model="dataForm.roleName" placeholder="角色名称" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="dataForm.remark" placeholder="备注" />
      </el-form-item>
      <el-form-item size="mini" label="授权">
        <el-tree ref="menuListTree" :data="menuList" :props="menuListTreeProps" node-key="menuId" :default-expand-all="true" show-checkbox />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getMenuList } from '@/api/menu'
import { getRoleInfo, postOrPutRole } from '@/api/role'
import { mapState } from 'vuex'

export default {
  data() {
    return {
      visible: false,
      menuList: [],
      menuListTreeProps: {
        label: 'name',
        children: 'children'
      },
      dataForm: {
        id: 0,
        roleName: '',
        remark: ''
      },
      dataRule: {
        roleName: [
          { required: true, message: '角色名称不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapState({
      userInfo: (state) => state.user
    })
  },
  methods: {
    init(id) {
      this.dataForm.id = id || 0
      this.visible = true
      this.$nextTick(async() => {
        this.$refs.dataForm.resetFields()
        try {
          const { data: menuListData } = await getMenuList()
          if (menuListData && menuListData.code === 0) {
            this.menuList = menuListData.data
            this.$refs.menuListTree.setCheckedKeys([])
          }
          if (this.dataForm.id) {
            const { data: roleInfoData } = await getRoleInfo({
              id: this.dataForm.id
            })
            if (roleInfoData && roleInfoData.code === 0) {
              this.dataForm.roleName = roleInfoData.data.roleName
              this.dataForm.remark = roleInfoData.data.remark
              roleInfoData.data.menuIdList.forEach((value) => {
                this.$refs.menuListTree.setChecked(value, true)
              })
            }
          }
        } catch (error) {
          console.log(error)
          this.$message.error('角色数据获取失败')
        }
      })
    },
    // 表单提交
    dataFormSubmit() {
      this.$refs.dataForm.validate(async(valid) => {
        if (valid) {
          const { data } = await postOrPutRole({
            roleId: this.dataForm.id || undefined,
            roleName: this.dataForm.roleName,
            remark: this.dataForm.remark,
            createUserId: this.userInfo.id,
            menuIdList: [].concat(
              this.$refs.menuListTree.getCheckedKeys(),
              this.$refs.menuListTree.getHalfCheckedKeys()
            )
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
