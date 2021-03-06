import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import VueAxios from 'vue-axios'
import './assets/css/global.css'
// import ElementUI from 'element-ui'
import VueQuillEditor from 'vue-quill-editor'

import Nprogress from 'nprogress'

// Vue.use(ElementUI)
Vue.use(VueAxios, axios)
Vue.use(VueQuillEditor)
Vue.config.productionTip = false
Vue.filter('dataFormat', function (originVal) {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
// axios.defaults.baseURL = 'http://119.23.53.78:8888/api/private/v1/'
axios.defaults.baseURL = 'http://47.115.124.102:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  Nprogress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
axios.interceptors.response.use((config) => {
  Nprogress.done()
  return config
})
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
