<template>
  <el-dialog title="STS配置" :close-on-click-modal="false" :visible.sync="visible">
    <el-form ref="dataForm" :model="dataForm" :rules="dataRule" label-width="140px" @keyup.enter.native="dataFormSubmit()">
      <el-form-item label="AccessKeyId">
        <el-input v-model="dataForm.aliyunAccessKeyId" placeholder="阿里云AccessKeyId" />
      </el-form-item>
      <el-form-item label="AccessKeySecret">
        <el-input v-model="dataForm.aliyunAccessKeySecret" placeholder="阿里云AccessKeySecret" />
      </el-form-item>
      <el-form-item label="EndPoint">
        <el-input v-model="dataForm.aliyunEndPoint" placeholder="阿里云STS EndPoint" />
      </el-form-item>
      <el-form-item label="RoleArn">
        <el-input v-model="dataForm.aliyunRoleArn" placeholder="阿里云角色ARN" />
      </el-form-item>
      <el-form-item label="RoleSessionName">
        <el-input v-model="dataForm.aliyunRoleSessionName" placeholder="阿里云角色会话名称，通常设置为调用该API的用户身份" />
      </el-form-item>
      <el-form-item label="Region">
        <el-input v-model="dataForm.aliyunOSSRegion" placeholder="Bucket所在地域" />
      </el-form-item>
      <el-form-item label="Bucket">
        <el-input v-model="dataForm.aliyunOSSBucket" placeholder="Bucket名称" />
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
export default {
  name: 'STSConfig',
  data() {
    return {
      visible: false,
      configId: 0,
      key: 'ALI_STS_CONFIG_KEY',
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
