#!/usr/bin/env node

/**
 * 阿里云OSS部署脚本
 * 用于将静态网站部署到阿里云OSS + CDN
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 部署配置
const deployConfig = {
  // OSS配置
  oss: {
    region: 'oss-cn-hangzhou', // 建议选择离用户最近的区域
    bucket: 'your-bucket-name', // 需要替换为实际的bucket名称
    accessKeyId: 'your-access-key-id', // 需要配置
    accessKeySecret: 'your-access-key-secret', // 需要配置
  },
  
  // CDN配置
  cdn: {
    domain: 'your-cdn-domain.com', // CDN加速域名
    httpsRedirect: true, // 强制HTTPS
    gzipEnabled: true, // 开启Gzip压缩
  },
  
  // 缓存配置
  cacheRules: {
    html: 3600, // HTML文件缓存1小时
    css: 2592000, // CSS文件缓存30天
    js: 2592000, // JS文件缓存30天
    images: 604800, // 图片缓存7天
    other: 86400, // 其他文件缓存1天
  }
};

// 文件MIME类型映射
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

// 获取文件的缓存时间
function getCacheControl(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  
  if (ext === '.html') {
    return `public, max-age=${deployConfig.cacheRules.html}`;
  } else if (ext === '.css') {
    return `public, max-age=${deployConfig.cacheRules.css}`;
  } else if (ext === '.js') {
    return `public, max-age=${deployConfig.cacheRules.js}`;
  } else if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico'].includes(ext)) {
    return `public, max-age=${deployConfig.cacheRules.images}`;
  } else {
    return `public, max-age=${deployConfig.cacheRules.other}`;
  }
}

// 获取文件的Content-Type
function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return mimeTypes[ext] || 'application/octet-stream';
}

// 部署说明
console.log(`
🚀 阿里云OSS部署脚本
`);
console.log('📋 部署步骤：');
console.log('1. 登录阿里云控制台');
console.log('2. 创建OSS Bucket');
console.log('3. 配置静态网站托管');
console.log('4. 设置CDN加速域名');
console.log('5. 配置HTTPS证书');
console.log('6. 上传网站文件');

console.log('\n📁 需要上传的文件：');
const distPath = path.join(__dirname, 'dist');

function listFiles(dir, prefix = '') {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const relativePath = path.join(prefix, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      console.log(`📂 ${relativePath}/`);
      listFiles(filePath, relativePath);
    } else {
      const size = (stat.size / 1024).toFixed(2);
      const contentType = getContentType(filePath);
      const cacheControl = getCacheControl(filePath);
      console.log(`📄 ${relativePath} (${size}KB, ${contentType})`);
      console.log(`   Cache-Control: ${cacheControl}`);
    }
  });
}

if (fs.existsSync(distPath)) {
  listFiles(distPath);
} else {
  console.log('❌ dist目录不存在，请先运行 npm run build');
  process.exit(1);
}

console.log('\n🔧 OSS配置建议：');
console.log('- Bucket权限：公共读');
console.log('- 静态网站托管：开启');
console.log('- 默认首页：index.html');
console.log('- 404页面：index.html (支持SPA路由)');
console.log('- 防盗链：根据需要配置');

console.log('\n🌐 CDN配置建议：');
console.log('- 源站类型：OSS域名');
console.log('- 加速区域：仅中国大陆');
console.log('- HTTPS：开启（免费证书）');
console.log('- HTTP/2：开启');
console.log('- Gzip压缩：开启');
console.log('- 智能压缩：开启');

console.log('\n📱 移动端优化：');
console.log('- 移动加速：开启');
console.log('- 预取优化：开启');
console.log('- 图片优化：开启WebP转换');
console.log('- 缓存预热：首页和关键资源');

console.log('\n🔒 安全配置：');
console.log('- HTTPS强制跳转：开启');
console.log('- HSTS：开启');
console.log('- 访问控制：根据需要配置');

console.log('\n✅ 部署完成后测试：');
console.log('1. 电脑端浏览器访问');
console.log('2. 手机端移动网络访问');
console.log('3. 微信内置浏览器访问');
console.log('4. 不同运营商网络测试');

console.log('\n🎯 预期效果：');
console.log('- 解决手机端连接超时问题');
console.log('- 提升移动网络访问速度');
console.log('- 支持HTTPS安全访问');
console.log('- 全国各地稳定访问');

console.log('\n💡 如需自动化部署，请安装阿里云CLI或使用OSS SDK');
console.log('   npm install ali-oss --save-dev');