<template>
  <el-dialog :title="!dataForm.id ? '新增' : '修改'" append-to-body :close-on-click-modal="false" :visible.sync="visible">
    <el-form ref="dataForm" :model="dataForm" :rules="dataRule" label-width="80px" @keyup.enter.native="dataFormSubmit()">
      <el-form-item label="字典标签" prop="dictLabel">
        <el-input v-model.trim="dataForm.dictLabel" placeholder="字典标签" />
      </el-form-item>
      <el-form-item label="字典值" prop="dictValue">
        <el-input v-model.trim="dataForm.dictValue" placeholder="字典值" />
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
import { getDictDataInfo, postOrPutDictData } from '@/api/dict-data'
export default {
  data() {
    return {
      visible: false,
      dataForm: {
        id: 0,
        dictTypeId: 0,
        dictLabel: '',
        dictValue: '',
        sort: 0,
        remark: ''
      },
      dataRule: {
        dictLabel: [
          { required: true, message: '字典标签不能为空', trigger: 'blur' }
        ],
        dictValue: [
          { required: true, message: '字典值不能为空', trigger: 'blur' }
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
          const { data: dictDataInfoData } = await getDictDataInfo({
            id: this.dataForm.id
          })
          if (dictDataInfoData && dictDataInfoData.code === 0) {
            this.dataForm.dictLabel = dictDataInfoData.data.dictLabel
            this.dataForm.dictValue = dictDataInfoData.data.dictValue
            this.dataForm.sort = dictDataInfoData.data.sort
            this.dataForm.remark = dictDataInfoData.data.remark
          }
        }
      })
    },
    // 表单提交
    dataFormSubmit() {
      this.$refs.dataForm.validate(async(valid) => {
        if (valid) {
          const { data } = await postOrPutDictData({
            dictDataId: this.dataForm.id || undefined,
            dictTypeId: this.dataForm.dictTypeId,
            dictLabel: this.dataForm.dictLabel,
            dictValue: this.dataForm.dictValue,
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
