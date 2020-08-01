<template>
  <div class="home">
    <el-container class="home-container">
      <!-- 头部区域 -->
      <el-header>
        <div>
          <img src="./../assets/logo.png" alt />
          <span>电商后台管理系统</span>
        </div>
        <el-button type="info" @click="logout">退出</el-button>
      </el-header>
      <!-- 页面主体区域 -->
      <el-container>
        <!-- 侧边栏 -->
        <el-aside :width="isCollapse?'64px':'200px'">
          <div class="toggle-button" @click="toggleCollapse">|||</div>
          <!-- 一级菜单 -->
          <el-menu
            background-color="#333744"
            text-color="#fff"
            active-text-color="#409BFF"
            unique-opened
            :collapse='isCollapse'
            :collapse-transition='false'
            router
            :default-active='$route.path'
          >
            <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id" >
              <template slot="title">
                <!-- 图标 -->
                <i :class="iconObj[item.id]"></i>
                <!-- 文本 -->
                <span>{{item.authName}}</span>
              </template>
              <!-- 二级菜单 -->
              <el-menu-item
                :index="'/'+subItem.path"
                v-for="subItem in item.children"
                :key="subItem.id"
              >
                <template slot="title">
                  <!-- 图标 -->
                  <i class="el-icon-menu"></i>
                  <!-- 文本 -->
                  <span>{{subItem.authName}}</span>
                </template>
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <!-- 右侧内容主体 -->
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>
<script>
export default {
  data () {
    return {
      menuList: [],
      iconObj: {
        125: 'el-icon-user-solid',
        103: 'el-icon-info',
        101: 'el-icon-s-goods',
        102: 'el-icon-s-order',
        145: 'el-icon-s-marketing'
      },
      isCollapse: false
    }
  },
  created () {
    this.getMenuList()
  },
  methods: {
    logout () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取所有菜单
    getMenuList () {
      this.axios.get('/menus').then(res => {
        if (res.data.meta.status !== 200) { return this.$message.error(res.data.meta.msg) }
        this.menuList = res.data.data
      })
    },
    // 点击按钮切换菜单的折叠与展开
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    }
  }
}
</script>
<style lang='less'>
.home {
  height: 100%;
  .home-container {
    height: 100%;
  }
  .el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    align-items: center;
    div {
      height: 60px;
      line-height: 60px;
      display: flex;
      align-items: center;
      img {
        height: 100%;
        border-radius: 50%;
      }
      span {
        color: #fff;
        font-size: 20px;
        padding-left: 20px;
      }
    }
  }
  .el-aside {
    background-color: #333744;
    .el-menu {
      border-right: none;
    }
    .toggle-button {
      background-color: #4a5064;
      font-size: 10px;
      line-height: 24px;
      color: #fff;
      text-align: center;
      letter-spacing: 0.2em;
      cursor: pointer;
    }
  }
  .el-main {
    background-color: #eaedf1;
  }
}
</style>
