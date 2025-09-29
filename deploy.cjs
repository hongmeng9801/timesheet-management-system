#!/usr/bin/env node

/**
 * 工时管理系统 - 一键云端部署脚本
 * 支持阿里云OSS和腾讯云COS部署
 */

const fs = require('fs');
const { execSync } = require('child_process');

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

function showBanner() {
  log('', 'reset');
  log('🚀 ===============================================', 'cyan');
  log('🚀    工时管理系统 - 云端部署工具', 'cyan');
  log('🚀 ===============================================', 'cyan');
  log('', 'reset');
}

function showMenu() {
  log('📋 请选择部署平台：', 'cyan');
  log('', 'reset');
  log('1️⃣  阿里云OSS + CDN (推荐)', 'green');
  log('   ✅ 国内访问速度快', 'green');
  log('   ✅ 移动网络优化好', 'green');
  log('   💰 约20元/月', 'green');
  log('', 'reset');
  
  log('2️⃣  腾讯云COS + CDN', 'blue');
  log('   ✅ 价格便宜', 'blue');
  log('   ✅ 功能完善', 'blue');
  log('   💰 约15元/月', 'blue');
  log('', 'reset');
  
  log('3️⃣  查看部署指南', 'yellow');
  log('4️⃣  检查项目状态', 'yellow');
  log('5️⃣  退出', 'yellow');
  log('', 'reset');
}

function checkProjectStatus() {
  log('🔍 检查项目状态...', 'blue');
  log('', 'reset');
  
  // 检查构建文件
  if (fs.existsSync('./dist')) {
    log('✅ 构建文件存在 (dist/)', 'green');
    
    // 统计文件
    const files = getAllFiles('./dist');
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    log(`   📁 文件数量: ${files.length}`, 'reset');
    log(`   📊 总大小: ${(totalSize / 1024 / 1024).toFixed(2)}MB`, 'reset');
  } else {
    log('❌ 构建文件不存在', 'red');
    log('   请先运行: npm run build', 'yellow');
  }
  
  // 检查依赖
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  const hasAliOss = packageJson.devDependencies?.['ali-oss'];
  const hasTencentCos = packageJson.devDependencies?.['cos-nodejs-sdk-v5'];
  
  log('', 'reset');
  log('📦 部署依赖:', 'blue');
  log(`   阿里云OSS: ${hasAliOss ? '✅ 已安装' : '❌ 未安装'}`, hasAliOss ? 'green' : 'red');
  log(`   腾讯云COS: ${hasTencentCos ? '✅ 已安装' : '❌ 未安装'}`, hasTencentCos ? 'green' : 'red');
  
  // 检查配置文件
  log('', 'reset');
  log('🔧 配置文件:', 'blue');
  log(`   .env: ${fs.existsSync('./.env') ? '✅ 存在' : '❌ 不存在'}`, fs.existsSync('./.env') ? 'green' : 'red');
  log(`   .env.deploy: ${fs.existsSync('./.env.deploy') ? '✅ 存在' : '❌ 不存在'}`, fs.existsSync('./.env.deploy') ? 'green' : 'red');
  
  if (!fs.existsSync('./.env') && fs.existsSync('./.env.deploy')) {
    log('', 'reset');
    log('💡 提示: 请复制 .env.deploy 为 .env 并配置密钥', 'yellow');
  }
}

function getAllFiles(dir, baseDir = dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = `${dir}/${item}`;
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

function showDeployGuide() {
  log('📖 部署指南', 'cyan');
  log('', 'reset');
  
  log('🔧 部署前准备:', 'blue');
  log('1. 确保项目已构建: npm run build', 'yellow');
  log('2. 注册云服务账号 (阿里云/腾讯云)', 'yellow');
  log('3. 创建存储桶并获取访问密钥', 'yellow');
  log('4. 配置 .env 文件中的密钥信息', 'yellow');
  log('', 'reset');
  
  log('📋 详细步骤:', 'blue');
  log('• 阿里云部署: 查看 QUICK_DEPLOY_CLOUD.md', 'yellow');
  log('• 腾讯云部署: 查看 deploy-to-tencent.md', 'yellow');
  log('• 通用指南: 查看 DEPLOYMENT_GUIDE.md', 'yellow');
  log('', 'reset');
  
  log('🌐 部署后访问地址:', 'blue');
  log('• OSS直链: https://bucket-name.region.aliyuncs.com/', 'yellow');
  log('• CDN加速: https://your-domain.com/', 'yellow');
  log('', 'reset');
}

function deployToAliyun() {
  log('🚀 开始部署到阿里云OSS...', 'cyan');
  log('', 'reset');
  
  try {
    // 检查依赖
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    if (!packageJson.devDependencies?.['ali-oss']) {
      log('📦 安装阿里云OSS依赖...', 'blue');
      execSync('npm install ali-oss --save-dev', { stdio: 'inherit' });
    }
    
    // 执行部署
    log('📤 执行部署脚本...', 'blue');
    execSync('node deploy-aliyun-auto.js', { stdio: 'inherit' });
    
  } catch (error) {
    log('', 'reset');
    log('❌ 部署失败:', 'red');
    log(error.message, 'red');
    log('', 'reset');
    log('💡 请检查:', 'yellow');
    log('1. .env 文件是否配置正确', 'yellow');
    log('2. 阿里云AccessKey是否有效', 'yellow');
    log('3. OSS存储桶是否已创建', 'yellow');
  }
}

function deployToTencent() {
  log('🚀 开始部署到腾讯云COS...', 'cyan');
  log('', 'reset');
  
  try {
    // 检查依赖
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    if (!packageJson.devDependencies?.['cos-nodejs-sdk-v5']) {
      log('📦 安装腾讯云COS依赖...', 'blue');
      execSync('npm install cos-nodejs-sdk-v5 --save-dev', { stdio: 'inherit' });
    }
    
    // 执行部署
    log('📤 执行部署脚本...', 'blue');
    execSync('node deploy-tencent-auto.js', { stdio: 'inherit' });
    
  } catch (error) {
    log('', 'reset');
    log('❌ 部署失败:', 'red');
    log(error.message, 'red');
    log('', 'reset');
    log('💡 请检查:', 'yellow');
    log('1. .env 文件是否配置正确', 'yellow');
    log('2. 腾讯云密钥是否有效', 'yellow');
    log('3. COS存储桶是否已创建', 'yellow');
  }
}

async function main() {
  showBanner();
  
  // 获取命令行参数
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    const command = args[0];
    
    switch (command) {
      case 'aliyun':
      case '1':
        deployToAliyun();
        return;
      case 'tencent':
      case '2':
        deployToTencent();
        return;
      case 'status':
      case '4':
        checkProjectStatus();
        return;
      case 'guide':
      case '3':
        showDeployGuide();
        return;
      default:
        log('❌ 未知命令，请使用: node deploy.js [aliyun|tencent|status|guide]', 'red');
        return;
    }
  }
  
  // 交互式菜单
  showMenu();
  
  // 简化版本，直接显示选项说明
  log('💡 使用方法:', 'cyan');
  log('  node deploy.js aliyun   # 部署到阿里云', 'yellow');
  log('  node deploy.js tencent  # 部署到腾讯云', 'yellow');
  log('  node deploy.js status   # 检查项目状态', 'yellow');
  log('  node deploy.js guide    # 查看部署指南', 'yellow');
  log('', 'reset');
}

// 运行主程序
if (require.main === module) {
  main().catch(console.error);
}

module.exports = main;