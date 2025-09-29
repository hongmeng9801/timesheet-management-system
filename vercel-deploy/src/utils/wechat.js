/**
 * 微信环境检测和小程序适配工具
 */

/**
 * 检测是否在微信环境中
 * @returns {boolean}
 */
export function isWechat() {
  const ua = navigator.userAgent.toLowerCase()
  return ua.includes('micromessenger')
}

/**
 * 检测是否在微信小程序webview中
 * @returns {boolean}
 */
export function isMiniProgram() {
  const ua = navigator.userAgent.toLowerCase()
  return ua.includes('miniprogram') || window.__wxjs_environment === 'miniprogram'
}

/**
 * 检测是否在移动设备上
 * @returns {boolean}
 */
export function isMobile() {
  const ua = navigator.userAgent.toLowerCase()
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua)
}

/**
 * 检测设备类型
 * @returns {string} 'ios' | 'android' | 'desktop'
 */
export function getDeviceType() {
  const ua = navigator.userAgent.toLowerCase()
  if (/iphone|ipad|ipod/i.test(ua)) {
    return 'ios'
  } else if (/android/i.test(ua)) {
    return 'android'
  } else {
    return 'desktop'
  }
}

/**
 * 获取微信版本号
 * @returns {string}
 */
export function getWechatVersion() {
  const ua = navigator.userAgent.toLowerCase()
  const match = ua.match(/micromessenger\/(\d+\.\d+\.\d+)/)
  return match ? match[1] : ''
}

/**
 * 检测是否支持某个微信JS-SDK功能
 * @param {string} api API名称
 * @returns {boolean}
 */
export function isWechatApiSupported(api) {
  if (!isWechat()) return false
  
  const version = getWechatVersion()
  const versionNum = parseFloat(version)
  
  // 根据不同API的最低版本要求进行判断
  const apiVersionMap = {
    'chooseImage': 6.0,
    'previewImage': 6.0,
    'uploadImage': 6.0,
    'downloadImage': 6.0,
    'getLocalImgData': 6.0,
    'startRecord': 6.0,
    'stopRecord': 6.0,
    'onVoiceRecordEnd': 6.0,
    'playVoice': 6.0,
    'pauseVoice': 6.0,
    'stopVoice': 6.0,
    'onVoicePlayEnd': 6.0,
    'uploadVoice': 6.0,
    'downloadVoice': 6.0,
    'getNetworkType': 6.0,
    'openLocation': 6.0,
    'getLocation': 6.0,
    'hideOptionMenu': 6.0,
    'showOptionMenu': 6.0,
    'hideMenuItems': 6.0,
    'showMenuItems': 6.0,
    'hideAllNonBaseMenuItem': 6.0,
    'showAllNonBaseMenuItem': 6.0,
    'closeWindow': 6.0,
    'scanQRCode': 6.2,
    'chooseWXPay': 6.0,
    'openProductSpecificView': 6.0,
    'addCard': 6.0,
    'chooseCard': 6.0,
    'openCard': 6.0
  }
  
  const requiredVersion = apiVersionMap[api] || 6.0
  return versionNum >= requiredVersion
}

/**
 * 小程序通信工具类
 */
export class MiniProgramBridge {
  constructor() {
    this.isInMiniProgram = isMiniProgram()
    this.messageHandlers = new Map()
    this.init()
  }

  init() {
    if (this.isInMiniProgram) {
      // 监听来自小程序的消息
      window.addEventListener('message', this.handleMessage.bind(this))
      
      // 向小程序发送页面加载完成消息
      this.postMessage({
        type: 'pageLoaded',
        url: window.location.href,
        timestamp: Date.now()
      })
    }
  }

  /**
   * 向小程序发送消息
   * @param {object} data 消息数据
   */
  postMessage(data) {
    if (this.isInMiniProgram && window.wx && window.wx.miniProgram) {
      window.wx.miniProgram.postMessage({ data })
    } else {
      console.log('向小程序发送消息:', data)
    }
  }

  /**
   * 处理来自小程序的消息
   * @param {MessageEvent} event 消息事件
   */
  handleMessage(event) {
    const { type, data } = event.data || {}
    
    if (type && this.messageHandlers.has(type)) {
      const handler = this.messageHandlers.get(type)
      handler(data)
    }
  }

  /**
   * 注册消息处理器
   * @param {string} type 消息类型
   * @param {function} handler 处理函数
   */
  onMessage(type, handler) {
    this.messageHandlers.set(type, handler)
  }

  /**
   * 移除消息处理器
   * @param {string} type 消息类型
   */
  offMessage(type) {
    this.messageHandlers.delete(type)
  }

  /**
   * 获取用户信息
   * @returns {Promise}
   */
  getUserInfo() {
    return new Promise((resolve, reject) => {
      if (this.isInMiniProgram) {
        this.postMessage({ type: 'getUserInfo' })
        
        // 监听用户信息返回
        const handler = (data) => {
          this.offMessage('userInfo')
          resolve(data)
        }
        
        this.onMessage('userInfo', handler)
        
        // 设置超时
        setTimeout(() => {
          this.offMessage('userInfo')
          reject(new Error('获取用户信息超时'))
        }, 5000)
      } else {
        reject(new Error('不在小程序环境中'))
      }
    })
  }

  /**
   * 返回上一页
   */
  navigateBack() {
    if (this.isInMiniProgram) {
      this.postMessage({ type: 'navigateBack' })
    } else {
      window.history.back()
    }
  }

  /**
   * 显示提示消息
   * @param {string} message 提示内容
   * @param {string} icon 图标类型
   * @param {number} duration 显示时长
   */
  showToast(message, icon = 'success', duration = 2000) {
    if (this.isInMiniProgram) {
      this.postMessage({
        type: 'showToast',
        message,
        icon,
        duration
      })
    } else {
      // 在普通浏览器中显示提示
      console.log(`Toast: ${message}`)
      // 可以在这里实现自定义的toast组件
    }
  }

  /**
   * 显示模态对话框
   * @param {string} title 标题
   * @param {string} content 内容
   * @param {boolean} showCancel 是否显示取消按钮
   * @returns {Promise<boolean>}
   */
  showModal(title, content, showCancel = true) {
    return new Promise((resolve) => {
      if (this.isInMiniProgram) {
        this.postMessage({
          type: 'showModal',
          title,
          content,
          showCancel
        })
        
        // 监听模态框结果
        const handler = (data) => {
          this.offMessage('modalResult')
          resolve(data.confirm)
        }
        
        this.onMessage('modalResult', handler)
      } else {
        // 在普通浏览器中使用原生confirm
        const result = showCancel ? confirm(`${title}\n${content}`) : (alert(`${title}\n${content}`), true)
        resolve(result)
      }
    })
  }

  /**
   * 设置页面标题
   * @param {string} title 页面标题
   */
  setNavigationBarTitle(title) {
    if (this.isInMiniProgram) {
      this.postMessage({
        type: 'setNavigationBarTitle',
        title
      })
    } else {
      document.title = title
    }
  }

  /**
   * 分享页面
   * @param {object} shareData 分享数据
   */
  share(shareData) {
    if (this.isInMiniProgram) {
      this.postMessage({
        type: 'share',
        ...shareData
      })
    } else {
      // 在普通浏览器中可以实现其他分享方式
      console.log('分享数据:', shareData)
    }
  }
}

/**
 * 创建全局的小程序桥接实例
 */
export const miniProgramBridge = new MiniProgramBridge()

/**
 * 初始化微信环境适配
 */
export function initWechatAdapter() {
  // 添加环境标识类名
  const body = document.body
  
  if (isWechat()) {
    body.classList.add('wechat-browser')
  }
  
  if (isMiniProgram()) {
    body.classList.add('miniprogram-webview')
  }
  
  if (isMobile()) {
    body.classList.add('mobile-device')
  }
  
  body.classList.add(`device-${getDeviceType()}`)
  
  // 防止页面缩放
  document.addEventListener('touchstart', function(event) {
    if (event.touches.length > 1) {
      event.preventDefault()
    }
  })
  
  let lastTouchEnd = 0
  document.addEventListener('touchend', function(event) {
    const now = Date.now()
    if (now - lastTouchEnd <= 300) {
      event.preventDefault()
    }
    lastTouchEnd = now
  }, false)
  
  // 禁用长按菜单
  document.addEventListener('contextmenu', function(event) {
    if (isMobile()) {
      event.preventDefault()
    }
  })
  
  console.log('微信环境适配初始化完成', {
    isWechat: isWechat(),
    isMiniProgram: isMiniProgram(),
    isMobile: isMobile(),
    deviceType: getDeviceType(),
    wechatVersion: getWechatVersion()
  })
}

/**
 * 默认导出
 */
export default {
  isWechat,
  isMiniProgram,
  isMobile,
  getDeviceType,
  getWechatVersion,
  isWechatApiSupported,
  MiniProgramBridge,
  miniProgramBridge,
  initWechatAdapter
}