# 腾讯云COS + CDN部署方案

## 方案优势
- 微信生态优化，微信内置浏览器访问体验更佳
- 腾讯云在移动端优化方面表现优秀
- 价格竞争力强，性价比高
- 与微信小程序生态集成度高

## 部署步骤

### 1. 创建COS存储桶
1. 登录腾讯云控制台
2. 进入对象存储COS服务
3. 创建存储桶：
   - 名称：timesheet-mobile-app
   - 地域：选择离用户最近的地域（如华东-上海）
   - 访问权限：公有读私有写

### 2. 配置静态网站托管
1. 进入存储桶管理
2. 基础配置 → 静态网站
3. 开启静态网站功能
4. 设置索引文档：index.html
5. 设置错误文档：index.html（支持SPA路由）

### 3. 上传网站文件
```bash
# 使用腾讯云CLI上传
coscli cp -r ./dist/ cos://timesheet-mobile-app/
```

### 4. 配置CDN加速
1. 进入CDN控制台
2. 添加域名：
   - 域名类型：自有域名或使用默认域名
   - 源站类型：COS源
   - 源站地址：选择刚创建的COS存储桶
   - 加速区域：中国境内

### 5. HTTPS配置
1. 证书管理 → 申请免费证书
2. CDN域名 → HTTPS配置
3. 开启HTTPS
4. 强制HTTPS跳转

### 6. 缓存配置
```
文件类型          缓存时间
.html            1小时
.css/.js         30天
.png/.jpg/.gif   7天
其他文件         1天
```

### 7. 移动端优化配置
1. 高级配置 → 性能优化
   - 开启Gzip压缩
   - 开启Brotli压缩
   - 开启智能压缩

2. 移动加速
   - 开启移动加速
   - 配置移动端缓存策略
   - 开启预取优化

3. 图片优化
   - 开启WebP自适应
   - 开启图片压缩
   - 配置响应式图片

### 8. 安全配置
1. 访问控制
   - 配置Referer防盗链
   - 设置IP访问限制（可选）

2. 安全头部
```
Content-Security-Policy: default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; img-src 'self' data: blob: https:; font-src 'self' data: https:;
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

## 域名配置（推荐）

### 使用自定义域名
1. 域名备案（必须）
2. 添加CNAME记录指向CDN域名
3. 配置SSL证书
4. 开启HTTPS强制跳转

### DNS智能解析
使用腾讯云DNS解析：
- 移动用户 → 移动优化节点
- 联通用户 → 联通优化节点
- 电信用户 → 电信优化节点

## 成本估算

### COS存储费用
- 标准存储：0.118元/GB/月
- 请求费用：0.01元/万次

### CDN费用
- 流量费用：0.21-0.34元/GB（阶梯计费）
- HTTPS请求：0.05元/万次

### 预估月费用
- 存储（1GB）：约1元
- 流量（100GB）：约25元
- 总计：约30元/月

## 部署命令

```bash
# 1. 安装腾讯云CLI
npm install -g @tencent-cloud/cli

# 2. 配置密钥
tccli configure

# 3. 上传文件到COS
# 需要先安装coscli工具
coscli cp -r ./dist/ cos://timesheet-mobile-app/

# 4. 刷新CDN缓存
tccli cdn PurgePathCache --Paths '["https://your-domain.com/"]' --FlushType flush
```

## 测试验证

### 功能测试
1. 电脑端Chrome浏览器访问
2. 手机端Safari/Chrome访问
3. 微信内置浏览器访问
4. 不同运营商网络测试

### 性能测试
1. 页面加载速度测试
2. 移动网络连接稳定性
3. HTTPS证书验证
4. 缓存命中率检查

## 预期效果
- 解决手机端ERR_CONNECTION_TIMED_OUT问题
- 微信内置浏览器访问流畅
- 全国移动网络稳定访问
- HTTPS安全无警告
- 页面加载速度提升60%以上

## 监控告警
1. 配置CDN监控
2. 设置异常告警
3. 定期检查访问日志
4. 监控错误率和响应时间