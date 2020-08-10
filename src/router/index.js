import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from './../components/login'
import Home from './../components/home'
import Welcome from './../components/welcome'
import Users from './../components/users/users'
import Rights from './../components/power/rights'
import Roles from './../components/power/roles'
import Cate from './../components/goods/cate'
import Params from './../components/goods/params'
import List from './../components/goods/list'
import Add from './../components/goods/add'
Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: List },
      { path: '/goods/add', component: Add }
    ]
  }
]

const router = new VueRouter({
  routes
})
// 挂载路由导航守卫
router.beforeEach((to, form, next) => {
  if (to.path === '/login') next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})
export default router
