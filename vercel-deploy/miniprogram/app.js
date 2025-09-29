// app.js
App({
  globalData: {
    userInfo: null,
    hasUserInfo: false,
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    // H5页面地址 - 需要根据实际部署地址修改
    h5Url: 'https://your-domain.com', // 请替换为实际的H5页面地址
    // 开发环境地址
    devH5Url: 'http://localhost:5173'
  },

  onLaunch(options) {
    console.log('小程序启动', options)
    
    // 检查小程序版本更新
    this.checkForUpdate()
    
    // 获取系统信息
    this.getSystemInfo()
    
    // 设置H5地址（开发/生产环境）
    this.setH5Url()
    
    // 尝试获取用户信息
    this.getUserInfo()
  },

  onShow(options) {
    console.log('小程序显示', options)
  },

  onHide() {
    console.log('小程序隐藏')
  },

  onError(msg) {
    console.error('小程序错误', msg)
  },

  // 检查小程序更新
  checkForUpdate() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      
      updateManager.onCheckForUpdate((res) => {
        console.log('检查更新结果', res.hasUpdate)
      })
      
      updateManager.onUpdateReady(() => {
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          success: (res) => {
            if (res.confirm) {
              updateManager.applyUpdate()
            }
          }
        })
      })
      
      updateManager.onUpdateFailed(() => {
        console.error('新版本下载失败')
      })
    }
  },

  // 获取系统信息
  getSystemInfo() {
    wx.getSystemInfo({
      success: (res) => {
        console.log('系统信息', res)
        this.globalData.systemInfo = res
        
        // 设置状态栏高度等全局样式变量
        this.setGlobalStyle(res)
      },
      fail: (err) => {
        console.error('获取系统信息失败', err)
      }
    })
  },

  // 设置全局样式变量
  setGlobalStyle(systemInfo) {
    // 可以在这里设置一些全局的样式变量
    const { statusBarHeight, windowHeight, windowWidth } = systemInfo
    
    this.globalData.style = {
      statusBarHeight: statusBarHeight + 'px',
      windowHeight: windowHeight + 'px',
      windowWidth: windowWidth + 'px'
    }
  },

  // 设置H5地址
  setH5Url() {
    // 根据环境设置H5地址
    const accountInfo = wx.getAccountInfoSync()
    const envVersion = accountInfo.miniProgram.envVersion
    
    console.log('小程序环境', envVersion)
    
    if (envVersion === 'develop' || envVersion === 'trial') {
      // 开发版或体验版使用本地地址
      this.globalData.h5Url = this.globalData.devH5Url
    } else {
      // 正式版使用生产地址
      // 注意：这里需要替换为实际的生产环境地址
      this.globalData.h5Url = 'https://your-production-domain.com'
    }
    
    console.log('H5地址设置为', this.globalData.h5Url)
  },

  // 获取用户信息
  getUserInfo() {
    if (this.globalData.hasUserInfo) {
      return Promise.resolve(this.globalData.userInfo)
    }
    
    return new Promise((resolve, reject) => {
      // 检查是否已经授权
      wx.getSetting({
        success: (res) => {
          if (res.authSetting['scope.userInfo']) {
            // 已经授权，可以直接调用 getUserInfo 获取头像昵称
            wx.getUserInfo({
              success: (res) => {
                console.log('获取用户信息成功', res.userInfo)
                this.globalData.userInfo = res.userInfo
                this.globalData.hasUserInfo = true
                resolve(res.userInfo)
              },
              fail: (err) => {
                console.error('获取用户信息失败', err)
                reject(err)
              }
            })
          } else {
            console.log('用户未授权获取用户信息')
            resolve(null)
          }
        },
        fail: (err) => {
          console.error('获取设置失败', err)
          reject(err)
        }
      })
    })
  },

  // 使用 getUserProfile 获取用户信息
  getUserProfile() {
    return new Promise((resolve, reject) => {
      if (this.globalData.canIUseGetUserProfile) {
        wx.getUserProfile({
          desc: '用于完善用户资料',
          success: (res) => {
            console.log('getUserProfile成功', res.userInfo)
            this.globalData.userInfo = res.userInfo
            this.globalData.hasUserInfo = true
            resolve(res.userInfo)
          },
          fail: (err) => {
            console.error('getUserProfile失败', err)
            reject(err)
          }
        })
      } else {
        // 不支持 getUserProfile，使用旧版本方法
        this.getUserInfo().then(resolve).catch(reject)
      }
    })
  },

  // 清除用户信息
  clearUserInfo() {
    this.globalData.userInfo = null
    this.globalData.hasUserInfo = false
  },

  // 显示加载提示
  showLoading(title = '加载中...') {
    wx.showLoading({
      title: title,
      mask: true
    })
  },

  // 隐藏加载提示
  hideLoading() {
    wx.hideLoading()
  },

  // 显示成功提示
  showSuccess(title = '操作成功') {
    wx.showToast({
      title: title,
      icon: 'success',
      duration: 2000
    })
  },

  // 显示错误提示
  showError(title = '操作失败') {
    wx.showToast({
      title: title,
      icon: 'error',
      duration: 2000
    })
  },

  // 显示普通提示
  showToast(title, icon = 'none') {
    wx.showToast({
      title: title,
      icon: icon,
      duration: 2000
    })
  }
})