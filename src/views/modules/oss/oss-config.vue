<template>
  <el-dialog title="云存储配置" :close-on-click-modal="false" :visible.sync="visible">
    <el-form ref="dataForm" :model="dataForm" :rules="dataRule" label-width="140px" @keyup.enter.native="dataFormSubmit()">
      <el-form-item size="mini" label="存储类型">
        <el-radio-group v-model="dataForm.ossType">
          <el-radio :label="'1'">
            阿里云
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <template v-if="dataForm.ossType === '1'">
        <el-form-item label="EndPoint">
          <el-input v-model="dataForm.aliyunEndPoint" placeholder="阿里云EndPoint" />
        </el-form-item>
        <el-form-item label="AccessKeyId">
          <el-input v-model="dataForm.aliyunAccessKeyId" placeholder="阿里云AccessKeyId" />
        </el-form-item>
        <el-form-item label="AccessKeySecret">
          <el-input v-model="dataForm.aliyunAccessKeySecret" placeholder="阿里云AccessKeySecret" />
        </el-form-item>
        <el-form-item label="BucketName">
          <el-input v-model="dataForm.aliyunBucketName" placeholder="阿里云BucketName" />
        </el-form-item>
      </template>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getConfigInfo, postOrPutConfig } from '@/api/config'
export default {
  data() {
    return {
      visible: false,
      configId: 0,
      key: 'CLOUD_STORAGE_ALI_CONFIG_KEY',
      dataForm: {},
      dataRule: {}
    }
  },
  methods: {
    init(id) {
      this.visible = true
      this.$nextTick(async() => {
        const { data: configInfoData } = await getConfigInfo({ key: this.key })
        if (configInfoData && configInfoData.code === 0) {
          this.dataForm = configInfoData.data.paramValue
          this.configId = configInfoData.data.configId
        }
      })
    },
    // 表单提交
    dataFormSubmit() {
      this.$refs.dataForm.validate(async(valid) => {
        if (valid) {
          const { data } = await postOrPutConfig({
            configId: this.configId,
            paramKey: this.key,
            paramValue: JSON.stringify(this.dataForm),
            type: 2,
            status: true
          })
          if (data && data.code === 0) {
            this.$message({
              message: '操作成功',
              type: 'success',
              duration: 1500,
              onClose: () => {
                this.visible = false
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
