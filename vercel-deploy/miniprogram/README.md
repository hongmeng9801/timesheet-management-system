# 工时管理微信小程序开发文档

## 项目概述

本项目采用H5+小程序壳的方案，通过微信小程序的webview组件嵌入现有的H5工时管理系统，实现快速上线微信小程序，解决移动端访问问题。

### 技术架构

- **前端框架**：微信小程序原生开发
- **H5页面**：React + Vite + TypeScript
- **通信方式**：webview与小程序双向通信
- **部署方式**：小程序独立发布，H5页面独立部署

### 项目结构

```
miniprogram/
├── pages/                  # 页面目录
│   ├── index/             # 首页
│   │   ├── index.js
│   │   ├── index.json
│   │   ├── index.wxml
│   │   └── index.wxss
│   └── webview/           # webview页面
│       ├── webview.js
│       ├── webview.json
│       ├── webview.wxml
│       └── webview.wxss
├── utils/                 # 工具类
│   └── utils.js
├── images/                # 图片资源
├── app.js                 # 小程序入口文件
├── app.json              # 小程序配置文件
├── app.wxss              # 全局样式文件
├── sitemap.json          # 站点地图
├── project.config.json   # 项目配置
├── deploy.config.js      # 部署配置
├── publish.config.json   # 发布配置
└── domain-whitelist.md   # 域名白名单说明
```

## 开发环境搭建

### 1. 安装微信开发者工具

1. 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 使用微信扫码登录
3. 创建小程序项目

### 2. 配置开发环境

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd 工时管理/miniprogram
   ```

2. **配置AppID**
   
   修改 `project.config.json` 中的 `appid` 字段：
   ```json
   {
     "appid": "your_miniprogram_appid"
   }
   ```

3. **配置H5页面地址**
   
   修改 `deploy.config.js` 中的开发环境配置：
   ```javascript
   development: {
     h5Url: 'http://localhost:5173',  // 本地H5开发服务器地址
     apiUrl: 'http://localhost:3000/api'
   }
   ```

4. **启动H5开发服务器**
   ```bash
   cd ../  # 回到H5项目根目录
   npm run dev
   ```

5. **在微信开发者工具中打开项目**
   - 选择「导入项目」
   - 选择 `miniprogram` 目录
   - 输入AppID
   - 点击「导入」

## 核心功能说明

### 1. 用户授权登录

小程序首页实现了微信用户信息获取功能：

```javascript
// 获取用户信息
getUserInfo() {
  if (wx.getUserProfile) {
    // 新版API
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        this.setData({ userInfo: res.userInfo, hasUserInfo: true })
        wx.setStorageSync('userInfo', res.userInfo)
      }
    })
  } else {
    // 兼容旧版API
    wx.getUserInfo({
      success: (res) => {
        this.setData({ userInfo: res.userInfo, hasUserInfo: true })
        wx.setStorageSync('userInfo', res.userInfo)
      }
    })
  }
}
```

### 2. webview页面嵌入

webview页面负责加载H5工时管理系统：

```javascript
// 构建H5页面URL
buildH5Url() {
  const app = getApp()
  const baseUrl = app.globalData.h5Url
  const userInfo = wx.getStorageSync('userInfo')
  
  let url = baseUrl
  if (userInfo) {
    // 传递用户信息到H5页面
    const params = new URLSearchParams({
      nickname: userInfo.nickName,
      avatar: userInfo.avatarUrl,
      source: 'miniprogram'
    })
    url += '?' + params.toString()
  }
  
  return url
}
```

### 3. 双向通信机制

#### 小程序向H5发送消息

```javascript
// 发送用户信息到H5
sendUserInfoToH5() {
  const userInfo = wx.getStorageSync('userInfo')
  this.postMessageToH5({
    type: 'USER_INFO',
    data: userInfo
  })
},

// 向H5发送消息
postMessageToH5(message) {
  if (this.webviewContext) {
    this.webviewContext.postMessage({ data: message })
  }
}
```

#### H5向小程序发送消息

```javascript
// H5页面中的代码
if (window.wx && window.wx.miniProgram) {
  // 向小程序发送消息
  window.wx.miniProgram.postMessage({
    data: {
      type: 'GET_USER_INFO'
    }
  })
  
  // 返回小程序
  window.wx.miniProgram.navigateBack()
}
```

### 4. 环境检测和适配

H5页面集成了微信环境检测：

```javascript
// 检测微信环境
function isWechat() {
  return /micromessenger/i.test(navigator.userAgent)
}

// 检测小程序环境
function isMiniProgram() {
  return window.__wxjs_environment === 'miniprogram'
}

// 初始化适配
function initWechatAdapter() {
  if (isMiniProgram()) {
    document.body.classList.add('miniprogram-env')
    // 初始化小程序通信
    initMiniProgramBridge()
  } else if (isWechat()) {
    document.body.classList.add('wechat-env')
  }
}
```

## 部署配置

### 1. 域名白名单配置

在微信公众平台后台配置以下域名：

#### request合法域名
```
https://api.yourdomain.com
https://test-api.yourdomain.com
```

#### 业务域名
```
https://timesheet.yourdomain.com
https://test-timesheet.yourdomain.com
```

详细配置说明请参考 [domain-whitelist.md](./domain-whitelist.md)

### 2. 环境配置

修改 `deploy.config.js` 中的生产环境配置：

```javascript
production: {
  h5Url: 'https://timesheet.yourdomain.com',
  apiUrl: 'https://api.yourdomain.com/api',
  uploadUrl: 'https://api.yourdomain.com/upload',
  wsUrl: 'wss://api.yourdomain.com/ws',
  env: 'production'
}
```

### 3. 小程序信息配置

在 `app.json` 中配置小程序基本信息：

```json
{
  "pages": [
    "pages/index/index",
    "pages/webview/webview"
  ],
  "window": {
    "backgroundTextStyle": "light",
    "navigationBarBackgroundColor": "#fff",
    "navigationBarTitleText": "工时管理",
    "navigationBarTextStyle": "black"
  },
  "tabBar": {
    "color": "#7A7E83",
    "selectedColor": "#3cc51f",
    "borderStyle": "black",
    "backgroundColor": "#ffffff",
    "list": [
      {
        "pagePath": "pages/index/index",
        "iconPath": "images/icon_home.png",
        "selectedIconPath": "images/icon_home_HL.png",
        "text": "首页"
      },
      {
        "pagePath": "pages/webview/webview",
        "iconPath": "images/icon_timesheet.png",
        "selectedIconPath": "images/icon_timesheet_HL.png",
        "text": "工时管理"
      }
    ]
  }
}
```

## 发布流程

### 1. 代码审查

发布前请确保：

- [ ] 所有功能正常运行
- [ ] H5页面在小程序中正常显示
- [ ] 用户授权流程完整
- [ ] 双向通信功能正常
- [ ] 域名白名单已配置
- [ ] 隐私政策已完善

### 2. 版本管理

1. **更新版本号**
   
   修改 `publish.config.json` 中的版本信息：
   ```json
   {
     "version": {
       "version": "1.0.0",
       "desc": "版本更新说明"
     }
   }
   ```

2. **提交代码**
   ```bash
   git add .
   git commit -m "feat: 发布版本 v1.0.0"
   git tag v1.0.0
   git push origin main --tags
   ```

### 3. 小程序发布

1. **上传代码**
   - 在微信开发者工具中点击「上传」
   - 填写版本号和版本描述
   - 点击「上传」

2. **提交审核**
   - 登录微信公众平台
   - 进入「版本管理」
   - 选择刚上传的版本
   - 点击「提交审核」
   - 填写审核信息

3. **发布上线**
   - 审核通过后，点击「发布」
   - 小程序正式上线

### 4. H5页面部署

1. **构建生产版本**
   ```bash
   npm run build
   ```

2. **部署到服务器**
   ```bash
   # 示例：使用rsync部署
   rsync -avz --delete dist/ user@server:/var/www/timesheet/
   ```

3. **配置HTTPS**
   确保H5页面支持HTTPS访问

4. **验证部署**
   访问生产环境URL，确保页面正常加载

## 测试指南

### 1. 功能测试

#### 用户授权测试
- [ ] 首次进入小程序，显示授权按钮
- [ ] 点击授权，成功获取用户信息
- [ ] 用户信息正确显示在页面上
- [ ] 用户信息正确传递给H5页面

#### webview加载测试
- [ ] webview页面正常加载H5内容
- [ ] 加载过程显示loading状态
- [ ] 加载失败显示错误页面
- [ ] 支持下拉刷新重新加载

#### 通信功能测试
- [ ] 小程序向H5发送用户信息
- [ ] H5向小程序发送消息
- [ ] 小程序接收H5消息并正确处理
- [ ] 支持返回小程序功能

### 2. 兼容性测试

#### 设备兼容性
- [ ] iOS设备正常运行
- [ ] Android设备正常运行
- [ ] 不同屏幕尺寸适配正常

#### 微信版本兼容性
- [ ] 最新版微信正常运行
- [ ] 较旧版微信兼容性测试
- [ ] 基础库版本兼容性

### 3. 性能测试

#### 加载性能
- [ ] 小程序启动时间 < 3秒
- [ ] webview页面加载时间 < 5秒
- [ ] 页面切换流畅无卡顿

#### 内存使用
- [ ] 长时间使用无内存泄漏
- [ ] 页面切换内存释放正常

### 4. 网络测试

#### 网络环境
- [ ] WiFi环境正常使用
- [ ] 4G网络正常使用
- [ ] 弱网环境降级处理
- [ ] 网络断开重连机制

## 常见问题

### 1. webview无法加载H5页面

**问题描述**：webview显示空白或加载失败

**解决方案**：
1. 检查H5页面URL是否正确
2. 确认域名已添加到业务域名白名单
3. 验证H5页面HTTPS证书有效性
4. 检查网络连接状态

### 2. 用户信息获取失败

**问题描述**：无法获取微信用户信息

**解决方案**：
1. 检查是否使用了正确的API（getUserProfile vs getUserInfo）
2. 确认用户已授权
3. 验证小程序权限配置
4. 检查代码逻辑是否正确

### 3. 小程序与H5通信失败

**问题描述**：消息无法在小程序和H5之间传递

**解决方案**：
1. 检查H5页面是否正确检测小程序环境
2. 验证postMessage调用时机
3. 确认消息格式正确
4. 检查事件监听是否正确绑定

### 4. 审核被拒绝

**常见拒绝原因**：
1. 缺少隐私政策
2. 功能描述不清晰
3. 存在违规内容
4. 用户体验问题

**解决方案**：
1. 完善隐私政策和用户协议
2. 优化功能描述和截图
3. 检查内容合规性
4. 改善用户体验流程

## 维护和更新

### 1. 日常维护

- **监控小程序运行状态**
- **定期检查H5页面可访问性**
- **关注微信平台政策更新**
- **收集用户反馈并及时处理**

### 2. 版本更新

- **制定版本发布计划**
- **建立测试和发布流程**
- **保持向后兼容性**
- **记录版本更新日志**

### 3. 性能优化

- **监控页面加载性能**
- **优化图片和资源大小**
- **实施缓存策略**
- **减少网络请求次数**

## 技术支持

### 官方文档

- [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/)
- [webview组件文档](https://developers.weixin.qq.com/miniprogram/dev/component/web-view.html)
- [小程序审核规范](https://developers.weixin.qq.com/miniprogram/product/)

### 社区资源

- [微信开放社区](https://developers.weixin.qq.com/community/)
- [小程序开发者论坛](https://developers.weixin.qq.com/community/minihome)

### 联系方式

如有技术问题，请通过以下方式联系：

- **邮箱**：tech-support@yourdomain.com
- **微信群**：扫描二维码加入技术交流群
- **工单系统**：https://support.yourdomain.com

---

**版本**：v1.0.0  
**更新时间**：2024年1月  
**维护者**：开发团队