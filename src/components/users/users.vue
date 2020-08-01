<template>
  <div class="users">
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="grid-content bg-purple">
            <el-input
              placeholder="请输入内容"
              v-model="usersListParams.query"
              clearable
              @clear="getUsersList"
            >
              <el-button slot="append" icon="el-icon-search" @click="getUsersList"></el-button>
            </el-input>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="grid-content bg-purple">
            <el-button type="primary" @click="dialogVisible=!dialogVisible">添加用户</el-button>
          </div>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="usersList" stripe border>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template v-slot="slotProps">
            <el-switch v-model="slotProps.row.mg_state" @change="changeUsersState(slotProps.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column prop="address" label="操作">
          <template v-slot="slotProps">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editDialog(slotProps.row.id)"
            ></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click='delUser(slotProps.row.id)'></el-button>
            <el-tooltip content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="usersListParams.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="usersListParams.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 对话框区域 -->
    <el-dialog title="添加用户" :visible.sync="dialogVisible" width="50%" @close="dialogClose">
      <el-form ref="usersFormRef" :model="addUser" :rules="usersRules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUser.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addUser.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUser.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addUser.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUsers">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑对话框区域 -->
    <el-dialog title="编辑用户" :visible.sync="showEdit" width="50%"  @close='editDialogClose'>
      <el-form ref="selectEditRef" :model="selectEdit" :rules='selectEditRules' label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="selectEdit.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop='email'>
          <el-input v-model="selectEdit.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop='mobile'>
          <el-input v-model="selectEdit.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showEdit = false">取 消</el-button>
        <el-button type="primary" @click='editUsersSummit'>确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    // 邮箱校验规则
    const checkEmail = (rule, value, callback) => {
      const regEmail = /^([a-zA-Z0-9_])+@([a-zA-Z0-9_])+(\.[a-zA-Z0-9_])+/
      if (regEmail.test(value)) {
        return callback()
      }
      callback(new Error('请输入正确的邮箱'))
    }
    // 手机号验证规则
    const checkMobile = (rule, value, callback) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        return callback()
      }
      callback(new Error('请输入正确的手机号'))
    }
    return {
      // 用户列表参数
      usersListParams: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      // 用户列表
      usersList: [],
      // 用户总条数
      total: 0,
      // t添加用户对话框显示或隐藏
      dialogVisible: false,
      // 添加用户
      addUser: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      usersRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 6, message: '长度在 3 到 6 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 5, max: 15, message: '长度在 5 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 编辑用户对话框显示与隐藏
      showEdit: false,
      // 根据用户id查询用户信息
      selectEdit: {},
      // 编辑用户表单验证规则
      selectEditRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getUsersList()
  },
  methods: {
    // 获取用户列表
    async getUsersList () {
      const { data: res } = await this.axios.get('/users', {
        params: this.usersListParams
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败')
      }
      this.usersList = res.data.users
      this.total = res.data.total
    },
    // 当前页面显示的用户条数
    handleSizeChange (newList) {
      console.log(newList)
      this.usersListParams.pagesize = newList
      this.getUsersList()
    },
    // 切换页面
    handleCurrentChange (newPageNum) {
      this.usersListParams.pagenum = newPageNum
      this.getUsersList()
    },
    // 更新用户状态
    async changeUsersState (usersState) {
      const { data: res } = await this.axios.put(
        `users/${usersState.id}/state/${usersState.mg_state}`
      )
      if (res.meta.status !== 200) {
        usersState.mg_state = !usersState.mg_state
        return this.$message.error('更新状态失败')
      }
      this.$message.success('更新状态成功')
    },
    // 添加用户表单重置
    dialogClose () {
      this.$refs.usersFormRef.resetFields()
    },
    // 点击确定按钮添加用户
    addUsers () {
      // 为添加用户发起网络请求
      this.$refs.usersFormRef.validate(async valid => {
        if (!valid) return 0
        const { data: res } = await this.axios.post('/users', this.addUser)
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success('添加用户成功')
        // 隐藏用户对话框
        this.dialogVisible = false
        // 重新获取用户列表数据
        this.getUsersList()
      })
    },
    // 编辑用户列表
    async editDialog (id) {
      this.showEdit = true
      const { data: res } = await this.axios.get(`/users/${id}`)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.selectEdit = res.data
      this.showEdit = true
    },
    // 关闭编辑用户表单重置功能
    editDialogClose () {
      this.$refs.selectEditRef.resetFields()
    },
    // 编辑用户并提交
    editUsersSummit () {
      // 提交之前要先进行表单预验证
      this.$refs.selectEditRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.axios.put(`users/${this.selectEdit.id}`, {
          email: this.selectEdit.email,
          mobile: this.selectEdit.mobile
        })
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        // 更新成功后要 关闭对话框 提示用户更新成功 重新渲染列表
        this.showEdit = false
        this.$message.success('更新成功')
        this.getUsersList()
      })
    },
    // 删除用户
    async delUser (id) {
      const confirm = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirm !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await this.axios.delete(`users/${id}`)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success('删除成功')
      this.getUsersList()
    }
  }
}
</script>
<style lang="less" scoped>
</style>
