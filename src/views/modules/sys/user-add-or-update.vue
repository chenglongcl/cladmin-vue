<template>
  <el-dialog :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false" :visible.sync="visible">
    <el-form ref="dataForm" :model="dataForm" :rules="dataRule" label-width="80px" @keyup.enter.native="dataFormSubmit()">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="dataForm.username" placeholder="登录帐号" />
      </el-form-item>
      <el-form-item label="所属部门" prop="deptName">
        <ren-dept-tree v-model="dataForm.deptId" placeholder="请选择部门" :dept-name.sync="dataForm.deptName" />
      </el-form-item>
      <el-form-item label="密码" prop="password" :class="{ 'is-required': !dataForm.id }">
        <el-input v-model="dataForm.password" type="password" placeholder="密码" />
      </el-form-item>
      <el-form-item label="确认密码" prop="comfirmPassword" :class="{ 'is-required': !dataForm.id }">
        <el-input v-model="dataForm.comfirmPassword" type="password" placeholder="确认密码" />
      </el-form-item>
      <el-form-item label="性别" prop="gender">
        <ren-radio-group v-model="dataForm.gender" dict-type="gender" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="dataForm.email" placeholder="邮箱" />
      </el-form-item>
      <el-form-item label="手机号" prop="mobile">
        <el-input v-model="dataForm.mobile" placeholder="手机号" />
      </el-form-item>
      <el-form-item label="角色" size="mini" prop="roleIdList">
        <el-checkbox-group v-model="dataForm.roleIdList">
          <el-checkbox v-for="role in roleList" :key="role.roleId" :label="role.roleId">
            {{ role.roleName }}
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="状态" size="mini" prop="status">
        <el-radio-group v-model="dataForm.status">
          <el-radio :label="0">
            禁用
          </el-radio>
          <el-radio :label="1">
            正常
          </el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getUserInfo, postOrPutUser } from '@/api/user'
import { getRoleSelect } from '@/api/role'
import { isEmail, isMobile } from '@/utils/validate'
export default {
  data() {
    const validatePassword = (rule, value, callback) => {
      if (!this.dataForm.id && !/\S/.test(value)) {
        callback(new Error('密码不能为空'))
      } else {
        callback()
      }
    }
    const validateComfirmPassword = (rule, value, callback) => {
      if (!this.dataForm.id && !/\S/.test(value)) {
        callback(new Error('确认密码不能为空'))
      } else if (this.dataForm.password !== value) {
        callback(new Error('确认密码与密码输入不一致'))
      } else {
        callback()
      }
    }
    const validateEmail = (rule, value, callback) => {
      if (!isEmail(value)) {
        callback(new Error('邮箱格式错误'))
      } else {
        callback()
      }
    }
    const validateMobile = (rule, value, callback) => {
      if (!isMobile(value)) {
        callback(new Error('手机号格式错误'))
      } else {
        callback()
      }
    }
    return {
      visible: false,
      roleList: [],
      dataForm: {
        id: 0,
        username: '',
        deptId: 0,
        deptName: '',
        password: '',
        comfirmPassword: '',
        gender: 0,
        email: '',
        mobile: '',
        roleIdList: [],
        status: 1
      },
      dataRule: {
        username: [
          { required: true, message: '用户名不能为空', trigger: 'blur' }
        ],
        deptName: [
          {
            required: true,
            message: '请选择部门',
            trigger: 'change'
          }
        ],
        password: [{ validator: validatePassword, trigger: 'blur' }],
        comfirmPassword: [
          { validator: validateComfirmPassword, trigger: 'blur' }
        ],
        email: [
          { required: true, message: '邮箱不能为空', trigger: 'blur' },
          { validator: validateEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '手机号不能为空', trigger: 'blur' },
          { validator: validateMobile, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    init(id) {
      this.dataForm.id = id || 0
      this.visible = true
      this.$nextTick(async() => {
        this.$refs.dataForm.resetFields()
        try {
          const { data: roleData } = await getRoleSelect({
            id: this.dataForm.id
          })
          if (roleData && roleData.code === 0) {
            this.roleList = roleData.data
          }
          if (this.dataForm.id) {
            const { data: userData } = await getUserInfo({
              id: this.dataForm.id
            })
            if (userData && userData.code === 0) {
              this.dataForm.username = userData.data.username
              this.dataForm.deptId = userData.data.deptId
              this.dataForm.deptName = userData.data.deptName
              this.dataForm.gender = userData.data.gender
              this.dataForm.email = userData.data.email
              this.dataForm.mobile = userData.data.mobile
              this.dataForm.roleIdList = userData.data.roleIdList
              this.dataForm.status = userData.data.status
            }
          }
        } catch (error) {
          console.log(error)
          this.$message.error('用户数据加载失败')
        }
      })
    },
    // 表单提交
    dataFormSubmit() {
      this.$refs.dataForm.validate(async(valid) => {
        if (valid) {
          const { data } = await postOrPutUser({
            userId: this.dataForm.id || undefined,
            username: this.dataForm.username,
            password: this.dataForm.password,
            deptId: this.dataForm.deptId,
            email: this.dataForm.email,
            mobile: this.dataForm.mobile,
            gender: parseInt(this.dataForm.gender),
            status: this.dataForm.status,
            roleIdList: this.dataForm.roleIdList
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
