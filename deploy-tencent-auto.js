#!/usr/bin/env node

/**
 * 工时管理系统 - 腾讯云COS+CDN自动化部署脚本
 * 
 * 使用说明：
 * 1. 安装依赖：npm install cos-nodejs-sdk-v5 --save-dev
 * 2. 配置环境变量或修改下方配置
 * 3. 运行：node deploy-tencent-auto.js
 */

import COS from 'cos-nodejs-sdk-v5';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔧 配置信息 - 请根据实际情况修改
const config = {
  // COS配置
  cos: {
    SecretId: process.env.TENCENT_SECRET_ID || 'YOUR_SECRET_ID',
    SecretKey: process.env.TENCENT_SECRET_KEY || 'YOUR_SECRET_KEY',
    Region: 'ap-beijing', // 北京地域，可选：ap-shanghai, ap-guangzhou
    Bucket: 'timesheet-mobile-app-1234567890' // 需要包含APPID
  },
  
  // CDN配置
  cdn: {
    domain: 'YOUR_CDN_DOMAIN', // 例如：timesheet.example.com
    refreshUrls: true // 是否刷新CDN缓存
  },
  
  // 部署配置
  deploy: {
    sourceDir: './dist',
    targetPrefix: '', // COS目标前缀，空字符串表示根目录
    deleteRemote: false, // 是否删除远程多余文件
    dryRun: false // 是否只是预览，不实际上传
  }
};

// 📁 MIME类型映射
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
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

// ⏰ 缓存控制策略
const cacheControl = {
  '.html': 'public, max-age=3600', // 1小时
  '.css': 'public, max-age=2592000', // 30天
  '.js': 'public, max-age=2592000', // 30天
  '.png': 'public, max-age=604800', // 7天
  '.jpg': 'public, max-age=604800', // 7天
  '.jpeg': 'public, max-age=604800', // 7天
  '.gif': 'public, max-age=604800', // 7天
  '.svg': 'public, max-age=604800', // 7天
  '.ico': 'public, max-age=2592000', // 30天
  '.woff': 'public, max-age=31536000', // 1年
  '.woff2': 'public, max-age=31536000', // 1年
  '.ttf': 'public, max-age=31536000', // 1年
  '.eot': 'public, max-age=31536000', // 1年
  'default': 'public, max-age=86400' // 1天
};

// 🎨 控制台颜色
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 📊 获取文件信息
function getFileInfo(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const stats = fs.statSync(filePath);
  const content = fs.readFileSync(filePath);
  const hash = createHash('md5').update(content).digest('hex');
  
  return {
    size: stats.size,
    mimeType: mimeTypes[ext] || 'application/octet-stream',
    cacheControl: cacheControl[ext] || cacheControl.default,
    hash,
    content
  };
}

// 📂 递归获取所有文件
function getAllFiles(dir, baseDir = dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getAllFiles(fullPath, baseDir));
    } else {
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      files.push({
        localPath: fullPath,
        remotePath: relativePath,
        ...getFileInfo(fullPath)
      });
    }
  }
  
  return files;
}

// 🚀 主部署函数
async function deploy() {
  try {
    log('🚀 开始部署工时管理系统到腾讯云COS+CDN...', 'cyan');
    log('', 'reset');
    
    // 检查配置
    if (config.cos.SecretId === 'YOUR_SECRET_ID') {
      log('❌ 错误：请先配置腾讯云密钥', 'red');
      log('', 'reset');
      log('配置方法：', 'yellow');
      log('1. 设置环境变量：', 'yellow');
      log('   export TENCENT_SECRET_ID="your_secret_id"', 'yellow');
      log('   export TENCENT_SECRET_KEY="your_secret_key"', 'yellow');
      log('2. 或直接修改脚本中的config配置', 'yellow');
      log('', 'reset');
      log('💡 获取密钥：https://console.cloud.tencent.com/cam/capi', 'blue');
      return;
    }
    
    // 检查源目录
    if (!fs.existsSync(config.deploy.sourceDir)) {
      log(`❌ 错误：源目录不存在 ${config.deploy.sourceDir}`, 'red');
      log('请先运行 npm run build 构建项目', 'yellow');
      return;
    }
    
    // 初始化COS客户端
    log('🔧 初始化COS客户端...', 'blue');
    const cos = new COS({
      SecretId: config.cos.SecretId,
      SecretKey: config.cos.SecretKey
    });
    
    // 获取所有文件
    log('📂 扫描本地文件...', 'blue');
    const files = getAllFiles(config.deploy.sourceDir);
    log(`找到 ${files.length} 个文件`, 'green');
    
    // 显示文件列表
    log('', 'reset');
    log('📋 文件列表：', 'cyan');
    let totalSize = 0;
    for (const file of files) {
      const sizeKB = (file.size / 1024).toFixed(1);
      totalSize += file.size;
      log(`  ${file.remotePath} (${sizeKB}KB, ${file.mimeType})`, 'reset');
    }
    log(`总大小: ${(totalSize / 1024 / 1024).toFixed(2)}MB`, 'green');
    
    if (config.deploy.dryRun) {
      log('', 'reset');
      log('🔍 预览模式，不会实际上传文件', 'yellow');
      return;
    }
    
    // 上传文件
    log('', 'reset');
    log('📤 开始上传文件...', 'blue');
    
    let uploadedCount = 0;
    let skippedCount = 0;
    
    for (const file of files) {
      try {
        const remotePath = config.deploy.targetPrefix + file.remotePath;
        
        // 检查远程文件是否存在且相同
        let shouldUpload = true;
        try {
          const result = await new Promise((resolve, reject) => {
            cos.headObject({
              Bucket: config.cos.Bucket,
              Region: config.cos.Region,
              Key: remotePath
            }, (err, data) => {
              if (err) reject(err);
              else resolve(data);
            });
          });
          
          if (result.headers && result.headers['x-cos-meta-hash'] === file.hash) {
            shouldUpload = false;
            skippedCount++;
            log(`  ⏭️  跳过 ${file.remotePath} (文件未变化)`, 'yellow');
          }
        } catch (err) {
          // 文件不存在，需要上传
        }
        
        if (shouldUpload) {
          await new Promise((resolve, reject) => {
            cos.putObject({
              Bucket: config.cos.Bucket,
              Region: config.cos.Region,
              Key: remotePath,
              Body: file.content,
              ContentType: file.mimeType,
              CacheControl: file.cacheControl,
              Metadata: {
                hash: file.hash,
                uploadTime: new Date().toISOString()
              }
            }, (err, data) => {
              if (err) reject(err);
              else resolve(data);
            });
          });
          
          uploadedCount++;
          log(`  ✅ 上传 ${file.remotePath} (${(file.size/1024).toFixed(1)}KB)`, 'green');
        }
      } catch (err) {
        log(`  ❌ 上传失败 ${file.remotePath}: ${err.message}`, 'red');
      }
    }
    
    log('', 'reset');
    log('📊 上传统计：', 'cyan');
    log(`  ✅ 成功上传: ${uploadedCount} 个文件`, 'green');
    log(`  ⏭️  跳过: ${skippedCount} 个文件`, 'yellow');
    log(`  ❌ 失败: ${files.length - uploadedCount - skippedCount} 个文件`, 'red');
    
    // 获取COS域名
    log('', 'reset');
    log('🌐 访问地址：', 'cyan');
    const cosUrl = `https://${config.cos.Bucket}.cos.${config.cos.Region}.myqcloud.com`;
    log(`  COS直链: ${cosUrl}`, 'blue');
    
    if (config.cdn.domain && config.cdn.domain !== 'YOUR_CDN_DOMAIN') {
      log(`  CDN加速: https://${config.cdn.domain}`, 'blue');
    } else {
      log('  💡 建议配置CDN域名以获得更好的访问速度', 'yellow');
    }
    
    log('', 'reset');
    log('🎉 部署完成！', 'green');
    log('', 'reset');
    log('📱 请使用手机移动网络测试访问，验证问题是否解决', 'magenta');
    log('', 'reset');
    log('🔧 后续优化建议：', 'yellow');
    log('1. 配置CDN加速域名', 'yellow');
    log('2. 申请SSL证书启用HTTPS', 'yellow');
    log('3. 配置静态网站托管', 'yellow');
    log('4. 设置缓存和压缩策略', 'yellow');
    
  } catch (error) {
    log('', 'reset');
    log(`❌ 部署失败: ${error.message}`, 'red');
    log('', 'reset');
    log('🔧 常见问题解决：', 'yellow');
    log('1. 检查SecretId/SecretKey是否正确', 'yellow');
    log('2. 确认存储桶名称是否存在且有权限', 'yellow');
    log('3. 检查地域(Region)配置是否正确', 'yellow');
    log('4. 确认网络连接是否正常', 'yellow');
    log('5. 查看腾讯云控制台错误日志', 'yellow');
  }
}

// 🏃‍♂️ 运行部署
if (import.meta.url === `file://${process.argv[1]}`) {
  deploy();
}

export default deploy;