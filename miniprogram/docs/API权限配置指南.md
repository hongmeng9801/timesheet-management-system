# 微信小程序API权限配置指南

## 概述

本文档详细说明了工时管理小程序所需的各种API权限配置，包括微信公众平台后台配置和代码中的权限声明。

## 1. 微信公众平台后台配置

### 1.1 服务器域名配置

登录微信公众平台 → 开发 → 开发管理 → 开发设置 → 服务器域名

#### request合法域名
```
https://your-domain.com
https://api.your-domain.com
https://test.your-domain.com
https://api-test.your-domain.com
https://api.weixin.qq.com
https://res.wx.qq.com
```

#### socket合法域名
```
wss://ws.your-domain.com
wss://ws-test.your-domain.com
```

#### uploadFile合法域名
```
https://upload.your-domain.com
https://upload-test.your-domain.com
```

#### downloadFile合法域名
```
https://your-domain.com
https://test.your-domain.com
https://upload.your-domain.com
https://upload-test.your-domain.com
```

#### 业务域名（web-view）
```
https://your-domain.com
https://test.your-domain.com
```

### 1.2 接口权限配置

登录微信公众平台 → 开发 → 接口权限

需要开通的接口权限：
- [x] 获取用户基本信息
- [x] 获取用户手机号
- [x] 微信登录
- [x] 获取用户地理位置
- [x] 选择图片/拍照
- [x] 扫一扫
- [x] 文件上传下载
- [x] 网络请求
- [x] 本地存储
- [x] 设备信息
- [x] 网络状态
- [x] 系统信息

## 2. 小程序代码权限声明

### 2.1 app.json权限配置

```json
{
  "permission": {
    "scope.userLocation": {
      "desc": "你的位置信息将用于工时打卡定位"
    },
    "scope.userInfo": {
      "desc": "你的用户信息将用于完善个人资料"
    },
    "scope.camera": {
      "desc": "你的摄像头将用于拍照上传工作照片"
    },
    "scope.album": {
      "desc": "你的相册将用于选择工作相关图片"
    }
  },
  "requiredPrivateInfos": [
    "getLocation",
    "chooseLocation",
    "chooseImage",
    "chooseMedia",
    "scanCode",
    "getUserProfile"
  ]
}
```

### 2.2 隐私协议配置

在 `app.json` 中添加隐私协议配置：

```json
{
  "privacyAgreementUrl": "https://your-domain.com/privacy",
  "userAgreementUrl": "https://your-domain.com/agreement"
}
```

## 3. 权限使用说明

### 3.1 地理位置权限

**用途：** 工时打卡时获取用户位置信息

**使用场景：**
- 上班打卡定位
- 下班打卡定位
- 外勤工作位置记录

**代码示例：**
```javascript
// 获取位置权限
wx.authorize({
  scope: 'scope.userLocation',
  success() {
    // 获取位置信息
    wx.getLocation({
      type: 'gcj02',
      success(res) {
        console.log('位置信息', res)
      }
    })
  },
  fail() {
    // 权限被拒绝，引导用户手动开启
    wx.showModal({
      title: '位置权限',
      content: '需要获取您的位置信息用于打卡定位，请在设置中开启位置权限',
      confirmText: '去设置',
      success(res) {
        if (res.confirm) {
          wx.openSetting()
        }
      }
    })
  }
})
```

### 3.2 相机和相册权限

**用途：** 上传工作相关图片

**使用场景：**
- 工作现场照片上传
- 工作成果展示
- 问题反馈图片

**代码示例：**
```javascript
// 选择图片
wx.chooseImage({
  count: 1,
  sizeType: ['original', 'compressed'],
  sourceType: ['album', 'camera'],
  success(res) {
    const tempFilePaths = res.tempFilePaths
    // 上传图片
    wx.uploadFile({
      url: 'https://api.your-domain.com/upload',
      filePath: tempFilePaths[0],
      name: 'file',
      success(uploadRes) {
        console.log('上传成功', uploadRes)
      }
    })
  }
})
```

### 3.3 用户信息权限

**用途：** 获取用户基本信息用于身份识别

**使用场景：**
- 用户登录
- 个人资料完善
- 工时记录关联

**代码示例：**
```javascript
// 获取用户信息
wx.getUserProfile({
  desc: '用于完善用户资料',
  success(res) {
    console.log('用户信息', res.userInfo)
    // 保存用户信息
    wx.setStorageSync('userInfo', res.userInfo)
  },
  fail() {
    wx.showToast({
      title: '获取用户信息失败',
      icon: 'none'
    })
  }
})
```

### 3.4 扫码权限

**用途：** 扫描二维码进行快速操作

**使用场景：**
- 扫码签到
- 设备绑定
- 快速导航

**代码示例：**
```javascript
// 扫码
wx.scanCode({
  success(res) {
    console.log('扫码结果', res.result)
    // 处理扫码结果
    this.handleScanResult(res.result)
  },
  fail() {
    wx.showToast({
      title: '扫码失败',
      icon: 'none'
    })
  }
})
```

## 4. 权限管理最佳实践

### 4.1 权限申请时机

- **按需申请：** 只在需要使用功能时申请权限
- **明确说明：** 清楚告知用户权限用途
- **优雅降级：** 权限被拒绝时提供替代方案

### 4.2 权限状态检查

```javascript
// 检查权限状态
function checkPermission(scope) {
  return new Promise((resolve, reject) => {
    wx.getSetting({
      success(res) {
        if (res.authSetting[scope]) {
          resolve(true)
        } else {
          resolve(false)
        }
      },
      fail: reject
    })
  })
}

// 使用示例
checkPermission('scope.userLocation').then(hasPermission => {
  if (hasPermission) {
    // 已有权限，直接使用
    wx.getLocation({})
  } else {
    // 申请权限
    wx.authorize({ scope: 'scope.userLocation' })
  }
})
```

### 4.3 权限被拒绝处理

```javascript
// 权限被拒绝时的处理
function handlePermissionDenied(scope, message) {
  wx.showModal({
    title: '权限申请',
    content: message,
    confirmText: '去设置',
    cancelText: '取消',
    success(res) {
      if (res.confirm) {
        // 跳转到设置页面
        wx.openSetting({
          success(settingRes) {
            if (settingRes.authSetting[scope]) {
              wx.showToast({
                title: '权限开启成功',
                icon: 'success'
              })
            }
          }
        })
      }
    }
  })
}
```

## 5. 常见问题

### 5.1 域名配置问题

**问题：** 网络请求失败，提示域名不在白名单中

**解决：**
1. 检查微信公众平台后台域名配置
2. 确保域名使用HTTPS协议
3. 域名配置后需要重新编译小程序

### 5.2 权限申请失败

**问题：** 用户拒绝权限申请后无法再次申请

**解决：**
1. 使用 `wx.openSetting()` 引导用户手动开启
2. 提供清晰的权限说明
3. 实现权限状态检查机制

### 5.3 隐私协议问题

**问题：** 小程序审核时提示缺少隐私协议

**解决：**
1. 在 `app.json` 中配置隐私协议链接
2. 确保隐私协议页面可正常访问
3. 隐私协议内容要详细说明数据使用情况

## 6. 检查清单

### 6.1 配置检查

- [ ] 微信公众平台域名配置完成
- [ ] app.json权限声明配置
- [ ] 隐私协议和用户协议配置
- [ ] 接口权限开通

### 6.2 代码检查

- [ ] 权限申请代码实现
- [ ] 权限状态检查机制
- [ ] 权限被拒绝处理逻辑
- [ ] 网络请求域名验证

### 6.3 测试检查

- [ ] 各项权限申请流程测试
- [ ] 权限被拒绝场景测试
- [ ] 网络请求功能测试
- [ ] 文件上传下载测试

## 7. 相关文档

- [微信小程序官方文档 - 接口权限](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/authorize.html)
- [微信小程序官方文档 - 服务器域名配置](https://developers.weixin.qq.com/miniprogram/dev/framework/ability/network.html)
- [微信小程序官方文档 - 隐私协议](https://developers.weixin.qq.com/miniprogram/dev/framework/user-privacy/)