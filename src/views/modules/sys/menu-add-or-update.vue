<template>
  <el-dialog :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false" :visible.sync="visible">
    <el-form ref="dataForm" :model="dataForm" :rules="dataRule" label-width="80px" @keyup.enter.native="dataFormSubmit()">
      <el-form-item label="类型" prop="type">
        <el-radio-group v-model="dataForm.type" :disabled="!!dataForm.id">
          <el-radio v-for="(type, index) in dataForm.typeList" :key="index" :label="index">
            {{ type }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="dataForm.typeList[dataForm.type] + '名称'" prop="name">
        <el-input v-model="dataForm.name" :placeholder="dataForm.typeList[dataForm.type] + '名称'" />
      </el-form-item>
      <el-form-item v-show="dataForm.type !== 0" label="上级菜单" prop="parentName">
        <el-popover ref="menuListPopover" placement="bottom-start" trigger="click">
          <template #reference>
            <el-input v-model="dataForm.parentName" :readonly="true" placeholder="点击选择上级菜单" />
          </template>
          <el-tree ref="menuListTree" :data="menuList" :props="menuListTreeProps" node-key="menuId" :default-expand-all="false" :highlight-current="true" :expand-on-click-node="false" @current-change="handleMenuListTreeCurrentChange" />
        </el-popover>
      </el-form-item>
      <el-form-item v-if="dataForm.type !== 0" label="关联路由" prop="url">
        <el-input v-model="dataForm.url" placeholder="关联路由" />
      </el-form-item>
      <el-form-item v-if="dataForm.type !== 0" label="授权标识" prop="perms">
        <el-input v-model="dataForm.perms" placeholder="多个用逗号分隔, 如: user:list,user:create" />
      </el-form-item>
      <el-form-item v-if="dataForm.type !== 2" label="排序号" prop="orderNum">
        <el-input-number v-model="dataForm.orderNum" controls-position="right" :min="0" label="排序号" />
      </el-form-item>
      <el-form-item v-if="dataForm.type !== 2" :label="dataForm.typeList[dataForm.type] + '图标'" prop="icon">
        <el-row>
          <el-col :span="22">
            <el-popover ref="iconListPopover" placement="bottom-start" trigger="click" popper-class="mod-menu__icon-popover">
              <template #reference>
                <el-input v-model="dataForm.icon" :readonly="true" placeholder="菜单图标名称" class="icon-list__input" />
              </template>
              <div class="mod-menu__icon-inner">
                <div class="mod-menu__icon-list">
                  <el-button v-for="(item, index) in iconList" :key="index" :class="{ 'is-active': item === dataForm.icon }" @click="handleIconActive(item)">
                    <icon-svg :name="item" />
                  </el-button>
                </div>
              </div>
            </el-popover>
          </el-col>
          <el-col :span="2" class="icon-list__tips">
            <el-tooltip placement="top" effect="light">
              <div slot="content">
                全站推荐使用SVG Sprite, 详细请参考:<a href="//github.com/daxiongYang/renren-fast-vue/blob/master/src/icons/index.js" target="_blank">icons/index.js</a>描述
              </div>
              <i class="el-icon-warning" />
            </el-tooltip>
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item label="显示" prop="status">
        <el-switch v-model="dataForm.status" />
      </el-form-item>
      <el-form-item v-if="dataForm.type === 1" label="isTab" prop="isTab">
        <el-switch v-model="dataForm.isTab" />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getMenuList, getMenuInfo, postOrPutMenu } from '@/api/menu'
import Icon from '@/icons'

export default {
  data() {
    const validateUrl = (rule, value, callback) => {
      if (this.dataForm.type === 1 && !/\S/.test(value)) {
        callback(new Error('菜单URL不能为空'))
      } else {
        callback()
      }
    }
    const validateParentName = (rule, value, callback) => {
      if (this.dataForm.type !== 0 && (!/\S/.test(value) || !value)) {
        callback(new Error('上级菜单不能为空'))
      } else {
        callback()
      }
    }
    return {
      visible: false,
      dataForm: {
        id: 0,
        type: 1,
        typeList: ['目录', '菜单', '按钮'],
        name: '',
        parentId: 0,
        parentName: '',
        url: '',
        perms: '',
        orderNum: 0,
        icon: '',
        isTab: true,
        status: true
      },
      dataRule: {
        name: [
          { required: true, message: '菜单名称不能为空', trigger: 'blur' }
        ],
        parentName: [{ validator: validateParentName, trigger: 'change' }],
        url: [{ validator: validateUrl, trigger: 'blur' }]
      },
      iconList: [],
      menuList: [],
      menuListTreeProps: {
        label: 'name',
        children: 'children'
      }
    }
  },
  watch: {
    'dataForm.type': {
      handler(newValue, oldValue) {
        if (!this.dataForm.id) {
          let data
          if (newValue === 0) {
            data = {
              menuId: 0,
              name: '无'
            }
          } else {
            data = {
              menuId: 0,
              name: ''
            }
          }
          this.handleMenuListTreeCurrentChange(data)
        }
      },
      immediate: true
    }
  },
  created() {},
  methods: {
    init(id) {
      this.dataForm.id = id || 0
      this.visible = true
      this.$nextTick(async() => {
        this.$refs.dataForm.resetFields()
        this.iconList = Icon.getNameList()
        try {
          const { data: menuListData } = await getMenuList({
            menuTypes: '0,1'
          })
          if (menuListData && menuListData.code === 0) {
            this.menuList = menuListData.data
          }
          if (this.dataForm.id) {
            const { data: menuData } = await getMenuInfo({
              id: this.dataForm.id
            })
            if (menuData && menuData.code === 0) {
              this.dataForm.id = menuData.data.menuId
              this.dataForm.type = menuData.data.type
              this.dataForm.name = menuData.data.name
              this.dataForm.parentId = menuData.data.parentId
              this.dataForm.url = menuData.data.url
              this.dataForm.perms = menuData.data.perms
              this.dataForm.orderNum = menuData.data.orderNum
              this.dataForm.icon = menuData.data.icon
              this.dataForm.isTab = menuData.data.isTab
              this.dataForm.status = menuData.data.status
            }
          }
          this.menuListTreeSetCurrentNode()
        } catch (error) {
          console.log(error)
          this.$message.error('菜单数据加载失败')
        }
      })
    },
    // 菜单树选中
    handleMenuListTreeCurrentChange(data, node) {
      this.dataForm.parentId = data.menuId
      this.dataForm.parentName = data.name
      this.$refs.menuListPopover && this.$refs.menuListPopover.doClose()
    },
    // 菜单树设置当前选中节点
    menuListTreeSetCurrentNode() {
      this.$refs.menuListTree.setCurrentKey(this.dataForm.parentId)
      this.dataForm.parentName = (
        this.$refs.menuListTree.getCurrentNode() || {}
      ).name
    },
    // 图标选中
    handleIconActive(iconName) {
      this.dataForm.icon = iconName
      this.$refs.iconListPopover && this.$refs.iconListPopover.doClose()
    },
    // 表单提交
    dataFormSubmit() {
      this.$refs.dataForm.validate(async(valid) => {
        if (valid) {
          const { data } = await postOrPutMenu({
            menuId: this.dataForm.id || undefined,
            type: this.dataForm.type,
            name: this.dataForm.name,
            parentId: this.dataForm.parentId,
            url: this.dataForm.url,
            perms: this.dataForm.perms,
            orderNum: this.dataForm.orderNum,
            icon: this.dataForm.icon,
            isTab: this.dataForm.type === 1 ? this.dataForm.isTab : false,
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

<style lang="scss" scoped>
.mod-menu {
  .menu-list__input,
  .icon-list__input {
    > .el-input__inner {
      cursor: pointer;
    }
  }
  &__icon-popover {
    width: 458px;
    overflow: hidden;
  }
  &__icon-inner {
    width: 478px;
    max-height: 258px;
    overflow-x: hidden;
    overflow-y: auto;
  }
  &__icon-list {
    width: 458px;
    padding: 0;
    margin: -8px 0 0 -8px;
    > .el-button {
      padding: 8px;
      margin: 8px 0 0 8px;
      > span {
        display: inline-block;
        vertical-align: middle;
        width: 18px;
        height: 18px;
        font-size: 18px;
      }
    }
  }
  .icon-list__tips {
    font-size: 18px;
    text-align: center;
    color: #e6a23c;
    cursor: pointer;
  }
}
</style>
