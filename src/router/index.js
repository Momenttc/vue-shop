import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from './../components/login'
import Home from './../components/home'
Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/home', component: Home }
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