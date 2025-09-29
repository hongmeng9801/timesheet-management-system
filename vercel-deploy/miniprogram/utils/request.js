/**
 * 微信小程序网络请求工具
 * 封装wx.request，提供统一的请求接口
 */

const { getApiUrl, validateDomain } = require('./domain-whitelist')

class Request {
  constructor() {
    this.baseURL = ''
    this.timeout = 10000
    this.header = {
      'Content-Type': 'application/json'
    }
    this.interceptors = {
      request: [],
      response: []
    }
    
    // 添加默认拦截器
    this.setupDefaultInterceptors()
  }

  /**
   * 设置默认拦截器
   */
  setupDefaultInterceptors() {
    // 请求拦截器 - 添加token
    this.interceptors.request.push((config) => {
      const token = wx.getStorageSync('token')
      if (token) {
        config.header = {
          ...config.header,
          'Authorization': `Bearer ${token}`
        }
      }
      return config
    })

    // 响应拦截器 - 统一错误处理
    this.interceptors.response.push((response) => {
      const { statusCode, data } = response
      
      if (statusCode === 200) {
        // 业务逻辑错误处理
        if (data.code !== 0 && data.code !== 200) {
          this.handleBusinessError(data)
          return Promise.reject(data)
        }
        return data
      } else {
        // HTTP错误处理
        this.handleHttpError(response)
        return Promise.reject(response)
      }
    })
  }

  /**
   * 处理业务逻辑错误
   */
  handleBusinessError(data) {
    const { code, message } = data
    
    switch (code) {
      case 401:
        // token过期，清除本地存储并跳转登录
        wx.removeStorageSync('token')
        wx.removeStorageSync('userInfo')
        wx.showToast({
          title: '登录已过期，请重新登录',
          icon: 'none'
        })
        // 可以触发重新登录逻辑
        break
      case 403:
        wx.showToast({
          title: '权限不足',
          icon: 'none'
        })
        break
      default:
        wx.showToast({
          title: message || '请求失败',
          icon: 'none'
        })
    }
  }

  /**
   * 处理HTTP错误
   */
  handleHttpError(response) {
    const { statusCode } = response
    let message = '网络错误'
    
    switch (statusCode) {
      case 400:
        message = '请求参数错误'
        break
      case 401:
        message = '未授权访问'
        break
      case 403:
        message = '禁止访问'
        break
      case 404:
        message = '请求地址不存在'
        break
      case 500:
        message = '服务器内部错误'
        break
      case 502:
        message = '网关错误'
        break
      case 503:
        message = '服务不可用'
        break
      case 504:
        message = '网关超时'
        break
      default:
        message = `网络错误 ${statusCode}`
    }
    
    wx.showToast({
      title: message,
      icon: 'none'
    })
  }

  /**
   * 添加请求拦截器
   */
  addRequestInterceptor(interceptor) {
    this.interceptors.request.push(interceptor)
  }

  /**
   * 添加响应拦截器
   */
  addResponseInterceptor(interceptor) {
    this.interceptors.response.push(interceptor)
  }

  /**
   * 执行请求拦截器
   */
  async runRequestInterceptors(config) {
    let result = config
    for (const interceptor of this.interceptors.request) {
      result = await interceptor(result)
    }
    return result
  }

  /**
   * 执行响应拦截器
   */
  async runResponseInterceptors(response) {
    let result = response
    for (const interceptor of this.interceptors.response) {
      result = await interceptor(result)
    }
    return result
  }

  /**
   * 发起请求
   */
  async request(config) {
    // 处理URL
    let url = config.url
    if (!url.startsWith('http')) {
      url = getApiUrl(url)
    }
    
    // 验证域名
    if (!validateDomain(url, 'request')) {
      console.warn('请求域名不在白名单中:', url)
    }

    // 合并配置
    const requestConfig = {
      url,
      method: 'GET',
      data: {},
      header: { ...this.header },
      timeout: this.timeout,
      ...config
    }

    try {
      // 执行请求拦截器
      const finalConfig = await this.runRequestInterceptors(requestConfig)
      
      // 发起请求
      const response = await this.wxRequest(finalConfig)
      
      // 执行响应拦截器
      return await this.runResponseInterceptors(response)
    } catch (error) {
      console.error('请求失败:', error)
      throw error
    }
  }

  /**
   * 封装wx.request为Promise
   */
  wxRequest(config) {
    return new Promise((resolve, reject) => {
      wx.request({
        ...config,
        success: resolve,
        fail: reject
      })
    })
  }

  /**
   * GET请求
   */
  get(url, params = {}, config = {}) {
    return this.request({
      url,
      method: 'GET',
      data: params,
      ...config
    })
  }

  /**
   * POST请求
   */
  post(url, data = {}, config = {}) {
    return this.request({
      url,
      method: 'POST',
      data,
      ...config
    })
  }

  /**
   * PUT请求
   */
  put(url, data = {}, config = {}) {
    return this.request({
      url,
      method: 'PUT',
      data,
      ...config
    })
  }

  /**
   * DELETE请求
   */
  delete(url, config = {}) {
    return this.request({
      url,
      method: 'DELETE',
      ...config
    })
  }

  /**
   * 文件上传
   */
  upload(url, filePath, formData = {}, config = {}) {
    return new Promise((resolve, reject) => {
      // 处理URL
      if (!url.startsWith('http')) {
        url = getApiUrl(url)
      }
      
      // 验证域名
      if (!validateDomain(url, 'uploadFile')) {
        console.warn('上传域名不在白名单中:', url)
      }

      const token = wx.getStorageSync('token')
      const header = {
        ...config.header
      }
      
      if (token) {
        header['Authorization'] = `Bearer ${token}`
      }

      wx.uploadFile({
        url,
        filePath,
        name: config.name || 'file',
        formData,
        header,
        success: (res) => {
          try {
            const data = JSON.parse(res.data)
            if (data.code === 0 || data.code === 200) {
              resolve(data)
            } else {
              this.handleBusinessError(data)
              reject(data)
            }
          } catch (error) {
            reject({ message: '响应数据解析失败', error })
          }
        },
        fail: reject
      })
    })
  }

  /**
   * 文件下载
   */
  download(url, config = {}) {
    return new Promise((resolve, reject) => {
      // 处理URL
      if (!url.startsWith('http')) {
        url = getApiUrl(url)
      }
      
      // 验证域名
      if (!validateDomain(url, 'downloadFile')) {
        console.warn('下载域名不在白名单中:', url)
      }

      const token = wx.getStorageSync('token')
      const header = {
        ...config.header
      }
      
      if (token) {
        header['Authorization'] = `Bearer ${token}`
      }

      wx.downloadFile({
        url,
        header,
        success: resolve,
        fail: reject
      })
    })
  }
}

// 创建默认实例
const request = new Request()

// 导出实例和类
module.exports = {
  request,
  Request
}