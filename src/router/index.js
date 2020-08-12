import Vue from 'vue'
import VueRouter from 'vue-router'

const Login = () => import(/* webpackChunkName: "Login_Home_Welcome" */ './../components/login')
const Home = () => import(/* webpackChunkName: "Login_Home_Welcome" */ './../components/home')
const Welcome = () => import(/* webpackChunkName: "Login_Home_Welcome" */ './../components/welcome')
// import Login from './../components/login'
// import Home from './../components/home'
// import Welcome from './../components/welcome'

const Users = () => import(/* webpackChunkName: "Users" */ './../components/users/users')
// import Users from './../components/users/users'

const Rights = () => import(/* webpackChunkName: "Rights_Roles" */ './../components/power/rights')
const Roles = () => import(/* webpackChunkName: "Rights_Roles" */ './../components/power/roles')
// import Rights from './../components/power/rights'
// import Roles from './../components/power/roles'

const Cate = () => import(/* webpackChunkName: "Cate_Params_List_Add" */ './../components/goods/cate')
const Params = () => import(/* webpackChunkName: "Cate_Params_List_Add" */ './../components/goods/params')
const List = () => import(/* webpackChunkName: "Cate_Params_List_Add" */ './../components/goods/list')
const Add = () => import(/* webpackChunkName: "Cate_Params_List_Add" */ './../components/goods/add')
// import Cate from './../components/goods/cate'
// import Params from './../components/goods/params'
// import List from './../components/goods/list'
// import Add from './../components/goods/add'

const Order = () => import(/* webpackChunkName: "Order_Report" */ './../components/order/order')
const Report = () => import(/* webpackChunkName: "Order_Report" */ './../components/report/report')
// import Order from './../components/order/order'
// import Report from './../components/report/report'
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
      { path: '/goods/add', component: Add },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report }
    ]
  }
]

const router = new VueRouter({
  routes
})
// 挂载路由导航守卫,to表示将要访问的路径，from表示从哪里来，next是下一个要做的操作 next('/login')强制跳转login
router.beforeEach((to, form, next) => {
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})
export default router
