/**
 * H5与小程序通信桥接工具
 * 提供标准化的双向通信接口
 */

class MiniprogramBridge {
  constructor() {
    this.messageHandlers = new Map()
    this.init()
  }

  init() {
    // 监听来自H5的消息
    this.setupMessageListener()
    
    // 定期检查本地存储中的消息
    this.startMessagePolling()
  }

  /**
   * 设置消息监听器
   */
  setupMessageListener() {
    // 这里可以添加其他消息监听逻辑
    console.log('消息监听器已设置')
  }

  /**
   * 开始轮询检查消息
   */
  startMessagePolling() {
    setInterval(() => {
      this.checkPendingMessages()
    }, 1000) // 每秒检查一次
  }

  /**
   * 检查待处理的消息
   */
  checkPendingMessages() {
    try {
      const messageData = wx.getStorageSync('h5_to_miniprogram_message')
      if (messageData) {
        const message = JSON.parse(messageData)
        this.handleMessage(message)
        // 清除已处理的消息
        wx.removeStorageSync('h5_to_miniprogram_message')
      }
    } catch (error) {
      console.error('检查消息失败', error)
    }
  }

  /**
   * 处理收到的消息
   * @param {Object} message 消息对象
   */
  handleMessage(message) {
    const { type, data } = message
    const handler = this.messageHandlers.get(type)
    
    if (handler) {
      handler(data)
    } else {
      console.warn('未找到消息处理器', type)
    }
  }

  /**
   * 注册消息处理器
   * @param {string} type 消息类型
   * @param {Function} handler 处理函数
   */
  on(type, handler) {
    this.messageHandlers.set(type, handler)
  }

  /**
   * 移除消息处理器
   * @param {string} type 消息类型
   */
  off(type) {
    this.messageHandlers.delete(type)
  }

  /**
   * 向H5发送消息
   * @param {Object} message 消息对象
   */
  postMessage(message) {
    try {
      wx.setStorageSync('miniprogram_to_h5_message', JSON.stringify(message))
      console.log('向H5发送消息', message)
    } catch (error) {
      console.error('发送消息失败', error)
    }
  }

  /**
   * 发送用户信息到H5
   * @param {Object} userInfo 用户信息
   */
  sendUserInfo(userInfo) {
    this.postMessage({
      type: 'userInfo',
      data: userInfo,
      timestamp: Date.now()
    })
  }

  /**
   * 发送位置信息到H5
   * @param {Object} location 位置信息
   */
  sendLocation(location) {
    this.postMessage({
      type: 'location',
      data: location,
      timestamp: Date.now()
    })
  }

  /**
   * 发送设备信息到H5
   */
  sendDeviceInfo() {
    const systemInfo = wx.getSystemInfoSync()
    this.postMessage({
      type: 'deviceInfo',
      data: {
        platform: systemInfo.platform,
        system: systemInfo.system,
        version: systemInfo.version,
        model: systemInfo.model,
        brand: systemInfo.brand,
        screenWidth: systemInfo.screenWidth,
        screenHeight: systemInfo.screenHeight,
        windowWidth: systemInfo.windowWidth,
        windowHeight: systemInfo.windowHeight,
        pixelRatio: systemInfo.pixelRatio,
        statusBarHeight: systemInfo.statusBarHeight,
        safeArea: systemInfo.safeArea
      },
      timestamp: Date.now()
    })
  }

  /**
   * 发送网络状态到H5
   */
  sendNetworkInfo() {
    wx.getNetworkType({
      success: (res) => {
        this.postMessage({
          type: 'networkInfo',
          data: {
            networkType: res.networkType,
            isConnected: res.networkType !== 'none'
          },
          timestamp: Date.now()
        })
      }
    })
  }

  /**
   * 显示提示消息
   * @param {string} title 提示标题
   * @param {string} icon 图标类型
   * @param {number} duration 显示时长
   */
  showToast(title, icon = 'success', duration = 2000) {
    wx.showToast({
      title,
      icon,
      duration
    })
  }

  /**
   * 显示模态对话框
   * @param {string} title 标题
   * @param {string} content 内容
   * @param {boolean} showCancel 是否显示取消按钮
   * @returns {Promise} 返回用户选择结果
   */
  showModal(title, content, showCancel = true) {
    return new Promise((resolve) => {
      wx.showModal({
        title,
        content,
        showCancel,
        success: (res) => {
          resolve({
            confirm: res.confirm,
            cancel: res.cancel
          })
        }
      })
    })
  }

  /**
   * 获取用户信息
   * @returns {Promise} 返回用户信息
   */
  getUserInfo() {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          resolve(res.userInfo)
        },
        fail: reject
      })
    })
  }

  /**
   * 获取位置信息
   * @returns {Promise} 返回位置信息
   */
  getLocation() {
    return new Promise((resolve, reject) => {
      wx.getLocation({
        type: 'gcj02',
        success: (res) => {
          resolve({
            latitude: res.latitude,
            longitude: res.longitude,
            accuracy: res.accuracy
          })
        },
        fail: reject
      })
    })
  }

  /**
   * 选择图片
   * @param {Object} options 选择选项
   * @returns {Promise} 返回选择的图片路径
   */
  chooseImage(options = {}) {
    return new Promise((resolve, reject) => {
      wx.chooseImage({
        count: options.count || 1,
        sizeType: options.sizeType || ['original', 'compressed'],
        sourceType: options.sourceType || ['album', 'camera'],
        success: (res) => {
          resolve(res.tempFilePaths)
        },
        fail: reject
      })
    })
  }

  /**
   * 扫码
   * @returns {Promise} 返回扫码结果
   */
  scanCode() {
    return new Promise((resolve, reject) => {
      wx.scanCode({
        success: (res) => {
          resolve({
            result: res.result,
            scanType: res.scanType,
            charSet: res.charSet
          })
        },
        fail: reject
      })
    })
  }

  /**
   * 导航返回
   * @param {number} delta 返回层数
   */
  navigateBack(delta = 1) {
    wx.navigateBack({ delta })
  }

  /**
   * 设置导航栏标题
   * @param {string} title 标题
   */
  setNavigationBarTitle(title) {
    wx.setNavigationBarTitle({ title })
  }

  /**
   * 设置导航栏颜色
   * @param {string} frontColor 前景颜色
   * @param {string} backgroundColor 背景颜色
   */
  setNavigationBarColor(frontColor, backgroundColor) {
    wx.setNavigationBarColor({
      frontColor,
      backgroundColor
    })
  }
}

// 创建全局实例
const bridge = new MiniprogramBridge()

module.exports = bridge