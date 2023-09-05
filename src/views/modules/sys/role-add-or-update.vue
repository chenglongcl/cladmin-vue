<template>
  <el-dialog :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false" :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
      <el-form-item label="角色名称" prop="roleName">
        <el-input v-model="dataForm.roleName" placeholder="角色名称"></el-input>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="dataForm.remark" placeholder="备注"></el-input>
      </el-form-item>
      <el-form-item size="mini" label="授权">
        <el-tree :data="menuList" :props="menuListTreeProps" node-key="menuId" ref="menuListTree" :default-expand-all="true" show-checkbox>
        </el-tree>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { treeDataTranslate } from "@/utils";
import { mapState } from "vuex";
export default {
  data() {
    return {
      visible: false,
      menuList: [],
      menuListTreeProps: {
        label: "name",
        children: "children",
      },
      dataForm: {
        id: 0,
        roleName: "",
        remark: "",
      },
      dataRule: {
        roleName: [
          { required: true, message: "角色名称不能为空", trigger: "blur" },
        ],
      },
      tempKey: 666666, // 临时key, 用于解决tree半选中状态项不能传给后台接口问题. # 待优化
    };
  },
  computed: {
    ...mapState({
      userInfo: (state) => state.user,
    }),
  },
  methods: {
    init(id) {
      this.dataForm.id = id || 0;
      this.$http
        .getMenuList()
        .then(({ data }) => {
          this.menuList = treeDataTranslate(data.data, "menuId");
        })
        .then(() => {
          this.visible = true;
          this.$nextTick(() => {
            this.$refs["dataForm"].resetFields();
            this.$refs.menuListTree.setCheckedKeys([]);
          });
        })
        .then(() => {
          if (this.dataForm.id) {
            this.$http
              .getRoleInfo({ id: this.dataForm.id })
              .then(({ data }) => {
                if (data && data.code === 0) {
                  this.dataForm.roleName = data.data.roleName;
                  this.dataForm.remark = data.data.remark;
                  var idx = data.data.menuIdList.indexOf(this.tempKey);
                  if (idx !== -1) {
                    data.data.menuIdList.splice(
                      idx,
                      data.data.menuIdList.length - idx
                    );
                  }
                  this.$refs.menuListTree.setCheckedKeys(data.data.menuIdList);
                }
              });
          }
        });
    },
    // 表单提交
    dataFormSubmit() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          this.$http
            .postOrPutRole({
              roleId: this.dataForm.id || undefined,
              roleName: this.dataForm.roleName,
              remark: this.dataForm.remark,
              createUserId: this.userInfo.id,
              menuIdList: [].concat(
                this.$refs.menuListTree.getCheckedKeys(),
                [this.tempKey],
                this.$refs.menuListTree.getHalfCheckedKeys()
              ),
            })
            .then(({ data }) => {
              if (data && data.code === 0) {
                this.$message({
                  message: "操作成功",
                  type: "success",
                  duration: 1500,
                  onClose: () => {
                    this.visible = false;
                    this.$emit("refreshDataList");
                  },
                });
              } else {
                this.$message.error(data.message);
              }
            });
        }
      });
    },
  },
};
</script>
