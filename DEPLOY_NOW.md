# 🚀 工时管理系统 - 5分钟快速部署指南

## 📋 当前状态

✅ **项目已准备就绪**
- 构建文件已生成 (dist/)
- 阿里云OSS依赖已安装
- 部署脚本已配置
- 文件总大小: 1.51MB (10个文件)

## 🔑 第一步：获取阿里云AccessKey (2分钟)

### 1. 登录阿里云控制台
- 访问：https://ram.console.aliyun.com/users
- 登录你的阿里云账号

### 2. 创建RAM用户
```
用户名: timesheet-deploy
访问方式: ✅ 编程访问
权限: AliyunOSSFullAccess
```

### 3. 获取密钥
- 创建用户后，点击「创建AccessKey」
- **立即复制并保存**：
  - AccessKey ID
  - AccessKey Secret

## 🪣 第二步：创建OSS存储桶 (1分钟)

### 1. 访问OSS控制台
- 地址：https://oss.console.aliyun.com/bucket

### 2. 创建存储桶
```
存储桶名称: timesheet-mobile-app
地域: 华东1(杭州) 推荐
存储类型: 标准存储
读写权限: 公共读
```

## ⚙️ 第三步：配置密钥 (30秒)

编辑项目根目录的 `.env` 文件，替换以下内容：

```env
# 将 YOUR_ACCESS_KEY_ID 替换为你的真实AccessKey ID
ALIYUN_ACCESS_KEY_ID=LTAI5t...

# 将 YOUR_ACCESS_KEY_SECRET 替换为你的真实AccessKey Secret  
ALIYUN_ACCESS_KEY_SECRET=abc123...
```

## 🚀 第四步：一键部署 (1分钟)

在项目根目录运行：

```bash
# 方式1：使用部署工具
node deploy.cjs aliyun

# 方式2：直接运行部署脚本
node deploy-aliyun-auto.js
```

## 🌐 第五步：访问你的网站

部署成功后，你将获得两个访问地址：

### OSS直链 (立即可用)
```
https://timesheet-mobile-app.oss-cn-hangzhou.aliyuncs.com/
```

### CDN加速域名 (推荐)
```
需要在阿里云CDN控制台配置自定义域名
```

## 📱 移动端测试

**重要**：请使用手机移动网络测试访问，确保：
- ✅ 页面加载速度快
- ✅ 功能正常使用
- ✅ 响应式布局正确

## 💰 成本预估

- **OSS存储**: ~2元/月 (1GB)
- **CDN流量**: ~15元/月 (10GB)
- **总计**: ~20元/月

## 🔧 常见问题

### Q: AccessKey权限不足？
A: 确保RAM用户有 `AliyunOSSFullAccess` 权限

### Q: 存储桶创建失败？
A: 存储桶名称必须全局唯一，尝试添加随机数字

### Q: 部署失败？
A: 检查 `.env` 文件中的密钥是否正确填写

### Q: 手机访问慢？
A: 配置CDN加速域名，提升访问速度

## 🎯 下一步优化

1. **配置CDN加速**
   - 访问：https://cdn.console.aliyun.com/
   - 添加加速域名
   - 配置HTTPS证书

2. **绑定自定义域名**
   - 购买域名
   - 配置DNS解析
   - 申请SSL证书

3. **性能监控**
   - 配置访问日志
   - 监控访问统计
   - 优化缓存策略

---

🎉 **恭喜！你的工时管理系统即将上线！**

有问题？查看详细文档：
- `QUICK_DEPLOY_CLOUD.md` - 详细部署指南
- `DEPLOYMENT_GUIDE.md` - 技术文档
- `deploy-demo.js` - 演示脚本