// 小程序配置文件
// 请根据实际情况修改以下配置

module.exports = {
  // 小程序基本信息
  appInfo: {
    name: 'JT工时管理系统',
    version: '1.0.0',
    description: '企业工时管理微信小程序',
    author: '开发团队'
  },

  // 微信小程序AppID配置
  // 请将 'wxYourAppId' 替换为您的真实AppID
  appId: 'wxYourAppId',

  // H5系统地址配置
  h5Config: {
    // 生产环境地址
    productionUrl: 'https://timesheet-mobile-optimized-1pfp1a9so-hongmengs-projects.vercel.app',
    // 测试环境地址
    testUrl: 'https://timesheet-mobile-optimized-1pfp1a9so-hongmengs-projects.vercel.app',
    // 开发环境地址
    developmentUrl: 'http://localhost:5173'
  },

  // API接口配置
  apiConfig: {
    // 后端API基础地址
    baseUrl: 'https://your-api-domain.com/api',
    // 超时时间（毫秒）
    timeout: 10000,
    // 重试次数
    retryCount: 3
  },

  // 微信授权配置
  authConfig: {
    // 需要的用户信息权限
    scope: [
      'scope.userInfo',
      'scope.userLocation'
    ],
    // 授权失败后的处理
    failureRedirect: '/pages/index/index'
  },

  // 网络请求域名白名单
  // 需要在微信公众平台配置
  domainWhitelist: {
    request: [
      'https://timesheet-mobile-optimized-1pfp1a9so-hongmengs-projects.vercel.app',
      'https://your-api-domain.com'
    ],
    socket: [],
    uploadFile: [],
    downloadFile: []
  },

  // 性能优化配置
  performance: {
    // 启用懒加载
    lazyLoading: true,
    // 预加载页面数量
    preloadPages: 2,
    // 图片压缩质量
    imageQuality: 80
  },

  // 调试配置
  debug: {
    // 是否启用调试模式
    enabled: false,
    // 日志级别: 'debug', 'info', 'warn', 'error'
    logLevel: 'info',
    // 是否显示性能监控
    showPerformance: false
  }
};