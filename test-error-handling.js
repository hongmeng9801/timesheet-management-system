// 测试错误处理功能
// 在浏览器控制台中运行此脚本来测试toast错误提示

console.log('=== 开始测试错误处理功能 ===');

// 测试toast是否可用
if (typeof toast !== 'undefined') {
  console.log('✅ toast对象可用');
  
  // 测试基本toast功能
  setTimeout(() => {
    toast.error('测试错误提示：没有找到合适的接收人');
    console.log('✅ 已发送测试错误提示');
  }, 1000);
  
  setTimeout(() => {
    toast.success('测试成功提示：功能正常');
    console.log('✅ 已发送测试成功提示');
  }, 2000);
  
  setTimeout(() => {
    toast.warning('测试警告提示：请注意');
    console.log('✅ 已发送测试警告提示');
  }, 3000);
  
} else {
  console.error('❌ toast对象不可用，请检查sonner是否正确导入');
}

// 检查Toaster组件是否存在
const toasterElements = document.querySelectorAll('[data-sonner-toaster]');
if (toasterElements.length > 0) {
  console.log('✅ 找到Toaster组件:', toasterElements.length, '个');
} else {
  console.error('❌ 未找到Toaster组件，toast可能无法显示');
}

console.log('=== 测试完成 ===');
console.log('请观察页面右上角是否出现toast提示');
console.log('如果没有看到提示，请检查：');
console.log('1. Toaster组件是否正确配置');
console.log('2. sonner样式是否正确加载');
console.log('3. 浏览器控制台是否有错误信息');