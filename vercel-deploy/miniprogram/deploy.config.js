/**
 * 微信小程序部署配置文件
 * 用于配置不同环境下的域名和API地址
 */

const config = {
  // 开发环境配置
  development: {
    // H5页面地址
    h5Url: 'http://localhost:5173',
    // API接口地址
    apiUrl: 'http://localhost:3000/api',
    // 文件上传地址
    uploadUrl: 'http://localhost:3000/upload',
    // WebSocket地址
    wsUrl: 'ws://localhost:3000/ws',
    // 环境标识
    env: 'development'
  },
  
  // 测试环境配置
  testing: {
    h5Url: 'https://test-timesheet.yourdomain.com',
    apiUrl: 'https://test-api.yourdomain.com/api',
    uploadUrl: 'https://test-api.yourdomain.com/upload',
    wsUrl: 'wss://test-api.yourdomain.com/ws',
    env: 'testing'
  },
  
  // 生产环境配置
  production: {
    h5Url: 'https://timesheet.yourdomain.com',
    apiUrl: 'https://api.yourdomain.com/api',
    uploadUrl: 'https://api.yourdomain.com/upload',
    wsUrl: 'wss://api.yourdomain.com/ws',
    env: 'production'
  }
}

/**
 * 获取当前环境配置
 * @param {string} env 环境名称 development|testing|production
 * @returns {object} 环境配置对象
 */
function getConfig(env = 'development') {
  return config[env] || config.development
}

/**
 * 微信小程序域名白名单配置
 * 需要在微信公众平台后台配置以下域名
 */
const domainWhitelist = {
  // request合法域名（API请求）
  request: [
    'https://api.yourdomain.com',
    'https://test-api.yourdomain.com'
  ],
  
  // socket合法域名（WebSocket连接）
  socket: [
    'wss://api.yourdomain.com',
    'wss://test-api.yourdomain.com'
  ],
  
  // uploadFile合法域名（文件上传）
  uploadFile: [
    'https://api.yourdomain.com',
    'https://test-api.yourdomain.com'
  ],
  
  // downloadFile合法域名（文件下载）
  downloadFile: [
    'https://api.yourdomain.com',
    'https://test-api.yourdomain.com',
    'https://cdn.yourdomain.com'
  ],
  
  // 业务域名（webview页面）
  webview: [
    'https://timesheet.yourdomain.com',
    'https://test-timesheet.yourdomain.com'
  ]
}

/**
 * 小程序版本管理配置
 */
const versionConfig = {
  // 当前版本号
  version: '1.0.0',
  
  // 版本描述
  description: '工时管理小程序首个版本',
  
  // 最低基础库版本
  minSdkVersion: '2.10.0',
  
  // 支持的微信版本
  minWechatVersion: '7.0.0',
  
  // 更新策略
  updateStrategy: {
    // 是否强制更新
    forceUpdate: false,
    // 更新提示文案
    updateTip: '发现新版本，是否立即更新？',
    // 强制更新文案
    forceUpdateTip: '发现新版本，需要更新后才能使用'
  }
}

/**
 * 小程序性能配置
 */
const performanceConfig = {
  // 预加载配置
  preload: {
    // 预加载页面
    pages: ['pages/webview/webview'],
    // 预加载数据
    data: ['userInfo', 'systemInfo']
  },
  
  // 缓存配置
  cache: {
    // 用户信息缓存时间（毫秒）
    userInfoExpire: 24 * 60 * 60 * 1000, // 24小时
    // 系统信息缓存时间
    systemInfoExpire: 7 * 24 * 60 * 60 * 1000, // 7天
    // 最大缓存大小（KB）
    maxCacheSize: 10 * 1024 // 10MB
  },
  
  // 网络配置
  network: {
    // 请求超时时间（毫秒）
    timeout: 10000,
    // 重试次数
    retryCount: 3,
    // 重试间隔（毫秒）
    retryInterval: 1000
  }
}

/**
 * 小程序安全配置
 */
const securityConfig = {
  // 数据加密
  encryption: {
    // 是否启用数据加密
    enabled: true,
    // 加密算法
    algorithm: 'AES-256-GCM',
    // 密钥管理
    keyManagement: 'server'
  },
  
  // 用户隐私保护
  privacy: {
    // 用户协议版本
    userAgreementVersion: '1.0',
    // 隐私政策版本
    privacyPolicyVersion: '1.0',
    // 数据收集说明
    dataCollection: {
      userInfo: '用于个性化服务和身份验证',
      location: '用于考勤打卡定位',
      device: '用于设备兼容性和安全验证'
    }
  }
}

module.exports = {
  getConfig,
  domainWhitelist,
  versionConfig,
  performanceConfig,
  securityConfig
}