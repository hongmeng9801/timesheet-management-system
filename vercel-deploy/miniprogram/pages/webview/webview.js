// webview.js
const app = getApp()

Page({
  data: {
    webviewUrl: '',
    loading: true,
    error: false,
    errorMessage: ''
  },

  onLoad(options) {
    console.log('WebView页面加载', options)
    
    // 获取H5页面地址
    const h5Url = app.globalData.h5Url
    
    // 构建完整的URL，可以传递参数
    let webviewUrl = h5Url
    
    // 如果有传递参数，添加到URL中
    if (options.params) {
      try {
        const params = JSON.parse(decodeURIComponent(options.params))
        const urlParams = new URLSearchParams(params)
        webviewUrl += (h5Url.includes('?') ? '&' : '?') + urlParams.toString()
      } catch (e) {
        console.error('解析参数失败', e)
      }
    }
    
    // 添加小程序标识
    webviewUrl += (webviewUrl.includes('?') ? '&' : '?') + 'from=miniprogram'
    
    console.log('WebView URL:', webviewUrl)
    
    this.setData({
      webviewUrl: webviewUrl
    })
    
    // 设置加载超时
    this.loadTimeout = setTimeout(() => {
      if (this.data.loading) {
        this.setData({
          loading: false,
          error: true,
          errorMessage: '加载超时，请检查网络连接后重试'
        })
      }
    }, 15000) // 15秒超时
  },

  onShow() {
    console.log('WebView页面显示')
  },

  onHide() {
    console.log('WebView页面隐藏')
  },

  onUnload() {
    // 清除超时定时器
    if (this.loadTimeout) {
      clearTimeout(this.loadTimeout)
    }
  },

  // WebView加载完成
  onWebViewLoad() {
    console.log('WebView加载完成')
    
    // 清除超时定时器
    if (this.loadTimeout) {
      clearTimeout(this.loadTimeout)
    }
    
    this.setData({
      loading: false,
      error: false
    })
    
    // 向H5页面发送用户信息
    this.sendUserInfoToH5()
  },

  // WebView加载错误
  onError(e) {
    console.error('WebView加载错误', e)
    
    // 清除超时定时器
    if (this.loadTimeout) {
      clearTimeout(this.loadTimeout)
    }
    
    this.setData({
      loading: false,
      error: true,
      errorMessage: '页面加载失败，请检查网络连接或稍后重试'
    })
  },

  // 接收H5页面消息
  onMessage(e) {
    console.log('收到H5页面消息', e.detail.data)
    
    const data = e.detail.data[0] // 微信小程序的消息格式
    
    if (data) {
      switch (data.type) {
        case 'getUserInfo':
          // H5请求获取用户信息
          this.sendUserInfoToH5()
          break
        case 'navigateBack':
          // H5请求返回
          this.goBack()
          break
        case 'showToast':
          // H5请求显示提示
          wx.showToast({
            title: data.message || '操作成功',
            icon: data.icon || 'success',
            duration: data.duration || 2000
          })
          break
        case 'showModal':
          // H5请求显示弹窗
          wx.showModal({
            title: data.title || '提示',
            content: data.content || '',
            showCancel: data.showCancel !== false,
            success: (res) => {
              // 将结果发送回H5
              this.postMessageToH5({
                type: 'modalResult',
                confirm: res.confirm,
                cancel: res.cancel
              })
            }
          })
          break
        case 'getLocation':
          // H5请求获取位置
          this.getLocation().then(location => {
            this.postMessageToH5({
              type: 'locationResult',
              data: location
            })
          }).catch(error => {
            this.postMessageToH5({
              type: 'locationError',
              error: error.errMsg || '获取位置失败'
            })
          })
          break
        case 'chooseImage':
          // H5请求选择图片
          wx.chooseImage({
            count: data.count || 1,
            sizeType: data.sizeType || ['original', 'compressed'],
            sourceType: data.sourceType || ['album', 'camera'],
            success: (res) => {
              this.postMessageToH5({
                type: 'imageResult',
                data: res.tempFilePaths
              })
            },
            fail: (error) => {
              this.postMessageToH5({
                type: 'imageError',
                error: error.errMsg || '选择图片失败'
              })
            }
          })
          break
        case 'scanCode':
          // H5请求扫码
          wx.scanCode({
            success: (res) => {
              this.postMessageToH5({
                type: 'scanResult',
                data: {
                  result: res.result,
                  scanType: res.scanType,
                  charSet: res.charSet
                }
              })
            },
            fail: (error) => {
              this.postMessageToH5({
                type: 'scanError',
                error: error.errMsg || '扫码失败'
              })
            }
          })
          break
        default:
          console.log('未知消息类型', data.type)
      }
    }
  },

  // 向H5页面发送用户信息
  sendUserInfoToH5() {
    const userInfo = app.globalData.userInfo
    if (userInfo) {
      this.postMessageToH5({
        type: 'userInfo',
        data: userInfo
      })
    }
  },

  // 向H5页面发送消息
  postMessageToH5(data) {
    try {
      // 通过本地存储传递数据给H5
      wx.setStorageSync('miniprogram_message', JSON.stringify(data))
      
      // 触发H5页面检查消息的事件
      const webview = this.selectComponent('.webview')
      if (webview) {
        // 通过URL参数传递消息标识
        const currentUrl = this.data.webviewUrl
        const separator = currentUrl.includes('?') ? '&' : '?'
        const messageId = Date.now()
        const newUrl = currentUrl + separator + 'messageId=' + messageId
        
        this.setData({
          webviewUrl: newUrl
        })
      }
      
      console.log('向H5发送消息成功', data)
    } catch (error) {
      console.error('向H5发送消息失败', error)
    }
  },

  // 获取用户信息
  getUserInfo() {
    return new Promise((resolve, reject) => {
      // 检查是否已有用户信息
      if (app.globalData.userInfo) {
        resolve(app.globalData.userInfo)
        return
      }
      
      // 获取用户信息
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          console.log('获取用户信息成功', res)
          app.globalData.userInfo = res.userInfo
          resolve(res.userInfo)
        },
        fail: (error) => {
          console.error('获取用户信息失败', error)
          reject(error)
        }
      })
    })
  },

  // 获取位置信息
  getLocation() {
    return new Promise((resolve, reject) => {
      wx.getLocation({
        type: 'gcj02',
        success: (res) => {
          console.log('获取位置成功', res)
          resolve({
            latitude: res.latitude,
            longitude: res.longitude,
            accuracy: res.accuracy
          })
        },
        fail: (error) => {
          console.error('获取位置失败', error)
          reject(error)
        }
      })
    })
  },

  // 重新加载
  reload() {
    console.log('重新加载WebView')
    
    this.setData({
      loading: true,
      error: false,
      errorMessage: ''
    })
    
    // 重新设置URL触发重新加载
    const currentUrl = this.data.webviewUrl
    const separator = currentUrl.includes('?') ? '&' : '?'
    const newUrl = currentUrl + separator + 'reload=' + Date.now()
    
    this.setData({
      webviewUrl: newUrl
    })
    
    // 重新设置超时
    this.loadTimeout = setTimeout(() => {
      if (this.data.loading) {
        this.setData({
          loading: false,
          error: true,
          errorMessage: '加载超时，请检查网络连接后重试'
        })
      }
    }, 15000)
  },

  // 返回首页
  goBack() {
    wx.navigateBack({
      delta: 1,
      fail: () => {
        // 如果无法返回，则跳转到首页
        wx.reLaunch({
          url: '/pages/index/index'
        })
      }
    })
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: 'JT工时管理系统',
      desc: '专业的企业工时记录和管理平台',
      path: '/pages/webview/webview'
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: 'JT工时管理系统 - 专业的企业工时记录和管理平台'
    }
  }
})