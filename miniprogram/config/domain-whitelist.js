/**
 * 微信小程序域名白名单配置
 * 需要在微信公众平台后台配置这些域名
 */

const DOMAIN_CONFIG = {
  // 生产环境域名
  production: {
    // H5系统域名
    h5Domain: 'https://your-domain.com',
    // API接口域名
    apiDomain: 'https://api.your-domain.com',
    // 文件上传域名
    uploadDomain: 'https://upload.your-domain.com',
    // WebSocket域名
    socketDomain: 'wss://ws.your-domain.com'
  },
  
  // 测试环境域名
  staging: {
    h5Domain: 'https://test.your-domain.com',
    apiDomain: 'https://api-test.your-domain.com',
    uploadDomain: 'https://upload-test.your-domain.com',
    socketDomain: 'wss://ws-test.your-domain.com'
  },
  
  // 开发环境域名（本地开发）
  development: {
    h5Domain: 'http://localhost:5173',
    apiDomain: 'http://localhost:3000',
    uploadDomain: 'http://localhost:3000',
    socketDomain: 'ws://localhost:3001'
  }
}

// 需要在微信公众平台配置的域名列表
const WHITELIST_DOMAINS = {
  // request合法域名
  request: [
    'https://your-domain.com',
    'https://api.your-domain.com',
    'https://test.your-domain.com',
    'https://api-test.your-domain.com',
    // 第三方服务域名
    'https://api.weixin.qq.com',
    'https://res.wx.qq.com'
  ],
  
  // socket合法域名
  socket: [
    'wss://ws.your-domain.com',
    'wss://ws-test.your-domain.com'
  ],
  
  // uploadFile合法域名
  uploadFile: [
    'https://upload.your-domain.com',
    'https://upload-test.your-domain.com'
  ],
  
  // downloadFile合法域名
  downloadFile: [
    'https://your-domain.com',
    'https://test.your-domain.com',
    'https://upload.your-domain.com',
    'https://upload-test.your-domain.com'
  ],
  
  // 业务域名（web-view）
  webview: [
    'https://your-domain.com',
    'https://test.your-domain.com'
  ]
}

// 获取当前环境配置
function getCurrentDomainConfig() {
  // 可以根据小程序版本或其他条件判断环境
  const accountInfo = wx.getAccountInfoSync()
  const envVersion = accountInfo.miniProgram.envVersion
  
  switch (envVersion) {
    case 'develop':
      return DOMAIN_CONFIG.development
    case 'trial':
      return DOMAIN_CONFIG.staging
    case 'release':
      return DOMAIN_CONFIG.production
    default:
      return DOMAIN_CONFIG.development
  }
}

// 验证域名是否在白名单中
function validateDomain(url, type = 'request') {
  const domains = WHITELIST_DOMAINS[type] || []
  return domains.some(domain => url.startsWith(domain))
}

// 获取完整的API地址
function getApiUrl(path) {
  const config = getCurrentDomainConfig()
  return `${config.apiDomain}${path}`
}

// 获取完整的H5地址
function getH5Url(path = '') {
  const config = getCurrentDomainConfig()
  return `${config.h5Domain}${path}`
}

// 获取上传地址
function getUploadUrl(path = '/upload') {
  const config = getCurrentDomainConfig()
  return `${config.uploadDomain}${path}`
}

// 获取WebSocket地址
function getSocketUrl(path = '') {
  const config = getCurrentDomainConfig()
  return `${config.socketDomain}${path}`
}

module.exports = {
  DOMAIN_CONFIG,
  WHITELIST_DOMAINS,
  getCurrentDomainConfig,
  validateDomain,
  getApiUrl,
  getH5Url,
  getUploadUrl,
  getSocketUrl
}