import Vue from 'vue'
import $api from './uni-x-luch'

const apiHelper = {
  /**
   * 业务辅助方法，方便请求线上文件进行接口注册
   * @param  {[type]} options.config      json配置对象或者线上文件完整url地址
   * @return {[Object]}                  [系统配置对象]
   */
  register({
    systemConfig,
    requestIntercept,
    responseSuccIntercept,
    responseErrorIntercept
  } = {}) {
    if (!systemConfig) {
      console.error('请传入接口配置信息！')
      return
    }
    let { api, globalOption } = systemConfig
    let $apiConfig = {
      globalOption,
      // 接口配置
      apiConfig: api,
      // 请求拦截器
      requestIntercept: req => (requestIntercept ? requestIntercept(req) : req),
      // 响应成功拦截器
      responseSuccIntercept: resp =>
        responseSuccIntercept ? responseSuccIntercept(resp) : resp,
      // 响应异常拦截器
      responseErrorIntercept: err =>
        responseErrorIntercept
          ? responseErrorIntercept(err)
          : Promise.reject(err)
    }
    Vue.use($api, $apiConfig)
  }
}
export default apiHelper
