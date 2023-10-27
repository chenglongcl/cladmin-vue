<template>
  <el-dialog :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false" :visible.sync="visible">
    <el-form ref="dataForm" :model="dataForm" :rules="dataRule" label-width="80px" @keyup.enter.native="dataFormSubmit()">
      <el-form-item label="分类名称" prop="name">
        <el-input v-model="dataForm.name" placeholder="分类名称" />
      </el-form-item>
      <el-form-item label="上级分类" prop="parentName">
        <el-popover ref="menuListPopover" placement="bottom-start" trigger="click">
          <template #reference>
            <el-input v-model="dataForm.parentName" :readonly="true" placeholder="点击选择上级菜单" class="menu-list__input" />
          </template>
          <el-tree ref="menuListTree" :data="menuList" :props="menuListTreeProps" node-key="categoryId" :default-expand-all="true" :highlight-current="true" :expand-on-click-node="false" @current-change="handleMenuListTreeCurrentChange" />
        </el-popover>
      </el-form-item>
      <el-form-item v-if="dataForm.type !== 2" label="排序号" prop="orderNum">
        <el-input-number v-model="dataForm.orderNum" controls-position="right" :min="0" label="排序号" />
      </el-form-item>
      <el-form-item v-if="dataForm.type !== 2" label="菜单图标" prop="icon">
        <el-row>
          <el-col :span="22">
            <el-popover ref="iconListPopover" placement="bottom-start" trigger="click" popper-class="mod-category__icon-popover">
              <template #reference>
                <el-input v-model="dataForm.icon" :readonly="true" placeholder="菜单图标名称" class="icon-list__input" />
              </template>
              <div class="mod-category__icon-inner">
                <div class="mod-category__icon-list">
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
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import {
  getCategoryList,
  getCategoryInfo,
  postOrPutCategory
} from '@/api/category'
import Icon from '@/icons'

export default {
  data() {
    return {
      visible: false,
      dataForm: {
        id: 0,
        name: '',
        parentId: 0,
        parentName: '',
        orderNum: 0,
        icon: '',
        iconList: []
      },
      dataRule: {
        name: [
          { required: true, message: '分类名称不能为空', trigger: 'blur' }
        ],
        parentName: [
          { required: true, message: '上级菜单不能为空', trigger: 'change' }
        ]
      },
      menuList: [],
      menuListTreeProps: {
        label: 'name',
        children: 'children'
      }
    }
  },
  created() {
    this.iconList = Icon.getNameList()
  },
  methods: {
    init(id) {
      this.dataForm.id = id || 0
      this.visible = true
      this.$nextTick(async() => {
        this.$refs.dataForm.resetFields()
        this.dataForm.parentId = 0
        try {
          const { data: categoryListData } = await getCategoryList()
          if (categoryListData && categoryListData.code === 0) {
            this.menuList = categoryListData.data
          }
          if (this.dataForm.id) {
            const { data: categoryData } = await getCategoryInfo({
              id: this.dataForm.id
            })
            if (categoryData && categoryData.code === 0) {
              this.dataForm.id = categoryData.data.categoryId
              this.dataForm.name = categoryData.data.name
              this.dataForm.parentId = categoryData.data.parentId
              this.dataForm.orderNum = categoryData.data.orderNum
              this.dataForm.icon = categoryData.data.icon
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
      this.dataForm.parentId = data.categoryId
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
    // 图标选中
    handleIconActive(iconName) {
      this.dataForm.icon = iconName
      this.$refs.iconListPopover && this.$refs.iconListPopover.doClose()
    },
    // 表单提交
    dataFormSubmit() {
      this.$refs.dataForm.validate(async(valid) => {
        if (valid) {
          const { data } = await postOrPutCategory({
            categoryId: this.dataForm.id || undefined,
            name: this.dataForm.name,
            parentId: this.dataForm.parentId,
            orderNum: this.dataForm.orderNum,
            icon: this.dataForm.icon
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

<style lang="scss">
.mod-category {
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
