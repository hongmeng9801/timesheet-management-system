# 微信小程序快速部署指南

## 🚀 快速开始

本指南将帮助您在30分钟内完成工时管理小程序的部署上线。

### 前置条件

- [ ] 已注册微信小程序账号
- [ ] 已获得小程序AppID
- [ ] 已部署H5工时管理系统
- [ ] 域名已完成ICP备案并配置HTTPS

## 📋 部署清单

### 第一步：环境准备（5分钟）

1. **下载微信开发者工具**
   ```
   https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
   ```

2. **克隆项目代码**
   ```bash
   git clone <repository-url>
   cd 工时管理/miniprogram
   ```

3. **配置AppID**
   
   编辑 `project.config.json`：
   ```json
   {
     "appid": "wx1234567890abcdef"  // 替换为您的AppID
   }
   ```

### 第二步：域名配置（10分钟）

1. **登录微信公众平台**
   ```
   https://mp.weixin.qq.com/
   ```

2. **配置服务器域名**
   
   进入：开发 → 开发管理 → 服务器域名
   
   **request合法域名：**
   ```
   https://api.yourdomain.com
   ```
   
   **业务域名：**
   ```
   https://timesheet.yourdomain.com
   ```
   
   **uploadFile合法域名：**
   ```
   https://api.yourdomain.com
   ```

3. **下载域名验证文件**
   
   将验证文件上传到H5网站根目录：
   ```bash
   # 示例路径
   https://timesheet.yourdomain.com/MP_verify_xxxxxxxxxx.txt
   ```

### 第三步：项目配置（5分钟）

1. **配置H5页面地址**
   
   编辑 `deploy.config.js`：
   ```javascript
   production: {
     h5Url: 'https://timesheet.yourdomain.com',  // 您的H5页面地址
     apiUrl: 'https://api.yourdomain.com/api',   // 您的API地址
     env: 'production'
   }
   ```

2. **更新小程序信息**
   
   编辑 `app.json`：
   ```json
   {
     "window": {
       "navigationBarTitleText": "您的小程序名称"
     }
   }
   ```

### 第四步：功能测试（5分钟）

1. **在微信开发者工具中打开项目**
   - 选择「导入项目」
   - 选择 `miniprogram` 目录
   - 输入AppID

2. **测试核心功能**
   - [ ] 首页正常显示
   - [ ] 用户授权功能正常
   - [ ] webview加载H5页面成功
   - [ ] 页面跳转正常

### 第五步：上传发布（5分钟）

1. **上传代码**
   - 在开发者工具中点击「上传」
   - 版本号：`1.0.0`
   - 项目备注：`工时管理小程序首个版本`

2. **提交审核**
   - 登录微信公众平台
   - 版本管理 → 开发版本 → 提交审核
   - 填写功能页面和测试账号

3. **等待审核**
   - 审核时间：1-7个工作日
   - 可在「版本管理」中查看审核状态

## ⚙️ 详细配置说明

### 环境变量配置

根据您的实际环境修改 `deploy.config.js`：

```javascript
const config = {
  // 生产环境
  production: {
    h5Url: 'https://your-h5-domain.com',        // 必填：H5页面域名
    apiUrl: 'https://your-api-domain.com/api',  // 必填：API接口域名
    uploadUrl: 'https://your-api-domain.com/upload', // 可选：文件上传
    wsUrl: 'wss://your-api-domain.com/ws',      // 可选：WebSocket
    env: 'production'
  }
}
```

### 小程序基本信息

在 `app.json` 中配置：

```json
{
  "window": {
    "navigationBarTitleText": "工时管理",      // 小程序标题
    "navigationBarBackgroundColor": "#ffffff", // 导航栏背景色
    "navigationBarTextStyle": "black"          // 导航栏文字颜色
  },
  "tabBar": {
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页"                           // 底部tab文字
      },
      {
        "pagePath": "pages/webview/webview",
        "text": "工时管理"                       // 底部tab文字
      }
    ]
  }
}
```

### 隐私设置配置

在微信公众平台配置隐私设置：

1. **用户隐私保护指引**
   ```
   设置 → 基本设置 → 用户隐私保护指引
   ```

2. **隐私政策**
   ```
   我们会收集您的微信昵称和头像，用于：
   - 个性化显示用户信息
   - 提供更好的用户体验
   - 用户身份识别
   ```

## 🔧 故障排除

### 常见问题及解决方案

#### 1. webview无法加载页面

**现象**：webview显示空白或"网页暂时无法访问"

**解决步骤**：
```bash
# 1. 检查域名配置
curl -I https://your-h5-domain.com

# 2. 验证HTTPS证书
openssl s_client -connect your-h5-domain.com:443

# 3. 检查域名验证文件
curl https://your-h5-domain.com/MP_verify_xxxxxxxxxx.txt
```

**检查清单**：
- [ ] 域名已添加到业务域名白名单
- [ ] HTTPS证书有效且未过期
- [ ] 域名验证文件可正常访问
- [ ] H5页面在浏览器中可正常打开

#### 2. 用户授权失败

**现象**：点击授权按钮无反应或报错

**解决步骤**：
1. 检查代码中的授权逻辑
2. 确认使用了正确的API（getUserProfile）
3. 验证隐私设置已正确配置

#### 3. 审核被拒绝

**常见原因及解决方案**：

| 拒绝原因 | 解决方案 |
|---------|----------|
| 缺少隐私政策 | 在设置中添加用户隐私保护指引 |
| 功能描述不清 | 完善小程序介绍和功能说明 |
| 测试账号无效 | 提供可用的测试账号和密码 |
| 页面无法访问 | 检查域名配置和网络连接 |

#### 4. 网络请求失败

**现象**：API请求返回网络错误

**解决步骤**：
```javascript
// 检查请求域名配置
wx.request({
  url: 'https://your-api-domain.com/test',
  success: (res) => {
    console.log('API连接正常', res)
  },
  fail: (err) => {
    console.error('API连接失败', err)
    // 检查域名是否在request合法域名中
  }
})
```

## 📊 性能优化建议

### 1. 加载性能优化

```javascript
// 在app.js中预加载关键数据
App({
  onLaunch() {
    // 预加载用户信息
    this.getUserInfo()
    // 预加载系统信息
    this.getSystemInfo()
  }
})
```

### 2. 缓存策略

```javascript
// 设置合理的缓存时间
const CACHE_TIME = {
  USER_INFO: 24 * 60 * 60 * 1000,    // 用户信息缓存24小时
  SYSTEM_INFO: 7 * 24 * 60 * 60 * 1000  // 系统信息缓存7天
}
```

### 3. 图片优化

- 使用WebP格式图片
- 压缩图片大小
- 使用CDN加速

## 📈 监控和分析

### 1. 小程序数据助手

在微信公众平台查看：
- 用户访问数据
- 页面访问路径
- 用户留存情况
- 性能数据

### 2. 自定义埋点

```javascript
// 关键操作埋点
wx.reportAnalytics('user_login', {
  login_type: 'wechat',
  timestamp: Date.now()
})

wx.reportAnalytics('page_view', {
  page: 'webview',
  url: this.data.webviewUrl
})
```

## 🔄 持续集成

### 自动化部署脚本

创建 `deploy.sh`：

```bash
#!/bin/bash

# 构建H5项目
echo "构建H5项目..."
cd ../
npm run build

# 部署H5到服务器
echo "部署H5页面..."
rsync -avz --delete dist/ user@server:/var/www/timesheet/

# 上传小程序代码（需要微信开发者工具CLI）
echo "上传小程序代码..."
cd miniprogram
cli upload --project . --version 1.0.0 --desc "自动部署版本"

echo "部署完成！"
```

### 版本管理

```bash
# 创建发布分支
git checkout -b release/v1.0.0

# 更新版本号
npm version patch

# 提交并打标签
git add .
git commit -m "chore: release v1.0.0"
git tag v1.0.0

# 合并到主分支
git checkout main
git merge release/v1.0.0
git push origin main --tags
```

## 📞 技术支持

### 紧急联系方式

- **技术热线**：400-xxx-xxxx
- **邮箱支持**：support@yourdomain.com
- **在线客服**：https://support.yourdomain.com

### 文档资源

- [完整开发文档](./README.md)
- [域名配置指南](./domain-whitelist.md)
- [微信官方文档](https://developers.weixin.qq.com/miniprogram/dev/)

### 社区支持

- **开发者群**：微信群二维码
- **技术论坛**：https://forum.yourdomain.com
- **GitHub Issues**：https://github.com/your-org/timesheet-miniprogram/issues

---

## ✅ 部署完成检查清单

部署完成后，请确认以下项目：

### 基础配置
- [ ] AppID配置正确
- [ ] 域名白名单已配置
- [ ] 域名验证文件已上传
- [ ] H5页面可正常访问

### 功能测试
- [ ] 小程序正常启动
- [ ] 用户授权功能正常
- [ ] webview加载H5页面成功
- [ ] 页面间跳转正常
- [ ] 双向通信功能正常

### 审核准备
- [ ] 隐私政策已配置
- [ ] 功能描述已完善
- [ ] 测试账号已准备
- [ ] 审核材料已提交

### 上线后
- [ ] 监控数据正常
- [ ] 用户反馈收集
- [ ] 性能指标达标
- [ ] 错误日志监控

**恭喜！您的工时管理小程序已成功部署上线！** 🎉

如有任何问题，请参考故障排除部分或联系技术支持。