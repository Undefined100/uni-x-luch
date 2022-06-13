# uni-x-luch

> 基于 luch-request 扩展的 uniapp 异步请求插件，为前端实现 API 统一管理的解决方案。

## 安装

```Bash
npm install uni-x-luch --save
```

## 注册

在入口文件 main.js 文件中

```js
import Vue from 'vue'
import $api from 'uni-x-luch'

// 注册插件
Vue.use($api)

// 或者，你也可以传入可选参数，完整配置参数如下：
Vue.use($api, {
  // globalOption配置与luch-request配置一致，luch-request配置参考luch-request配置一节
  globalOption: {
    baseURL: 'https://some-domain.com/api/'
  },

  // 请求拦截器
  requestIntercept(config){
    // 自定义处理逻辑
    return config
  },

  // 响应拦截器
  responseSuccIntercept(resp){
    // 自定义处理逻辑
    return resp
  },

  // 响应异常拦截器
  responseErrorIntercept(err){
    // 自定义处理逻辑
  },

  // API配置信息
  apiConfig：[{
    name: '通用查询接口',
    method: 'queryData',
    url: '/api/v1/basic/queryData'
  }, {
    name: '通用查询分页接口',
    method: 'pagingData',
    url: '/api/v1/basic/pagingData',
    type: 'get'
  }, {
    name: '通用新增接口',
    method: 'add',
    url: '/api/v1/basic/execute',
    type: 'post',
    /*静态参数*/
    data:{
      lcontent:'测试数据' //请求体参数
    }，
    params:{
      key:'i_s_sys_log'// url参数
    }
  }, {
    name: '路径参数型接口',
    method: 'getUser',
    url: '/api/v1/getUser/{id}'
  }]
})
```

### 最佳实践

1、将 API 的配置统一在一个文件中进行管理
2、在注册异步请求插件的地方，将 API 配置文件引入进行注册，如：

```
├── src
│   ├── api.js // 接口配置文件
│   ├── main.js
```

api.js 文件内容，如下：

```js
export default
[{
  name: '通用查询接口',
  method: 'queryData',
  url: '/api/v1/basic/queryData'
}, {
  name: '通用查询分页接口',
  method: 'pagingData',
  url: '/api/v1/basic/pagingData',
  type: 'get'
}, {
  name: '通用新增接口',
  method: 'add',
  url: '/api/v1/basic/execute',
  type: 'post',
  /*静态参数*/
  data:{
    lcontent:'测试数据' //请求体参数
  }，
  params:{
    key:'i_s_sys_log'// url参数
  }
}, {
  name: '路径参数型接口',
  method: 'getUser',
  url: '/api/v1/getUser/{id}'
}]
```

在入口文件 main.js 文件中

```js
import Vue from 'vue'
import apiConfig from './api'
import $api from 'uni-x-luch'

// 注册插件
Vue.use($api, {
  apiConfig
})
```

如果需要实时请求线上接口配置的场景，请参考[业务辅助方法](#业务辅助方法)一节。

## 使用方式

> 注册后，在组件环境中，通过 this.\$api 来调用，this 即组件实例对象；当非组件环境中，通过 Vue.\$api 来调用。

### 配置型接口请求

> 在注册的地方需要将 apiConfig 配置传入，比如根据以上传入的 API 配置信息，你就可以在组件中使用以下方式调用：

```js
// 使用方式
this.$api
  .queryData({
    // 与axios配置一致
    params: {
      key: 's_sys_menu_list',
      page_id: 90,
      user_id: 0
    }
  })
  .then(resp => {
    console.log(resp)
  })
  .catch(err => {
    console.log(err)
  })
  .finally(() => {
    console.log('done')
  })

this.$api
  .pagingData({})
  .then()
  .catch()
  .finally()
```

### restful 请求

> 在配置型接口基础上，会默认扩展一种路径参数型请求，通过对应方法的 restful 方法发起请求，并将匹配到的 params 参数替换到 url 路径上，未匹配到的参数拼接到 url 参数上，比如获取用户接口注册为：

```js
;[
  {
    name: '路径参数型接口',
    method: 'getUser',
    url: '/api/v1/getUser/{id}'
  }
]
```

则可发起以下调用：

```js
// 使用方式
this.$api.getUser
  .restful({
    // 与axios配置一致
    params: {
      id: 1,
      age: 18
    }
  })
  .then(resp => {
    console.log(resp)
  })
  .catch(err => {
    console.log(err)
  })
  .finally(() => {
    console.log('done')
  })
```

最终发起的请求为：/api/v1/getUser/1?age=18，以满足后端接口通过路径来接收参数的场景。

路径参数与 url 参数共存的场景，将参数配置在`restfulParams`上即可，如：

```js
this.$api.getUser
  .restful({
    params: {
      id: 1,
      age: 18
    },
    restfulParams: {
      id: 1
    }
  })
  .then(resp => {
    console.log(resp)
  })
  .catch(err => {
    console.log(err)
  })
  .finally(() => {
    console.log('done')
  })
```

最终发起的请求为：/api/v1/getUser/1?age=18&id=1。

### 语义化请求

```js
// Get请求
this.$api
  .get({
    // 与axios配置一致
    url: '/api/v2/basic/data',
    params: {
      key: 's_sys_menu_list',
      page_id: 90,
      user_id: 0
    }
  })
  .then(resp => {
    console.log(resp)
  })
  .catch(err => {
    console.log(err)
  })
  .finally(() => {
    console.log('done')
  })

// Post请求
this.$api
  .post({})
  .then()
  .catch()
  .finally()
// Delete请求
this.$api
  .delete({})
  .then()
  .catch()
  .finally()
// Put请求
this.$api
  .put({})
  .then()
  .catch()
  .finally()
```

### 链式请求

> 当一个接口需要另一个接口的返回值时，则链式请求就可以派上用场，使用方式如下：

```js
this.$api
  .queryData({
    params: {
      key: 'select_sys_menu_list',
      page_id: 90,
      user_id: 0
    }
  })
  .then(resp => {
    // resp即第一个接口返回的结果
    return this.$api.pagingData({
      params: {
        key: 'i_s_sys_log'
      }
    })
  })
  .then(resp => {
    // resp即第二个接口返回的结果
    return this.$api.add({
      data: {
        menu: resp.data.data,
        lcontent: '页面访问量'
      }
    })
  })
  .then(resp => {
    console.log(resp)
  })
```

### 并发请求

```js
const request1 = () => {
  return this.$api.add({
    params: {
      key: 'i_s_sys_log'
    },
    data: {
      lcontent: '页面访问量'
    }
  })
}
const request2 = () => {
  return this.$api.queryData({
    params: {
      key: 's_sys_menu_list',
      page_id: 90,
      user_id: 0
    }
  })
}

this.$api([request1, request2]).then(([resp1, resp2]) => {
  // 多个请求都完成时，才会调用then的回调
  // resp1即request1的响应结果，resp2即request2的响应结果，顺序与传入的请求顺序保持一致
  console.log(resp1)
  console.log(resp2)
})
```

### 取消请求

```js
// 取消所有发起的请求
this.$api.cancel()

//取消指定的请求
this.$api.get({
  name:'s_sys_user_list',
  ...
}
}).then()
//发起请求的时候，指定name属性，取消请求的时候，就用name属性值来取消请求
this.$api.cancel('s_sys_user_list')

//第二个参数作为提示信息显示在控制台
this.$api.cancel('s_sys_user_list','取消了用户接口的请求')
```

## token 机制

> 实现思路：在注册插件时，注册请求拦截器和响应异常拦截器，在请求拦截器里给请求头设置 token，在响应异常拦截器里处理 token 过期时的逻辑

```js
import $api from 'uni-x-luch'

let apiConfig = {
  // 请求拦截器
  requestIntercept(config) {
    config.headers['Authorization'] = `Bearer token值`
    return config
  },
  // 响应异常拦截器
  responseErrorIntercept(error) {
    if (error.response.status === 401) {
      // token过期，自动跳到登录路由
      // router.push({ name: 'login' }) //如，跳转到登录页
    }
  }
}
Vue.use($api, apiConfig)
```

## 业务辅助方法

> 在 uni-x-luch 基础之上封装了一层业务辅助类，方便请求线上文件进行接口注册，以及内置好 token 机制，以减少使用者的初始化工作。

1. 执行 npm install uni-x-luch --save，安装好 uni-x-luch 包；

2. 在入口 main.js 文件里通过 apiHelper 进行初始化，使用方式如：

```js
// 异步请求插件-业务辅助方法
import { apiHelper } from 'uni-x-luch'

apiHelper
  .register({
    url: '/web/config/system_config.json'
  })
  .then(() => {
    new Vue({
      template: '<App/>',
      components: { App }
    }).$mount('#app')
  })
```

在 system_config.json 文件中，可对 baseURL、hosts、api 进行配置，如：

```js
{
  "baseURL": "https://some-domain.com", // 默认为当前站点，当前后端分离部署时，可通过设置baseURL来设置目标接口地址，PS：请确认，后端接口支持跨域请求
  "api": [{
    "name": "基础数据接口V1版本",
    "method": "queryData",
    "url": "/api/v1/queryData",
    "type": "get"
  }]
}
```

如果本地开发未设置请求代理，请传入线上文件完整 url 地址，如：https://some-domain.com/web/config/system_config.json , 这样，即完成了线上文件中的接口注册，在业务模块中即可发起线上文件中配置的接口请求了，具体请求方式请参考[配置型接口请求](#配置型接口请求)。

如果要禁用或自定义辅助方法内的请求拦截器、响应拦截器、响应异常拦截器，则传入 null（禁用）或者自定义逻辑函数，如禁用代码如下：

```js
import { apiHelper } from 'uni-x-luch'

apiHelper
  .register({
    url: '/web/config/system_config.json',
    requestIntercept: null,
    responseSuccIntercept: null,
    responseErrorIntercept: null
  })
  .then(() => {
    new Vue({
      template: '<App/>',
      components: { App }
    }).$mount('#app')
  })
```

自定义函数逻辑，如下：

```js
import { apiHelper } from 'uni-x-luch'

apiHelper
  .register({
    url: '/web/config/system_config.json', // 请求线上接口配置文件
    // 请求拦截器
    requestIntercept(config) {
      // 自定义处理逻辑
      return config
    },
    // 响应拦截器
    responseSuccIntercept(resp) {
      // 自定义处理逻辑
      return resp
    },
    // 响应异常拦截器
    responseErrorIntercept(err) {
      // 自定义处理逻辑
    }
  })
  .then(() => {
    new Vue({
      template: '<App/>',
      components: { App }
    }).$mount('#app')
  })
```

说明：因为内部请求线上文件的动作是异步的，所以后续的操作应该在 apiHelper.register 的 then 回调中去处理，比如 Vue 根实例的初始化。

## 附：官方 luch-request 完整配置参考

```js
{
    baseURL: '',
    header: {},
    method: 'GET',
    dataType: 'json',
    // #ifndef MP-ALIPAY
    responseType: 'text',
    // #endif
    // 注：如果局部custom与全局custom有同名属性，则后面的属性会覆盖前面的属性，相当于Object.assign(全局，局部)
    custom: {}, // 全局自定义参数默认值
    // #ifdef H5 || APP-PLUS || MP-ALIPAY || MP-WEIXIN
    timeout: 60000,
    // #endif
    // #ifdef APP-PLUS
    sslVerify: true,
    // #endif
    // #ifdef H5
    // 跨域请求时是否携带凭证（cookies）仅H5支持（HBuilderX 2.6.15+）
    withCredentials: false,
    // #endif
    // #ifdef APP-PLUS
    firstIpv4: false, // DNS解析时优先使用ipv4 仅 App-Android 支持 (HBuilderX 2.8.0+)
    // #endif
    // 局部优先级高于全局，返回当前请求的task,options。请勿在此处修改options。非必填
    // getTask: (task, options) => {
    // 相当于设置了请求超时时间500ms
    //   setTimeout(() => {
    //     task.abort()
    //   }, 500)
    // },
    // 全局自定义验证器。参数为statusCode 且必存在，不用判断空情况。
    validateStatus: (statusCode) => { // statusCode 必存在。此处示例为全局默认配置
        return statusCode >= 200 && statusCode < 300
    }
  }
```

## 更新日志

- 1.0.
  新增 版本发布
