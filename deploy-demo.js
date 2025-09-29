#!/usr/bin/env node

/**
 * 工时管理系统 - 演示部署脚本
 * 此脚本用于演示部署流程，实际部署请配置真实的云服务密钥
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        size: stat.size
      });
    }
  }
  
  return files;
}

// 🚀 演示部署函数
async function demoDeploy() {
  try {
    log('🚀 工时管理系统 - 云端部署演示', 'cyan');
    log('', 'reset');
    
    // 检查源目录
    const sourceDir = './dist';
    if (!fs.existsSync(sourceDir)) {
      log(`❌ 错误：源目录不存在 ${sourceDir}`, 'red');
      log('请先运行 npm run build 构建项目', 'yellow');
      return;
    }
    
    // 获取所有文件
    log('📂 扫描本地文件...', 'blue');
    const files = getAllFiles(sourceDir);
    log(`找到 ${files.length} 个文件`, 'green');
    
    // 显示文件列表
    log('', 'reset');
    log('📋 准备部署的文件：', 'cyan');
    let totalSize = 0;
    for (const file of files) {
      const sizeKB = (file.size / 1024).toFixed(1);
      totalSize += file.size;
      log(`  ${file.remotePath} (${sizeKB}KB)`, 'reset');
    }
    log(`总大小: ${(totalSize / 1024 / 1024).toFixed(2)}MB`, 'green');
    
    log('', 'reset');
    log('🌐 推荐的部署方案：', 'cyan');
    log('', 'reset');
    
    // 阿里云方案
    log('📦 方案一：阿里云OSS + CDN (推荐)', 'green');
    log('  ✅ 优势：国内访问速度快，移动网络优化好', 'green');
    log('  💰 成本：约20元/月 (1000用户)', 'green');
    log('  🔧 配置：', 'yellow');
    log('    1. 访问 https://oss.console.aliyun.com/', 'yellow');
    log('    2. 创建存储桶：timesheet-mobile-app', 'yellow');
    log('    3. 设置公共读权限', 'yellow');
    log('    4. 配置CDN加速域名', 'yellow');
    log('    5. 申请SSL证书启用HTTPS', 'yellow');
    log('', 'reset');
    
    // 腾讯云方案
    log('📦 方案二：腾讯云COS + CDN', 'blue');
    log('  ✅ 优势：价格便宜，功能完善', 'blue');
    log('  💰 成本：约15元/月 (1000用户)', 'blue');
    log('  🔧 配置：', 'yellow');
    log('    1. 访问 https://console.cloud.tencent.com/cos', 'yellow');
    log('    2. 创建存储桶：timesheet-mobile-app', 'yellow');
    log('    3. 配置静态网站托管', 'yellow');
    log('    4. 绑定CDN加速域名', 'yellow');
    log('', 'reset');
    
    // 部署步骤
    log('🔧 部署步骤：', 'cyan');
    log('', 'reset');
    log('1️⃣ 配置云服务密钥', 'magenta');
    log('   - 复制 .env.deploy 为 .env', 'yellow');
    log('   - 填入真实的AccessKey/SecretKey', 'yellow');
    log('', 'reset');
    
    log('2️⃣ 执行部署命令', 'magenta');
    log('   - 阿里云：node deploy-aliyun-auto.js', 'yellow');
    log('   - 腾讯云：node deploy-tencent-auto.js', 'yellow');
    log('', 'reset');
    
    log('3️⃣ 配置域名和HTTPS', 'magenta');
    log('   - 绑定自定义域名', 'yellow');
    log('   - 申请SSL证书', 'yellow');
    log('   - 配置CDN缓存策略', 'yellow');
    log('', 'reset');
    
    log('4️⃣ 测试访问', 'magenta');
    log('   - 电脑端浏览器测试', 'yellow');
    log('   - 手机端移动网络测试', 'yellow');
    log('   - 微信内置浏览器测试', 'yellow');
    log('', 'reset');
    
    // 预期效果
    log('🎯 预期效果：', 'cyan');
    log('  ✅ 解决ERR_CONNECTION_TIMED_OUT问题', 'green');
    log('  ✅ 移动网络访问速度提升80%+', 'green');
    log('  ✅ 微信内置浏览器完美支持', 'green');
    log('  ✅ 全国三大运营商稳定访问', 'green');
    log('  ✅ HTTPS安全访问，无警告', 'green');
    log('', 'reset');
    
    // 当前可用地址
    log('🌐 当前可用访问地址：', 'cyan');
    log('  Vercel: https://timesheet-mobile-fixed.vercel.app/', 'blue');
    log('  本地: http://localhost:5173/', 'blue');
    log('', 'reset');
    
    log('📱 建议：优先使用国内CDN解决移动网络访问问题', 'magenta');
    log('', 'reset');
    
    log('🎉 部署方案准备完成！', 'green');
    log('请按照上述步骤配置云服务并执行实际部署', 'green');
    
  } catch (error) {
    log('', 'reset');
    log(`❌ 演示失败: ${error.message}`, 'red');
  }
}

// 🏃‍♂️ 运行演示
if (import.meta.url === `file://${process.argv[1]}`) {
  demoDeploy();
}

export default demoDeploy;