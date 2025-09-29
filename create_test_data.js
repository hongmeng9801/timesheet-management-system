// 创建测试数据来验证段长更改生产线时的数据转移功能
import { createClient } from '@supabase/supabase-js'

// 配置 Supabase 客户端
const supabaseUrl = 'https://agesdprmugyybtqrvqks.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnZXNkcHJtdWd5eWJ0cXJ2cWtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNDY0OTIsImV4cCI6MjA3MDcyMjQ5Mn0.bfo_xb818yMd7-u6cJhDoJrqmDwcGY1nBDJIesFSfWk'
const supabase = createClient(supabaseUrl, supabaseKey)

async function createTestData() {
  console.log('开始创建测试数据...')
  
  try {
    // 1. 查找段长和员工
    console.log('\n1. 查找段长和员工...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select(`
        id, name, production_line, company_id, role_id,
        role:role_id(id, name)
      `)
      .eq('is_active', true)
    
    if (usersError) {
      console.error('查找用户失败:', usersError)
      return
    }
    
    const sectionChief = users.find(user => user.role && user.role.name === '段长' && user.production_line === '一线')
    const supervisor = users.find(user => user.role && user.role.name === '班长' && user.production_line === '一线')
    // 如果没有员工，使用班长作为员工来创建测试数据
    const employee = users.find(user => user.role && user.role.name === '员工' && user.production_line === '一线') || supervisor
    
    if (!sectionChief || !employee || !supervisor) {
      console.log('缺少必要的用户角色:')
      console.log('段长:', sectionChief ? '✓' : '✗')
      console.log('员工/班长:', employee ? '✓' : '✗')
      console.log('班长:', supervisor ? '✓' : '✗')
      return
    }
    
    console.log('找到用户:')
    console.log('段长:', sectionChief.name)
    console.log('员工:', employee.name, employee === supervisor ? '(使用班长作为员工)' : '')
    console.log('班长:', supervisor.name)
    
    // 2. 查找工艺流程
    console.log('\n2. 查找工艺流程...')
    const { data: processes, error: processError } = await supabase
      .from('processes')
      .select('id, product_name, product_process, production_line')
      .eq('company_id', sectionChief.company_id)
      .eq('production_line', '一线')
      .eq('is_active', true)
      .limit(1)
    
    if (processError || !processes || processes.length === 0) {
      console.error('查找工艺流程失败:', processError)
      return
    }
    
    const process = processes[0]
    console.log('找到工艺流程:', `${process.product_name} - ${process.product_process}`)
    
    // 3. 创建工时记录
    console.log('\n3. 创建工时记录...')
    const today = new Date().toISOString().split('T')[0]
    
    const timesheetData = {
      user_id: employee.id,
      user_name: employee.name,
      work_date: today,
      shift_type: '白班',
      status: 'approved', // 已通过班长审核，等待段长审核
      total_hours: 8,
      total_amount: 0,
      supervisor_id: supervisor.id,
      supervisor_name: supervisor.name,
      section_chief_id: sectionChief.id,
      section_chief_name: sectionChief.name,
      submitted_at: new Date().toISOString(),
      approved_at: new Date().toISOString()
    }
    
    const { data: newRecord, error: recordError } = await supabase
      .from('timesheet_records')
      .insert(timesheetData)
      .select()
    
    if (recordError) {
      console.error('创建工时记录失败:', recordError)
      return
    }
    
    console.log('创建工时记录成功:', newRecord[0].id)
    
    // 4. 创建审批历史记录
    console.log('\n4. 创建审批历史记录...')
    const historyData = {
      timesheet_record_id: newRecord[0].id,
      approver_id: supervisor.id,
      approver_name: supervisor.name,
      action: 'approved',
      comment: '班长审核通过',
      approver_type: 'supervisor',
      created_at: new Date().toISOString()
    }
    
    const { error: historyError } = await supabase
      .from('approval_history')
      .insert(historyData)
    
    if (historyError) {
      console.error('创建审批历史失败:', historyError)
      return
    }
    
    console.log('创建审批历史成功')
    
    console.log('\n✅ 测试数据创建完成！')
    console.log('现在可以测试段长更改生产线时的数据转移功能：')
    console.log(`1. 段长 "${sectionChief.name}" 有1条待审核记录`)
    console.log('2. 在用户管理页面更改该段长的生产线')
    console.log('3. 系统应该检测到待转移记录并提示选择接收人')
    
  } catch (error) {
    console.error('创建测试数据时发生错误:', error)
  }
}

// 运行创建测试数据
createTestData()
  .then(() => {
    console.log('\n操作完成')
    process.exit(0)
  })
  .catch((error) => {
    console.error('操作失败:', error)
    process.exit(1)
  })