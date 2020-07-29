import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import VueAxios from 'vue-axios'
import './plugins/element.js'
import './assets/css/global.css'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
Vue.use(ElementUI)
Vue.use(VueAxios, axios)
Vue.config.productionTip = false
axios.defaults.baseURL = 'http://47.115.124.102:8888/api/private/v1/'
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
