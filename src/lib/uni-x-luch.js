import Request from 'luch-request'

let cachePool = {} // 缓存池
// let CACHE_TIME = 60000 // 缓存时间，单位ms
let apiSignature = [] // 接口签名，用于判断重复接口

const defaultOption = {
  // baseURL: '',
  // header: {},
  // method: 'GET',
  // dataType: 'json',
  // // #ifndef MP-ALIPAY
  // responseType: 'text',
  // // #endif
  // // 注：如果局部custom与全局custom有同名属性，则后面的属性会覆盖前面的属性，相当于Object.assign(全局，局部)
  // custom: {}, // 全局自定义参数默认值
  // // #ifdef H5 || APP-PLUS || MP-ALIPAY || MP-WEIXIN
  // timeout: 60000,
  // // #endif
  // // #ifdef APP-PLUS
  // sslVerify: true,
  // // #endif
  // // #ifdef H5
  // // 跨域请求时是否携带凭证（cookies）仅H5支持（HBuilderX 2.6.15+）
  // withCredentials: false,
  // // #endif
  // // #ifdef APP-PLUS
  // firstIpv4: false, // DNS解析时优先使用ipv4 仅 App-Android 支持 (HBuilderX 2.8.0+)
  // // #endif
  // // 局部优先级高于全局，返回当前请求的task,options。请勿在此处修改options。非必填
  // // getTask: (task, options) => {
  // // 相当于设置了请求超时时间500ms
  // //   setTimeout(() => {
  // //     task.abort()
  // //   }, 500)
  // // },
  // // 全局自定义验证器。参数为statusCode 且必存在，不用判断空情况。
  // validateStatus: (statusCode) => { // statusCode 必存在。此处示例为全局默认配置
  //     return statusCode >= 200 && statusCode < 300
  // }
}

let api = {
  install: (
    Vue,
    {
      apiConfig,
      // cacheTime,
      globalOption,
      requestIntercept,
      responseSuccIntercept,
      responseErrorIntercept
    } = {}
  ) => {
    let $api
    globalOption = Object.assign({}, defaultOption, globalOption, { header: globalOption.headers })
    const http = new Request(globalOption)

    // http请求拦截器
    http.interceptors.request.use(
      config =>
        // const {
        //   url,
        //   method,
        //   data,
        //   params
        //   cache,
        //   cacheTime: _cacheTime
        // } = config
        // if (cache) {
        //   const source = CancelToken.source()
        //   config.cancelToken = source.token
        //   // 去缓存池获取缓存数据
        //   const cacheKey = `${url}_${method}_${
        //     params ? JSON.stringify(params) : ''
        //   }_${data ? JSON.stringify(data) : ''}`
        //   const cacheData = cachePool[cacheKey]
        //   const expireTime = new Date().getTime() // 获取当前时间戳
        //   // 判断缓存池中是否存在已有数据，存在的话，再判断是否过期
        //   // 未过期 source.cancel会取消当前的请求 并将内容返回到拦截器的err中
        //   if (
        //     cacheData &&
        //     expireTime - cacheData.expire < (_cacheTime || CACHE_TIME)
        //   ) {
        //     source.cancel(cacheData)
        //   }
        // }
        requestIntercept ? requestIntercept(config) : config,
      err => Promise.reject(err)
    )

    // http响应拦截器
    http.interceptors.response.use(
      resp => {
        // if (resp.status && resp.config && resp.headers && resp.request) {
        // 来自接口的响应
        const {
          name
          // cache,
          // url,
          // method,
          // params,
          // data
        } = resp.config
        delete $api.cancelStack[name]
        // if (cache) {
        //   // 缓存数据 并将当前时间存入 方便之后判断是否过期
        //   const cacheData = {
        //     data: resp.data,
        //     expire: new Date().getTime()
        //   }
        //   const cacheKey = `${url}_${method}_${
        //     params ? JSON.stringify(params) : ''
        //   }_${data || ''}`
        //   cachePool[cacheKey] = cacheData
        // }
        return responseSuccIntercept ? responseSuccIntercept(resp) : resp
        // } else {
        //   // 来自缓存的响应
        //   return resp
        // }
      },
      err =>
        responseErrorIntercept
          ? responseErrorIntercept(err)
          : Promise.reject(err)
    )

    // 发送请求
    const ajax = options => {
      options = Object.assign({}, {
        name: options['name'] || Math.random().toString(),
        getTask: task => {
          $api.cancelStack[options.name] = task
        }
      }, options, { method: (options.method || 'GET').toUpperCase() })

      /* eslint-disable */
      const { custom, ...otherConfig } = options
      options.custom = otherConfig
      return new Promise((resolve, reject) => {
        http
          .middleware(options)
          .then(resp => {
            resolve(resp)
          })
          .catch(err => {
            reject(err)
          })
      })
    }
    // 并发请求
    const batchAjax = requestArray =>
      new Promise((resolve, reject) => {
        Promise.all(requestArray.map(request => request()))
          .then(resp => {
            resolve(resp)
          })
          .catch(err => {
            reject(err)
          })
      })
    const request = options =>
      Array.isArray(options) ? batchAjax(options) : (() => ajax(options))()
    const requestWithAliases = (options, method = {}) => {
      options = Object.assign({}, options, method)
      return ajax(options)
    }
    $api = options => request(options)
    // 注册配置类接口
    const registerMethod = apiConfig => {
      apiConfig.forEach(methodConfig => {
        if (!methodConfig) {
          console.warn(
            `%c 接口注册有误，获取到的接口配置为undefined，请调整！`,
            'font-size:2em'
          )
          return false
        }
        const {
          url,
          data,
          type,
          name,
          method,
          params,
          cache,
          cacheTime: _cacheTime,
          ...rest
        } = methodConfig
        if (!method) {
          console.warn(
            `%c url: ${url}的接口注册未填写method属性，请调整！`,
            'font-size:2em'
          )
          return false
        }
        if ($api[methodConfig.method]) {
          console.error(
            `%c 存在重名的接口方法(method: ${method})，请调整！`,
            'font-size:2em'
          )
          return false
        }
        if (process.env.NODE_ENV === 'development') {
          const signature = `${url}${type}${JSON.stringify(
            data
          )}${JSON.stringify(params)}${cache}`
          const tempSignature = apiSignature.find(
            item => item.signature === signature
          )
          if (tempSignature) {
            console.warn('%c 存在重复的接口，请调整！', 'font-size:2em')
            console.table([
              {
                name,
                method,
                url,
                type,
                data,
                params,
                cache
              },
              {
                name: tempSignature.name,
                method: tempSignature.method,
                url,
                type,
                data,
                params,
                cache
              }
            ])
          }
          apiSignature.push({
            name,
            method,
            signature
          })
        }
        $api[method] = options => {
          options?.type && (options.method = options.type)
          options = Object.assign(
            {},
            {
              cache,
              cacheTime: _cacheTime,
              method: type || 'GET',
              url,
              data,
              params,
              ...rest
            },
            options
          )
          return $api(options)
        }
        // 扩展url路径型参数请求
        $api[method].restful = options => {
          options && options.type && (options.method = options.type)
          options = Object.assign(
            {},
            {
              cache,
              cacheTime: _cacheTime,
              method: type || 'GET',
              url,
              data,
              params,
              ...rest
            },
            options
          )
          let unMatchedParams = options.restfulParams // 路径参数与url参数共存
          Object.entries(options.params || {}).forEach(entry => {
            let val = entry[1]
            let name = entry[0]
            var regex = new RegExp(`{${name}}`, 'g')
            if (regex.test(options.url)) {
              options.url = options.url.replace(regex, `${val}`)
            } else {
              unMatchedParams[name] = val
            }
          })
          options.params = unMatchedParams
          return $api(options)
        }
        // 清除缓存
        $api[method].clearCache = () => {
          const cacheKey = `${url}_${type || 'GET'}`
          Object.keys(cachePool)
            .filter(key => key.indexOf(cacheKey) === 0)
            .forEach(key => delete cachePool[key])
        }
        $api[methodConfig.method].config = methodConfig
      })
      apiSignature = null
    }
    apiConfig && registerMethod(apiConfig)

    $api.cancelStack = {}
    $api.cancel = name => {
      if (name && !$api.cancelStack[name]) {
        return
      }
      if (name) {
        $api.cancelStack[name].abort()
      } else {
        Object.values($api.cancelStack).map(c => c.abort())
      }
    }
    // 初始化缓存时间，默认60s
    // CACHE_TIME = cacheTime || 60000
    // 设置缓存时间(单位ms)
    // $api.setCacheTime = time => CACHE_TIME = time
    // 清空缓存
    $api.clearCache = () => (cachePool = {})
    // 语义化请求
    $api.request = options => request(options)
    $api.get = options => requestWithAliases(options, { method: 'GET' })
    $api.delete = options => requestWithAliases(options, { method: 'DELETE' })
    $api.post = options => requestWithAliases(options, { method: 'POST' })
    $api.put = options => requestWithAliases(options, { method: 'PUT' })
    // $api.postFile = options => requestWithAliases(options, {
    //   method: 'post',
    //   headers: { 'Content-Type': 'multipart/form-data' }
    // })
    $api.all = requestArray => batchAjax(requestArray)

    // 添加全局方法
    Vue.$api = $api
    // 添加实例方法
    Vue.prototype.$api = $api
  }
}
export default api
