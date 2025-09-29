#!/usr/bin/env node

/**
 * 工时管理系统 - 阿里云OSS+CDN自动化部署脚本
 * 
 * 使用说明：
 * 1. 安装依赖：npm install ali-oss --save-dev
 * 2. 配置环境变量或修改下方配置
 * 3. 运行：node deploy-aliyun-auto.js
 */

import OSS from 'ali-oss';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔧 配置信息 - 请根据实际情况修改
const config = {
  // OSS配置
  oss: {
    region: 'oss-cn-hangzhou', // 华东1（杭州）
    accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID || 'YOUR_ACCESS_KEY_ID',
    accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET || 'YOUR_ACCESS_KEY_SECRET',
    bucket: 'timesheet-mobile-app'
  },
  
  // CDN配置
  cdn: {
    domain: 'YOUR_CDN_DOMAIN', // 例如：timesheet.example.com
    refreshUrls: true // 是否刷新CDN缓存
  },
  
  // 部署配置
  deploy: {
    sourceDir: './dist',
    targetPrefix: '', // OSS目标前缀，空字符串表示根目录
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
    log('🚀 开始部署工时管理系统到阿里云OSS+CDN...', 'cyan');
    log('', 'reset');
    
    // 检查配置
    if (config.oss.accessKeyId === 'YOUR_ACCESS_KEY_ID') {
      log('❌ 错误：请先配置阿里云AccessKey', 'red');
      log('', 'reset');
      log('配置方法：', 'yellow');
      log('1. 设置环境变量：', 'yellow');
      log('   export ALIYUN_ACCESS_KEY_ID="your_access_key_id"', 'yellow');
      log('   export ALIYUN_ACCESS_KEY_SECRET="your_access_key_secret"', 'yellow');
      log('2. 或直接修改脚本中的config配置', 'yellow');
      return;
    }
    
    // 检查源目录
    if (!fs.existsSync(config.deploy.sourceDir)) {
      log(`❌ 错误：源目录不存在 ${config.deploy.sourceDir}`, 'red');
      log('请先运行 npm run build 构建项目', 'yellow');
      return;
    }
    
    // 初始化OSS客户端
    log('🔧 初始化OSS客户端...', 'blue');
    const client = new OSS(config.oss);
    
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
          const remoteObject = await client.head(remotePath);
          if (remoteObject.meta && remoteObject.meta.hash === file.hash) {
            shouldUpload = false;
            skippedCount++;
            log(`  ⏭️  跳过 ${file.remotePath} (文件未变化)`, 'yellow');
          }
        } catch (err) {
          // 文件不存在，需要上传
        }
        
        if (shouldUpload) {
          const result = await client.put(remotePath, file.content, {
            headers: {
              'Content-Type': file.mimeType,
              'Cache-Control': file.cacheControl
            },
            meta: {
              hash: file.hash,
              uploadTime: new Date().toISOString()
            }
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
    
    // 获取OSS域名
    log('', 'reset');
    log('🌐 访问地址：', 'cyan');
    const ossUrl = `https://${config.oss.bucket}.${config.oss.region}.aliyuncs.com`;
    log(`  OSS直链: ${ossUrl}`, 'blue');
    
    if (config.cdn.domain && config.cdn.domain !== 'YOUR_CDN_DOMAIN') {
      log(`  CDN加速: https://${config.cdn.domain}`, 'blue');
    } else {
      log('  💡 建议配置CDN域名以获得更好的访问速度', 'yellow');
    }
    
    log('', 'reset');
    log('🎉 部署完成！', 'green');
    log('', 'reset');
    log('📱 请使用手机移动网络测试访问，验证问题是否解决', 'magenta');
    
  } catch (error) {
    log('', 'reset');
    log(`❌ 部署失败: ${error.message}`, 'red');
    log('', 'reset');
    log('🔧 常见问题解决：', 'yellow');
    log('1. 检查AccessKey权限是否正确', 'yellow');
    log('2. 确认Bucket名称是否存在且有权限', 'yellow');
    log('3. 检查网络连接是否正常', 'yellow');
    log('4. 查看阿里云控制台错误日志', 'yellow');
  }
}

// 🏃‍♂️ 运行部署
if (import.meta.url === `file://${process.argv[1]}`) {
  deploy();
}

export default deploy;