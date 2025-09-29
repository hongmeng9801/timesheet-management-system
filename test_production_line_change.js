// 测试段长更改生产线时的数据转移功能
import { createClient } from '@supabase/supabase-js'

// 配置 Supabase 客户端
const supabaseUrl = 'https://agesdprmugyybtqrvqks.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnZXNkcHJtdWd5eWJ0cXJ2cWtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNDY0OTIsImV4cCI6MjA3MDcyMjQ5Mn0.bfo_xb818yMd7-u6cJhDoJrqmDwcGY1nBDJIesFSfWk'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testProductionLineChange() {
  console.log('开始测试段长更改生产线时的数据转移功能...')
  
  try {
    // 1. 查找一个段长用户
    console.log('\n1. 查找段长用户...')
    const { data: sectionChiefs, error: sectionChiefError } = await supabase
      .from('users')
      .select(`
        id, name, production_line, company_id, role_id,
        role:role_id(id, name),
        company:company_id(id, name)
      `)
      .eq('is_active', true)
      .limit(10)
    
    if (sectionChiefError) {
      console.error('查找段长失败:', sectionChiefError)
      return
    }
    
    if (!sectionChiefs || sectionChiefs.length === 0) {
      console.log('没有找到用户，测试结束')
      return
    }
    
    // 筛选段长用户
    const sectionChief = sectionChiefs.find(user => user.role && user.role.name === '段长')
    if (!sectionChief) {
      console.log('没有找到段长用户，测试结束')
      return
    }
    
    console.log('找到段长:', sectionChief.name, '生产线:', sectionChief.production_line)
    
    // 2. 查找该段长负责的待审核工时记录
    console.log('\n2. 查找该段长负责的待审核工时记录...')
    const { data: pendingRecords, error: recordsError } = await supabase
      .from('timesheet_records')
      .select(`
        id, status, created_at,
        user:user_id(id, name),
        supervisor:supervisor_id(id, name),
        section_chief:section_chief_id(id, name)
      `)
      .eq('section_chief_id', sectionChief.id)
      .eq('status', 'approved')
      .limit(5)
    
    if (recordsError) {
      console.error('查找待审核记录失败:', recordsError)
      return
    }
    
    console.log(`找到 ${pendingRecords?.length || 0} 条该段长负责的已审核记录`)
    if (pendingRecords && pendingRecords.length > 0) {
      pendingRecords.forEach((record, index) => {
        console.log(`  记录${index + 1}: ID=${record.id}, 状态=${record.status}, 员工=${record.user?.name}`)
      })
    }
    
    // 3. 查找原生产线的其他段长
    console.log('\n3. 查找原生产线的其他段长...')
    const { data: allUsers, error: otherError } = await supabase
      .from('users')
      .select(`
        id, name, production_line, role_id,
        role:role_id(id, name)
      `)
      .eq('company_id', sectionChief.company_id)
      .eq('production_line', sectionChief.production_line)
      .eq('is_active', true)
      .neq('id', sectionChief.id)
    
    const otherSectionChiefs = allUsers?.filter(user => user.role && user.role.name === '段长') || []
    
    if (otherError) {
      console.error('查找其他段长失败:', otherError)
      return
    }
    
    console.log(`原生产线(${sectionChief.production_line})的其他段长数量: ${otherSectionChiefs?.length || 0}`)
    if (otherSectionChiefs && otherSectionChiefs.length > 0) {
      otherSectionChiefs.forEach((chief, index) => {
        console.log(`  段长${index + 1}: ${chief.name} (ID: ${chief.id})`)
      })
    }
    
    // 4. 查找可用的其他生产线
    console.log('\n4. 查找可用的其他生产线...')
    const { data: productionLines, error: linesError } = await supabase
      .from('processes')
      .select('production_line')
      .eq('company_id', sectionChief.company_id)
      .not('production_line', 'is', null)
      .neq('production_line', sectionChief.production_line)
    
    if (linesError) {
      console.error('查找生产线失败:', linesError)
      return
    }
    
    const uniqueLines = [...new Set(productionLines?.map(item => item.production_line).filter(Boolean) || [])]
    console.log('可用的其他生产线:', uniqueLines)
    
    // 5. 检查审批历史记录
    console.log('\n5. 检查现有的审批历史记录...')
    if (pendingRecords && pendingRecords.length > 0) {
      for (const record of pendingRecords.slice(0, 2)) { // 只检查前2条记录
        const { data: history, error: historyError } = await supabase
          .from('approval_history')
          .select('*')
          .eq('timesheet_record_id', record.id)
          .order('created_at', { ascending: false })
        
        if (historyError) {
          console.error(`查找记录${record.id}的审批历史失败:`, historyError)
        } else {
          console.log(`记录${record.id}的审批历史数量: ${history?.length || 0}`)
          if (history && history.length > 0) {
            history.forEach((h, index) => {
              console.log(`  历史${index + 1}: ${h.action} by ${h.approver_name} - ${h.comment}`)
            })
          }
        }
      }
    }
    
    console.log('\n测试总结:')
    console.log('- 段长信息: ✓')
    console.log(`- 待转移记录数量: ${pendingRecords?.length || 0}`)
    console.log(`- 原生产线其他段长数量: ${otherSectionChiefs?.length || 0}`)
    console.log(`- 可选的其他生产线数量: ${uniqueLines.length}`)
    
    if (pendingRecords && pendingRecords.length > 0 && otherSectionChiefs && otherSectionChiefs.length > 0) {
      console.log('\n✅ 数据转移条件满足，可以测试生产线变更功能')
      console.log('建议操作:')
      console.log(`1. 在用户管理页面找到段长 "${sectionChief.name}"`)
      console.log(`2. 编辑该用户，将生产线从 "${sectionChief.production_line}" 改为其他生产线`)
      console.log(`3. 系统应该检测到 ${pendingRecords.length} 条待转移记录`)
      console.log(`4. 选择接收人: ${otherSectionChiefs[0].name}`)
      console.log('5. 确认变更，检查数据是否正确转移')
    } else if (pendingRecords && pendingRecords.length > 0) {
      console.log('\n⚠️  有待转移记录，但原生产线没有其他段长，无法测试数据转移')
    } else {
      console.log('\n✅ 没有待转移记录，可以测试无数据转移的生产线变更')
    }
    
  } catch (error) {
    console.error('测试过程中发生错误:', error)
  }
}

// 运行测试
testProductionLineChange()
  .then(() => {
    console.log('\n测试完成')
    process.exit(0)
  })
  .catch((error) => {
    console.error('测试失败:', error)
    process.exit(1)
  })