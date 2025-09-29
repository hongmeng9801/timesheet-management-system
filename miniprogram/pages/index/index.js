// index.js
const app = getApp()

Page({
  data: {
    userInfo: null,
    hasUserInfo: false,
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    canIUseNicknameComp: wx.canIUse('input.type.nickname')
  },

  onLoad() {
    // 检查是否已有用户信息
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUseGetUserProfile) {
      // 可以使用 wx.getUserProfile 获取头像昵称
      this.setData({
        canIUseGetUserProfile: true
      })
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },

  onShow() {
    console.log('首页显示')
  },

  // 获取用户信息
  getUserInfo() {
    if (this.data.canIUseGetUserProfile) {
      // 推荐使用wx.getUserProfile获取用户信息
      wx.getUserProfile({
        desc: '用于完善会员资料',
        success: (res) => {
          console.log('获取用户信息成功', res)
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
          
          // 显示成功提示
          wx.showToast({
            title: '获取信息成功',
            icon: 'success',
            duration: 2000
          })
        },
        fail: (err) => {
          console.log('获取用户信息失败', err)
          wx.showToast({
            title: '获取信息失败',
            icon: 'error',
            duration: 2000
          })
        }
      })
    } else {
      // 兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },

  // 跳转到工时管理页面
  goToTimesheet() {
    wx.navigateTo({
      url: '/pages/webview/webview'
    })
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: 'JT工时管理系统',
      desc: '专业的企业工时记录和管理平台',
      path: '/pages/index/index'
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: 'JT工时管理系统 - 专业的企业工时记录和管理平台'
    }
  }
})