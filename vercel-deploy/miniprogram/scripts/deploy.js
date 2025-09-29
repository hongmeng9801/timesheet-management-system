/**
 * 微信小程序自动化部署脚本
 * 支持开发版、体验版和正式版的自动化部署
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// 配置信息
const CONFIG = {
  // 项目路径
  projectPath: path.resolve(__dirname, '../'),
  
  // 微信开发者工具路径（需要根据实际安装路径修改）
  cliPath: {
    windows: 'C:\\Program Files (x86)\\Tencent\\微信web开发者工具\\cli.bat',
    mac: '/Applications/wechatwebdevtools.app/Contents/MacOS/cli',
    linux: '/usr/local/bin/wechat_devtools_cli'
  },
  
  // 部署配置
  deploy: {
    // 开发版配置
    dev: {
      version: '1.0.0-dev',
      desc: '开发版本',
      setting: {
        es6: true,
        minify: false,
        codeProtect: false,
        autoPrefixWXSS: true
      }
    },
    
    // 体验版配置
    preview: {
      version: '1.0.0-preview',
      desc: '体验版本',
      setting: {
        es6: true,
        minify: true,
        codeProtect: false,
        autoPrefixWXSS: true
      }
    },
    
    // 正式版配置
    release: {
      version: '1.0.0',
      desc: '正式版本',
      setting: {
        es6: true,
        minify: true,
        codeProtect: true,
        autoPrefixWXSS: true
      }
    }
  }
}

class MiniprogramDeploy {
  constructor() {
    this.platform = this.getPlatform()
    this.cliPath = CONFIG.cliPath[this.platform]
    this.projectPath = CONFIG.projectPath
  }

  /**
   * 获取当前平台
   */
  getPlatform() {
    const platform = process.platform
    if (platform === 'win32') return 'windows'
    if (platform === 'darwin') return 'mac'
    return 'linux'
  }

  /**
   * 检查微信开发者工具CLI是否可用
   */
  checkCli() {
    try {
      if (!fs.existsSync(this.cliPath)) {
        throw new Error(`微信开发者工具CLI不存在: ${this.cliPath}`)
      }
      
      // 测试CLI是否可用
      execSync(`"${this.cliPath}" --version`, { stdio: 'pipe' })
      console.log('✅ 微信开发者工具CLI检查通过')
      return true
    } catch (error) {
      console.error('❌ 微信开发者工具CLI检查失败:', error.message)
      console.log('请确保：')
      console.log('1. 已安装微信开发者工具')
      console.log('2. 已开启服务端口（设置 → 安全设置 → 服务端口）')
      console.log('3. CLI路径配置正确')
      return false
    }
  }

  /**
   * 检查项目配置
   */
  checkProject() {
    try {
      const projectConfigPath = path.join(this.projectPath, 'project.config.json')
      if (!fs.existsSync(projectConfigPath)) {
        throw new Error('project.config.json 文件不存在')
      }
      
      const projectConfig = JSON.parse(fs.readFileSync(projectConfigPath, 'utf8'))
      if (!projectConfig.appid || projectConfig.appid === 'touristappid') {
        throw new Error('请先配置正确的AppID')
      }
      
      console.log('✅ 项目配置检查通过')
      console.log(`   AppID: ${projectConfig.appid}`)
      console.log(`   项目名称: ${projectConfig.projectname}`)
      return true
    } catch (error) {
      console.error('❌ 项目配置检查失败:', error.message)
      return false
    }
  }

  /**
   * 构建项目
   */
  async build(env = 'dev') {
    console.log(`🔨 开始构建 ${env} 环境...`)
    
    try {
      // 这里可以添加构建逻辑，比如：
      // - 环境变量替换
      // - 代码压缩
      // - 资源优化
      
      // 更新版本信息
      this.updateVersion(env)
      
      console.log('✅ 项目构建完成')
      return true
    } catch (error) {
      console.error('❌ 项目构建失败:', error.message)
      return false
    }
  }

  /**
   * 更新版本信息
   */
  updateVersion(env) {
    const config = CONFIG.deploy[env]
    const packagePath = path.join(this.projectPath, 'package.json')
    
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
      packageJson.version = config.version
      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2))
      console.log(`   版本号更新为: ${config.version}`)
    }
  }

  /**
   * 上传代码到微信后台
   */
  async upload(env = 'dev') {
    console.log(`📤 开始上传 ${env} 版本...`)
    
    const config = CONFIG.deploy[env]
    const command = [
      `"${this.cliPath}"`,
      'upload',
      `--project "${this.projectPath}"`,
      `--version "${config.version}"`,
      `--desc "${config.desc}"`,
      `--setting "${JSON.stringify(config.setting).replace(/"/g, '\\"')}"`
    ].join(' ')
    
    try {
      console.log('执行命令:', command)
      const result = execSync(command, { 
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 300000 // 5分钟超时
      })
      
      console.log('✅ 代码上传成功')
      console.log('上传结果:', result)
      return true
    } catch (error) {
      console.error('❌ 代码上传失败:', error.message)
      if (error.stdout) console.log('输出:', error.stdout)
      if (error.stderr) console.error('错误:', error.stderr)
      return false
    }
  }

  /**
   * 生成预览二维码
   */
  async preview(env = 'dev') {
    console.log(`📱 生成 ${env} 版本预览二维码...`)
    
    const config = CONFIG.deploy[env]
    const qrcodePath = path.join(this.projectPath, 'qrcode.jpg')
    
    const command = [
      `"${this.cliPath}"`,
      'preview',
      `--project "${this.projectPath}"`,
      `--version "${config.version}"`,
      `--desc "${config.desc}"`,
      `--qr-output "${qrcodePath}"`,
      `--setting "${JSON.stringify(config.setting).replace(/"/g, '\\"')}"`
    ].join(' ')
    
    try {
      console.log('执行命令:', command)
      const result = execSync(command, { 
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 300000
      })
      
      console.log('✅ 预览二维码生成成功')
      console.log(`   二维码保存位置: ${qrcodePath}`)
      console.log('预览结果:', result)
      return true
    } catch (error) {
      console.error('❌ 预览二维码生成失败:', error.message)
      if (error.stdout) console.log('输出:', error.stdout)
      if (error.stderr) console.error('错误:', error.stderr)
      return false
    }
  }

  /**
   * 自动化部署流程
   */
  async deploy(env = 'dev', options = {}) {
    console.log(`🚀 开始部署 ${env} 环境...`)
    console.log('=' .repeat(50))
    
    // 检查环境
    if (!this.checkCli() || !this.checkProject()) {
      process.exit(1)
    }
    
    // 构建项目
    if (!(await this.build(env))) {
      process.exit(1)
    }
    
    // 根据选项执行不同操作
    if (options.preview) {
      // 生成预览
      if (!(await this.preview(env))) {
        process.exit(1)
      }
    } else {
      // 上传代码
      if (!(await this.upload(env))) {
        process.exit(1)
      }
    }
    
    console.log('=' .repeat(50))
    console.log(`🎉 ${env} 环境部署完成！`)
    
    if (env === 'release') {
      console.log('\n📋 后续操作提醒：')
      console.log('1. 登录微信公众平台')
      console.log('2. 进入版本管理页面')
      console.log('3. 将开发版本设为体验版')
      console.log('4. 提交审核')
      console.log('5. 审核通过后发布')
    }
  }

  /**
   * 清理临时文件
   */
  cleanup() {
    const tempFiles = [
      path.join(this.projectPath, 'qrcode.jpg')
    ]
    
    tempFiles.forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file)
        console.log(`🗑️  清理临时文件: ${file}`)
      }
    })
  }
}

// 命令行参数解析
function parseArgs() {
  const args = process.argv.slice(2)
  const options = {
    env: 'dev',
    preview: false,
    cleanup: false
  }
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    switch (arg) {
      case '--env':
      case '-e':
        options.env = args[++i]
        break
      case '--preview':
      case '-p':
        options.preview = true
        break
      case '--cleanup':
      case '-c':
        options.cleanup = true
        break
      case '--help':
      case '-h':
        showHelp()
        process.exit(0)
        break
    }
  }
  
  return options
}

// 显示帮助信息
function showHelp() {
  console.log(`
微信小程序自动化部署工具

使用方法:
  node deploy.js [选项]

选项:
  -e, --env <env>     部署环境 (dev|preview|release) [默认: dev]
  -p, --preview       生成预览二维码而不是上传
  -c, --cleanup       清理临时文件
  -h, --help          显示帮助信息

示例:
  node deploy.js --env dev --preview     # 生成开发版预览二维码
  node deploy.js --env release           # 上传正式版
  node deploy.js --cleanup               # 清理临时文件
`)
}

// 主函数
async function main() {
  const options = parseArgs()
  const deploy = new MiniprogramDeploy()
  
  try {
    if (options.cleanup) {
      deploy.cleanup()
      return
    }
    
    await deploy.deploy(options.env, options)
  } catch (error) {
    console.error('❌ 部署失败:', error.message)
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main()
}

module.exports = MiniprogramDeploy