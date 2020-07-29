<template>
  <div class='login'>
    <div class='login-box'>
      <!-- 表单头像 -->
      <div class='avatar-box'>
        <img src='./../assets/logo.png' alt="">
      </div>
      <!-- 登录表单区域 -->
      <el-form ref='loginFormRef' class='form-box' :model='loginForm' :rules='loginFormRules'>
        <!-- 用户名 -->
        <el-form-item class='item' prop='username'>
          <el-input prefix-icon='el-icon-user' v-model='loginForm.username'></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item class='item' prop='password'>
          <el-input prefix-icon='el-icon-lock' v-model='loginForm.password' type='password'></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class='btns'>
          <el-button type='primary' @click='login'>登录</el-button>
          <el-button type='info' @click='RefLoginForm'>重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'login',
  data () {
    return {
      // 登录表单的数据绑定对象
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // 表单的验证规则对象
      loginFormRules: {
        username: [
          { required: true, message: '请输入登录名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 表单的重置
    RefLoginForm () {
      this.$refs.loginFormRef.resetFields()
    },
    // 登录预验证
    login () {
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.axios.post('login', this.loginForm)
        console.log(res)
        if (res.meta.status !== 200) return this.$message.error('登录失败')
        this.$message.success('登录成功')
        // 把token放到sessionStorage中
        window.sessionStorage.setItem('token', res.data.token)
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less">
 .login{
   background-color: #2b4b6b;
   height: 100%;
 }
 .login-box{
   width: 450px;
   height: 300px;
   background-color: #fff;
   border-radius: 3px;
   position: absolute;
   left: 50%;
   top: 50%;
   transform: translate(-50%, -50%);

   .avatar-box{
     width: 130px;
     height: 130px;
     background-color: #fff;
     border: 1px solid #eee;
     border-radius: 50%;
     padding: 10px;
     box-shadow: 0 0 10px #ddd;
     margin: 0 auto;
     transform: translateY(-50%);
     img{
       width: 100%;
       border-radius: 50%;
       background-color: #eee;
     }
   }

   .form-box{
     position: absolute;
     bottom: 0;
     padding: 0 20px;
     box-sizing: border-box;
     width: 100%;
     .btns{
       display: flex;
       justify-content: flex-end;
     }
   }
 }
</style>
