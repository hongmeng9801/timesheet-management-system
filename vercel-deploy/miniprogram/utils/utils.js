/**
 * 小程序工具类
 */

/**
 * 格式化时间
 * @param {Date} date 日期对象
 * @param {string} format 格式字符串，如 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的时间字符串
 */
function formatTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return ''
  
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  
  const formatNumber = (n) => {
    n = n.toString()
    return n[1] ? n : '0' + n
  }
  
  return format
    .replace('YYYY', year)
    .replace('MM', formatNumber(month))
    .replace('DD', formatNumber(day))
    .replace('HH', formatNumber(hour))
    .replace('mm', formatNumber(minute))
    .replace('ss', formatNumber(second))
}

/**
 * 获取当前时间戳
 * @returns {number} 时间戳
 */
function getTimestamp() {
  return Date.now()
}

/**
 * 获取今天的日期字符串
 * @returns {string} YYYY-MM-DD 格式的日期
 */
function getToday() {
  return formatTime(new Date(), 'YYYY-MM-DD')
}

/**
 * 获取本周的开始和结束日期
 * @returns {object} {start: 'YYYY-MM-DD', end: 'YYYY-MM-DD'}
 */
function getThisWeek() {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const startDate = new Date(now.getTime() - (dayOfWeek - 1) * 24 * 60 * 60 * 1000)
  const endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000)
  
  return {
    start: formatTime(startDate, 'YYYY-MM-DD'),
    end: formatTime(endDate, 'YYYY-MM-DD')
  }
}

/**
 * 获取本月的开始和结束日期
 * @returns {object} {start: 'YYYY-MM-DD', end: 'YYYY-MM-DD'}
 */
function getThisMonth() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  
  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 0)
  
  return {
    start: formatTime(startDate, 'YYYY-MM-DD'),
    end: formatTime(endDate, 'YYYY-MM-DD')
  }
}

/**
 * 防抖函数
 * @param {Function} func 要防抖的函数
 * @param {number} wait 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * 节流函数
 * @param {Function} func 要节流的函数
 * @param {number} limit 时间间隔（毫秒）
 * @returns {Function} 节流后的函数
 */
function throttle(func, limit) {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * 深拷贝对象
 * @param {any} obj 要拷贝的对象
 * @returns {any} 拷贝后的对象
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime())
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item))
  }
  
  if (typeof obj === 'object') {
    const clonedObj = {}
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

/**
 * 检查是否为空值
 * @param {any} value 要检查的值
 * @returns {boolean} 是否为空
 */
function isEmpty(value) {
  if (value === null || value === undefined) {
    return true
  }
  
  if (typeof value === 'string') {
    return value.trim() === ''
  }
  
  if (Array.isArray(value)) {
    return value.length === 0
  }
  
  if (typeof value === 'object') {
    return Object.keys(value).length === 0
  }
  
  return false
}

/**
 * 生成随机字符串
 * @param {number} length 字符串长度
 * @returns {string} 随机字符串
 */
function generateRandomString(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 验证手机号
 * @param {string} phone 手机号
 * @returns {boolean} 是否有效
 */
function validatePhone(phone) {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

/**
 * 验证邮箱
 * @param {string} email 邮箱
 * @returns {boolean} 是否有效
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 验证身份证号
 * @param {string} idCard 身份证号
 * @returns {boolean} 是否有效
 */
function validateIdCard(idCard) {
  const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  return idCardRegex.test(idCard)
}

/**
 * 格式化文件大小
 * @param {number} bytes 字节数
 * @returns {string} 格式化后的文件大小
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 获取URL参数
 * @param {string} url URL字符串
 * @returns {object} 参数对象
 */
function getUrlParams(url) {
  const params = {}
  const urlObj = new URL(url)
  
  for (let [key, value] of urlObj.searchParams) {
    params[key] = value
  }
  
  return params
}

/**
 * 构建URL参数字符串
 * @param {object} params 参数对象
 * @returns {string} 参数字符串
 */
function buildUrlParams(params) {
  const urlParams = new URLSearchParams()
  
  for (let key in params) {
    if (params.hasOwnProperty(key) && params[key] !== null && params[key] !== undefined) {
      urlParams.append(key, params[key])
    }
  }
  
  return urlParams.toString()
}

/**
 * 存储数据到本地
 * @param {string} key 键名
 * @param {any} data 数据
 * @returns {Promise} Promise对象
 */
function setStorage(key, data) {
  return new Promise((resolve, reject) => {
    wx.setStorage({
      key: key,
      data: data,
      success: resolve,
      fail: reject
    })
  })
}

/**
 * 从本地获取数据
 * @param {string} key 键名
 * @returns {Promise} Promise对象
 */
function getStorage(key) {
  return new Promise((resolve, reject) => {
    wx.getStorage({
      key: key,
      success: (res) => resolve(res.data),
      fail: reject
    })
  })
}

/**
 * 删除本地数据
 * @param {string} key 键名
 * @returns {Promise} Promise对象
 */
function removeStorage(key) {
  return new Promise((resolve, reject) => {
    wx.removeStorage({
      key: key,
      success: resolve,
      fail: reject
    })
  })
}

/**
 * 清空本地数据
 * @returns {Promise} Promise对象
 */
function clearStorage() {
  return new Promise((resolve, reject) => {
    wx.clearStorage({
      success: resolve,
      fail: reject
    })
  })
}

/**
 * 显示模态对话框
 * @param {string} title 标题
 * @param {string} content 内容
 * @param {boolean} showCancel 是否显示取消按钮
 * @returns {Promise} Promise对象
 */
function showModal(title, content, showCancel = true) {
  return new Promise((resolve) => {
    wx.showModal({
      title: title,
      content: content,
      showCancel: showCancel,
      success: (res) => {
        resolve(res.confirm)
      },
      fail: () => {
        resolve(false)
      }
    })
  })
}

/**
 * 显示操作菜单
 * @param {Array} itemList 菜单项列表
 * @returns {Promise} Promise对象
 */
function showActionSheet(itemList) {
  return new Promise((resolve, reject) => {
    wx.showActionSheet({
      itemList: itemList,
      success: (res) => resolve(res.tapIndex),
      fail: reject
    })
  })
}

/**
 * 复制文本到剪贴板
 * @param {string} text 要复制的文本
 * @returns {Promise} Promise对象
 */
function copyToClipboard(text) {
  return new Promise((resolve, reject) => {
    wx.setClipboardData({
      data: text,
      success: resolve,
      fail: reject
    })
  })
}

/**
 * 获取剪贴板内容
 * @returns {Promise} Promise对象
 */
function getClipboardData() {
  return new Promise((resolve, reject) => {
    wx.getClipboardData({
      success: (res) => resolve(res.data),
      fail: reject
    })
  })
}

/**
 * 检查网络状态
 * @returns {Promise} Promise对象
 */
function getNetworkType() {
  return new Promise((resolve, reject) => {
    wx.getNetworkType({
      success: (res) => resolve(res.networkType),
      fail: reject
    })
  })
}

/**
 * 检查是否有网络连接
 * @returns {Promise<boolean>} Promise对象
 */
function isNetworkConnected() {
  return getNetworkType().then(networkType => {
    return networkType !== 'none'
  }).catch(() => false)
}

module.exports = {
  formatTime,
  getTimestamp,
  getToday,
  getThisWeek,
  getThisMonth,
  debounce,
  throttle,
  deepClone,
  isEmpty,
  generateRandomString,
  validatePhone,
  validateEmail,
  validateIdCard,
  formatFileSize,
  getUrlParams,
  buildUrlParams,
  setStorage,
  getStorage,
  removeStorage,
  clearStorage,
  showModal,
  showActionSheet,
  copyToClipboard,
  getClipboardData,
  getNetworkType,
  isNetworkConnected
}