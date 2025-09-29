#!/usr/bin/env node

/**
 * 工时管理系统 - 演示部署测试
 * 模拟真实部署流程，展示部署步骤和结果
 */

const fs = require('fs');
const path = require('path');

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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function simulateDeployment() {
  log('', 'reset');
  log('🚀 ===============================================', 'cyan');
  log('🚀    工时管理系统 - 部署演示', 'cyan');
  log('🚀 ===============================================', 'cyan');
  log('', 'reset');
  
  // 检查项目状态
  log('🔍 检查项目状态...', 'blue');
  await sleep(500);
  
  if (fs.existsSync('./dist')) {
    log('✅ 构建文件存在 (dist/)', 'green');
    
    // 统计文件
    const files = getAllFiles('./dist');
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    log(`   📁 文件数量: ${files.length}`, 'reset');
    log(`   📊 总大小: ${(totalSize / 1024 / 1024).toFixed(2)}MB`, 'reset');
  } else {
    log('❌ 构建文件不存在，请先运行: npm run build', 'red');
    return;
  }
  
  log('', 'reset');
  log('📦 检查部署依赖...', 'blue');
  await sleep(300);
  
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  const hasAliOss = packageJson.devDependencies?.['ali-oss'];
  
  if (hasAliOss) {
    log('✅ 阿里云OSS依赖已安装', 'green');
  } else {
    log('❌ 阿里云OSS依赖未安装', 'red');
    return;
  }
  
  log('', 'reset');
  log('🔑 检查配置文件...', 'blue');
  await sleep(300);
  
  // 检查环境变量
  const envExists = fs.existsSync('./.env');
  if (envExists) {
    const envContent = fs.readFileSync('./.env', 'utf8');
    const hasAliyunConfig = envContent.includes('ALIYUN_ACCESS_KEY_ID');
    
    if (hasAliyunConfig) {
      const hasRealKeys = !envContent.includes('YOUR_ACCESS_KEY_ID');
      if (hasRealKeys) {
        log('✅ 阿里云密钥已配置', 'green');
      } else {
        log('⚠️  阿里云密钥需要配置', 'yellow');
        log('   请编辑 .env 文件，填入真实的AccessKey', 'yellow');
        log('', 'reset');
        showConfigGuide();
        return;
      }
    } else {
      log('❌ 缺少阿里云配置', 'red');
      return;
    }
  } else {
    log('❌ .env 文件不存在', 'red');
    return;
  }
  
  log('', 'reset');
  log('🚀 开始模拟部署...', 'cyan');
  await sleep(500);
  
  // 模拟部署步骤
  const steps = [
    { text: '初始化OSS客户端', delay: 800 },
    { text: '扫描本地文件', delay: 600 },
    { text: '计算文件MD5', delay: 1000 },
    { text: '上传 index.html', delay: 500 },
    { text: '上传 assets/index.css', delay: 400 },
    { text: '上传 assets/index.js', delay: 600 },
    { text: '上传 favicon.svg', delay: 300 },
    { text: '上传其他资源文件', delay: 800 },
    { text: '设置文件权限', delay: 400 },
    { text: '刷新CDN缓存', delay: 600 }
  ];
  
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    log(`📤 ${step.text}...`, 'blue');
    await sleep(step.delay);
    log(`✅ ${step.text} 完成`, 'green');
  }
  
  log('', 'reset');
  log('🎉 部署完成！', 'green');
  log('', 'reset');
  
  // 显示访问地址
  log('🌐 访问地址:', 'cyan');
  log('', 'reset');
  
  log('📍 OSS直链 (立即可用):', 'blue');
  log('   https://timesheet-mobile-app.oss-cn-hangzhou.aliyuncs.com/', 'green');
  log('', 'reset');
  
  log('🚀 CDN加速 (推荐配置):', 'blue');
  log('   https://your-domain.com/', 'yellow');
  log('   (需要在阿里云CDN控制台配置)', 'yellow');
  log('', 'reset');
  
  // 显示测试建议
  log('📱 测试建议:', 'cyan');
  log('', 'reset');
  log('1. 使用电脑浏览器访问OSS直链', 'yellow');
  log('2. 使用手机移动网络测试访问速度', 'yellow');
  log('3. 测试各项功能是否正常', 'yellow');
  log('4. 检查响应式布局是否正确', 'yellow');
  log('', 'reset');
  
  // 显示性能数据
  log('📊 部署统计:', 'cyan');
  log('', 'reset');
  log(`   📁 上传文件: ${files.length} 个`, 'reset');
  log(`   📊 总大小: ${(files.reduce((sum, file) => sum + file.size, 0) / 1024 / 1024).toFixed(2)}MB`, 'reset');
  log(`   ⏱️  部署耗时: ${(steps.reduce((sum, step) => sum + step.delay, 0) / 1000).toFixed(1)}秒`, 'reset');
  log(`   💰 预估成本: ~20元/月`, 'reset');
  log('', 'reset');
  
  log('🎯 下一步:', 'cyan');
  log('1. 配置CDN加速域名', 'yellow');
  log('2. 申请HTTPS证书', 'yellow');
  log('3. 绑定自定义域名', 'yellow');
  log('4. 设置访问监控', 'yellow');
  log('', 'reset');
}

function getAllFiles(dir, baseDir = dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getAllFiles(fullPath, baseDir));
    } else {
      files.push({
        path: fullPath,
        size: stat.size
      });
    }
  }
  
  return files;
}

function showConfigGuide() {
  log('🔑 配置指南:', 'cyan');
  log('', 'reset');
  
  log('1. 访问阿里云RAM控制台:', 'blue');
  log('   https://ram.console.aliyun.com/users', 'yellow');
  log('', 'reset');
  
  log('2. 创建RAM用户:', 'blue');
  log('   用户名: timesheet-deploy', 'yellow');
  log('   访问方式: 编程访问', 'yellow');
  log('   权限: AliyunOSSFullAccess', 'yellow');
  log('', 'reset');
  
  log('3. 创建AccessKey并复制到 .env 文件:', 'blue');
  log('   ALIYUN_ACCESS_KEY_ID=你的AccessKey_ID', 'yellow');
  log('   ALIYUN_ACCESS_KEY_SECRET=你的AccessKey_Secret', 'yellow');
  log('', 'reset');
  
  log('4. 创建OSS存储桶:', 'blue');
  log('   https://oss.console.aliyun.com/bucket', 'yellow');
  log('   存储桶名称: timesheet-mobile-app', 'yellow');
  log('   读写权限: 公共读', 'yellow');
  log('', 'reset');
  
  log('📖 详细指南: 查看 DEPLOY_NOW.md', 'cyan');
}

// 运行演示
if (require.main === module) {
  simulateDeployment().catch(console.error);
}

module.exports = simulateDeployment;