<template>
  <el-dialog :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false" :visible.sync="visible">
    <el-form ref="dataForm" :model="dataForm" :rules="dataRule" label-width="80px" @keyup.enter.native="dataFormSubmit()">
      <el-form-item label="字典名称" prop="dictName">
        <el-input v-model.trim="dataForm.dictName" placeholder="字典名称" />
      </el-form-item>
      <el-form-item label="字典类型" prop="dictType">
        <el-input v-model.trim="dataForm.dictType" placeholder="字典类型" />
      </el-form-item>
      <el-form-item label="排序号" prop="sort">
        <el-input-number v-model="dataForm.sort" controls-position="right" :min="0" label="排序号" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model.trim="dataForm.remark" placeholder="备注" />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getDictTypeInfo, postOrPutDictType } from '@/api/dict-type'
export default {
  data() {
    return {
      visible: false,
      dataForm: {
        id: 0,
        dictName: '',
        dictType: '',
        sort: 0,
        remark: ''
      },
      dataRule: {
        dictName: [
          { required: true, message: '字典名称不能为空', trigger: 'blur' }
        ],
        dictType: [
          { required: true, message: '字典类型不能为空', trigger: 'blur' }
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
        if (this.dataForm.id) {
          const { data: dictTypeInfoData } = await getDictTypeInfo({
            id: this.dataForm.id
          })
          if (dictTypeInfoData && dictTypeInfoData.code === 0) {
            this.dataForm.dictType = dictTypeInfoData.data.dictType
            this.dataForm.dictName = dictTypeInfoData.data.dictName
            this.dataForm.sort = dictTypeInfoData.data.sort
            this.dataForm.remark = dictTypeInfoData.data.remark
          }
        }
      })
    },
    // 表单提交
    dataFormSubmit() {
      this.$refs.dataForm.validate(async(valid) => {
        if (valid) {
          const { data } = await postOrPutDictType({
            dictTypeId: this.dataForm.id || undefined,
            dictName: this.dataForm.dictName,
            dictType: this.dataForm.dictType,
            sort: this.dataForm.sort,
            remark: this.dataForm.remark
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
</style>

