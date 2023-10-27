<template>
  <el-dialog :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false" :visible.sync="visible">
    <el-form ref="dataForm" :model="dataForm" :rules="dataRule" label-width="80px">
      <el-form-item label="参数名" prop="paramKey">
        <el-input v-model="dataForm.paramKey" placeholder="参数名" :disabled="dataForm.id>0" />
      </el-form-item>
      <el-form-item label="值类型" prop="type">
        <el-radio-group v-model="dataForm.type" :disabled="dataForm.id>0">
          <el-radio :label="1">字符串</el-radio>
          <el-radio :label="2">JSON</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="参数值" prop="paramValue">
        <el-input v-model="dataForm.paramValue" :type="dataForm.type===1?'text':'textarea'" placeholder="参数值" :rows="6" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="dataForm.remark" placeholder="备注" />
      </el-form-item>
      <el-form-item label="开启" prop="status">
        <el-switch v-model="dataForm.status" />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getConfigInfo, postOrPutConfig } from '@/api/config'
import isJson from 'validator/lib/isJSON'
export default {
  data() {
    const validateParamValue = (rule, value, callback) => {
      if (this.dataForm.type === 2 && !isJson(value)) {
        callback(new Error('参数值必须为JSON格式'))
      } else {
        callback()
      }
    }
    return {
      visible: false,
      dataForm: {
        id: 0,
        type: 1,
        paramKey: '',
        paramValue: '',
        remark: '',
        status: true
      },
      dataRule: {
        paramKey: [
          { required: true, message: '参数名不能为空', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '参数值类型不能为空', trigger: 'blur' }
        ],
        paramValue: [
          { required: true, message: '参数值不能为空', trigger: 'blur' },
          { validator: validateParamValue }
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
          if (this.dataForm.id) {
            const { data: configData } = await getConfigInfo({
              id: this.dataForm.id
            })
            if (configData && configData.code === 0) {
              this.dataForm.paramKey = configData.data.paramKey
              this.dataForm.type = configData.data.type
              if (this.dataForm.type === 1) {
                this.dataForm.paramValue = configData.data.paramValue
              } else if (this.dataForm.type === 2) {
                this.dataForm.paramValue = JSON.stringify(
                  configData.data.paramValue,
                  null,
                  2
                )
              }
              this.dataForm.remark = configData.data.remark
              this.dataForm.status = configData.data.status
            }
          }
        } catch (error) {
          console.log(error)
          this.$message.error('配置数据加载失败')
        }
      })
    },
    // 表单提交
    dataFormSubmit() {
      this.$refs.dataForm.validate(async(valid) => {
        if (valid) {
          const { data } = await postOrPutConfig({
            configId: this.dataForm.id || undefined,
            type: this.dataForm.type,
            paramKey: this.dataForm.paramKey,
            paramValue:
              this.dataForm.type === 1
                ? this.dataForm.paramValue
                : JSON.stringify(JSON.parse(this.dataForm.paramValue)),
            remark: this.dataForm.remark,
            status: this.dataForm.status
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
