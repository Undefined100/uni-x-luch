import Vue from 'vue'
import App from './App.vue'
import VuePlugin from './lib/uni-x-luch'

Vue.use(VuePlugin, {
  // globalOption配置与luch-request配置一致，luch-request配置参考luch-request配置一节
  globalOption: {
    // baseURL: 'http://localhost:9000'
  },
  // 配置型接口
  apiConfig: [
    {
      name: '测试接口',
      method: 'dataV1',
      url: '/api/v1/basic/data',
      type: 'get'
    },
    {
      name: '执行接口',
      method: 'dataV2',
      url: '/api/v2/basic/data/execute',
      type: 'post',
      /* 静态参数 */
      data: {
        lcontent: '测试参数' // 请求体参数
      },
      params: {
        key: 'i_s_sys_log' // url参数
      }
    }
  ]
})

let vm = new Vue({
  el: '#app',
  render: h => h(App)
})

Vue.use(vm)
