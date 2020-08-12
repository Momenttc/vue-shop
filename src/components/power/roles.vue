<template>
  <div class="roles">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRolesDialog=!addRolesDialog">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色表格区域 -->
      <el-table :data="roleList" border stripe row-key="id">
        <!-- 扩展 -->
        <el-table-column type="expand">
          <template v-slot="slotProps">
            <el-row
              :class='["bdbottom", i1===0?"bdtop":"","vcenter"]'
              v-for="(item1,i1) in slotProps.row.children"
              :key="i1"
            >
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag
                  @close="removeRightsById(slotProps.row,item1.id)"
                  closable
                >{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级和三级权限 -->
              <el-col :span="19">
                <el-row
                  :class='[i2===0?"":"bdtop","vcenter"]'
                  v-for="(item2,i2) in item1.children"
                  :key="i2"
                >
                  <!-- 二级权限 -->
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      @close="removeRightsById(slotProps.row,item2.id)"
                      closable
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      class="three-tag"
                      type="warning"
                      v-for="(item3,i3) in item2.children"
                      :key="i3"
                      @close="removeRightsById(slotProps.row,item3.id)"
                      closable
                    >{{item2.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot="slotProps">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="getRolesInfo(slotProps.row.id)"
            >编辑</el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="delRole(slotProps.row.id)"
            >删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="setRights(slotProps.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="addRolesDialog " width="50%" @close="closeRoleDialog">
      <el-form :model="addRolesList" :rules="rolesFormRules" ref="rolesFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRolesList.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRolesList.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRolesDialog= false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑角色对话框 -->
    <el-dialog title="编辑角色" :visible.sync="editRolesDialog " width="50%">
      <el-form
        :model="RolesInfo"
        :rules="rolesFormRules"
        ref="editRolesFormRef"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="RolesInfo.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="RolesInfo.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRolesDialog= false">取 消</el-button>
        <el-button type="primary" @click="editRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightsDialogVisible"
      width="50%"
      @close="setRightsDialogClosed"
    >
      <el-tree
        :data="allRights"
        :props="rightsProps"
        node-key="id"
        show-checkbox
        default-expand-all
        :default-checked-keys="defKeys"
        ref="setRightsRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allRight">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 角色列表
      roleList: [],
      roleItem: {},
      // 添加角色弹框
      addRolesDialog: false,
      // 添加 编辑角色规则
      rolesFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      // 添加角色
      addRolesList: {
        roleName: '',
        roleDesc: ''
      },
      // 编辑角色
      editRolesDialog: false,
      // 编辑角色信息
      RolesInfo: {},
      // 分配权限对话框显示与否
      setRightsDialogVisible: false,
      // 所有权限的数据
      allRights: [],
      rightsProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认选中的节点
      defKeys: [],
      // 获取角色的id
      roleId: ''
    }
  },
  created () {
    // 获取角色列表
    this.getRoleList()
  },
  methods: {
    // 获取角色列表
    async getRoleList () {
      const { data: res } = await this.axios.get('/roles')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.roleList = res.data
    },
    // 添加角色
    addRoles () {
      this.$refs.rolesFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.axios.post(
          '/roles',
          this.addRolesList
        )
        console.log(res)
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.$message.success('添加成功')
        this.addRolesDialog = false
        this.getRoleList()
      })
    },
    // 关闭添加角色表单重置
    closeRoleDialog () {
      this.$refs.rolesFormRef.resetFields()
    },
    // 根据用户id获取角色信息
    async getRolesInfo (id) {
      this.editRolesDialog = true
      const { data: res } = await this.axios.get(`roles/${id}`)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.RolesInfo = res.data
    },
    // 编辑角色
    editRoles () {
      this.$refs.editRolesFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.axios.put(
          `/roles/${this.RolesInfo.roleId}`,
          this.RolesInfo
        )
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success('编辑成功')
        this.editRolesDialog = false
        this.getRoleList()
      })
    },
    // 删除角色
    async delRole (id) {
      const confirm = await this.$confirm(
        '此操作将永久删除该角色，是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirm !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await this.axios.delete(`roles/${id}`)
      if (res.meta.status !== 200) return this.$message.error('res.meta.msg')
      this.$message.success('删除成功')
      this.getRoleList()
    },
    // 删除权限
    async removeRightsById (role, rightId) {
      const confirm = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirm !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await this.axios.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      role.children = res.data
    },
    // 分配权限
    async setRights (role) {
      this.roleId = role.id
      const { data: res } = await this.axios.get('/rights/tree')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.allRights = res.data
      this.setRightsDialogVisible = true
      this.getLeafList(role, this.defKeys)
      console.log(this.defKeys)
    },
    // 获取权限中树的节点并保存到数组中
    getLeafList (root, arr) {
      if (!root.children) {
        return arr.push(root.id)
      }
      root.children.forEach(item => {
        this.getLeafList(item, arr)
      })
    },
    // 关闭编辑角色对话框的时候清空数组
    setRightsDialogClosed () {
      this.defKeys = []
    },
    // 为角色分配权限
    async allRight () {
      const setRightArr = [
        ...this.$refs.setRightsRef.getCheckedKeys(),
        ...this.$refs.setRightsRef.getHalfCheckedKeys()
      ]
      console.log(setRightArr)
      const idStr = setRightArr.join(',')
      const {
        data: res
      } = await this.axios.post(`/roles/${this.roleId}/rights`, {
        rids: idStr
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.setRightsDialogVisible = false
      this.getRoleList()
      this.$message.success('分配权限成功')
    }
  }
}
</script>
<style lang="less">
.roles {
  .el-tag {
    margin: 10px 0;
  }
  .bdbottom {
    border-bottom: 1px solid #eee;
  }
  .bdtop {
    border-top: 1px solid #eee;
  }
  .three-tag {
    margin-right: 10px;
  }
  .vcenter {
    display: flex;
    align-items: center;
  }
}
</style>
