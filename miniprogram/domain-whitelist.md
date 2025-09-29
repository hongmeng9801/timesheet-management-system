# 微信小程序域名白名单配置指南

## 概述

微信小程序需要在微信公众平台后台配置服务器域名白名单，只有在白名单中的域名才能被小程序访问。本文档详细说明了工时管理小程序所需的域名配置。

## 配置步骤

### 1. 登录微信公众平台

1. 访问 [微信公众平台](https://mp.weixin.qq.com/)
2. 使用小程序管理员账号登录
3. 进入小程序管理后台

### 2. 进入服务器域名配置

1. 在左侧菜单中选择「开发」→「开发管理」
2. 点击「服务器域名」标签页
3. 点击「修改」按钮

### 3. 配置各类域名

#### request合法域名（API请求域名）

用于小程序发起网络请求的域名，需要配置以下域名：

**生产环境：**
```
https://api.yourdomain.com
```

**测试环境：**
```
https://test-api.yourdomain.com
```

**配置说明：**
- 必须使用 HTTPS 协议
- 域名必须备案
- 支持泛域名配置（如 `*.yourdomain.com`）

#### socket合法域名（WebSocket连接）

用于实时通信功能的WebSocket连接域名：

**生产环境：**
```
wss://api.yourdomain.com
```

**测试环境：**
```
wss://test-api.yourdomain.com
```

**配置说明：**
- 必须使用 WSS 协议（WebSocket Secure）
- 用于实时消息推送、在线状态同步等功能

#### uploadFile合法域名（文件上传）

用于文件上传功能的域名：

**生产环境：**
```
https://api.yourdomain.com
```

**测试环境：**
```
https://test-api.yourdomain.com
```

**配置说明：**
- 用于上传头像、附件等文件
- 必须支持 multipart/form-data 格式

#### downloadFile合法域名（文件下载）

用于文件下载功能的域名：

**生产环境：**
```
https://api.yourdomain.com
https://cdn.yourdomain.com
```

**测试环境：**
```
https://test-api.yourdomain.com
https://test-cdn.yourdomain.com
```

**配置说明：**
- 用于下载文件、图片等资源
- 建议使用CDN域名提高下载速度

#### 业务域名（webview页面）

用于在小程序中打开H5页面的域名：

**生产环境：**
```
https://timesheet.yourdomain.com
```

**测试环境：**
```
https://test-timesheet.yourdomain.com
```

**配置说明：**
- 这是H5页面的访问域名
- 必须通过ICP备案
- 需要在「业务域名」中单独配置

## 域名要求

### 基本要求

1. **HTTPS协议**：所有域名必须支持HTTPS
2. **ICP备案**：域名必须完成ICP备案
3. **SSL证书**：必须配置有效的SSL证书
4. **域名验证**：需要下载验证文件并上传到服务器根目录

### 技术要求

1. **TLS版本**：支持TLS 1.2及以上版本
2. **证书类型**：支持RSA、ECC等主流证书
3. **端口限制**：只支持443端口（HTTPS）和80端口重定向
4. **响应时间**：服务器响应时间应小于5秒

## 配置验证

### 1. 域名验证文件

配置业务域名时，需要下载验证文件并上传到服务器：

```bash
# 验证文件路径示例
https://timesheet.yourdomain.com/MP_verify_xxxxxxxxxx.txt
```

### 2. 测试连接

配置完成后，可以使用以下方式测试：

```javascript
// 测试API请求
wx.request({
  url: 'https://api.yourdomain.com/test',
  success: (res) => {
    console.log('API连接正常', res)
  },
  fail: (err) => {
    console.error('API连接失败', err)
  }
})

// 测试WebSocket连接
const socketTask = wx.connectSocket({
  url: 'wss://api.yourdomain.com/ws'
})
```

## 常见问题

### 1. 域名配置失败

**问题**：提示"域名格式错误"或"域名不可用"

**解决方案**：
- 检查域名是否已备案
- 确认使用HTTPS协议
- 验证SSL证书是否有效
- 检查域名解析是否正确

### 2. 验证文件无法访问

**问题**：业务域名验证失败

**解决方案**：
- 确认验证文件已上传到服务器根目录
- 检查文件权限设置
- 验证文件内容是否正确
- 确认服务器配置允许访问.txt文件

### 3. 请求被拒绝

**问题**：小程序中网络请求失败

**解决方案**：
- 检查域名是否在白名单中
- 确认请求URL格式正确
- 验证服务器是否正常运行
- 检查网络连接状态

### 4. WebSocket连接失败

**问题**：实时功能无法使用

**解决方案**：
- 确认使用WSS协议
- 检查WebSocket服务器状态
- 验证域名配置是否正确
- 测试网络连接稳定性

## 安全建议

### 1. 域名安全

- 定期更新SSL证书
- 使用强加密算法
- 启用HSTS（HTTP Strict Transport Security）
- 配置CSP（Content Security Policy）

### 2. 接口安全

- 实施API访问频率限制
- 使用JWT或类似的身份验证机制
- 对敏感数据进行加密传输
- 记录和监控API访问日志

### 3. 数据安全

- 对用户数据进行加密存储
- 实施数据备份和恢复策略
- 定期进行安全审计
- 遵守数据保护法规

## 更新维护

### 1. 定期检查

- 每月检查域名和证书状态
- 监控服务器性能和可用性
- 更新安全补丁和配置

### 2. 版本管理

- 记录每次配置变更
- 保留配置备份
- 建立回滚机制

### 3. 监控告警

- 设置域名到期提醒
- 配置服务器监控告警
- 建立故障响应流程

## 联系支持

如果在配置过程中遇到问题，可以通过以下方式获取帮助：

- **微信开放社区**：https://developers.weixin.qq.com/community/
- **官方文档**：https://developers.weixin.qq.com/miniprogram/dev/
- **技术支持**：通过微信公众平台提交工单

---

**注意**：域名配置生效可能需要几分钟到几小时的时间，请耐心等待。配置完成后建议进行充分测试，确保所有功能正常运行。