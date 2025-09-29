// 测试段长更改生产线时的数据转移功能修复
import { createClient } from '@supabase/supabase-js'

// 配置 Supabase 客户端
const supabaseUrl = 'https://ztjppwjhntdsqzqkqxqy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0anBwd2pobnRkc3F6cWtxeHF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYxMzE1NzcsImV4cCI6MjA0MTcwNzU3N30.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testProductionLineChangeFix() {
  console.log('开始测试段长更改生产线时的数据转移功能修复...')
  
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
    
    if (sectionChiefError) {
      console.error('查询段长失败:', sectionChiefError)
      return
    }
    
    const sectionChief = sectionChiefs?.find(user => user.role?.name === '段长')
    if (!sectionChief) {
      console.log('未找到段长用户')
      return
    }
    
    console.log(`找到段长: ${sectionChief.name}, 生产线: ${sectionChief.production_line}, 公司: ${sectionChief.company?.name}`)
    
    // 2. 查找该段长的待审核记录
    console.log('\n2. 查找该段长的待审核记录...')
    const { data: pendingRecords, error: pendingError } = await supabase
      .from('timesheet_records')
      .select(`
        id, user_id, status, work_date, section_chief_id,
        user:users!user_id(id, name, is_active)
      `)
      .eq('section_chief_id', sectionChief.id)
      .eq('status', 'approved')
    
    if (pendingError) {
      console.error('查询待审核记录失败:', pendingError)
      return
    }
    
    console.log(`找到 ${pendingRecords?.length || 0} 条待审核记录`)
    if (pendingRecords && pendingRecords.length > 0) {
      pendingRecords.forEach((record, index) => {
        console.log(`  记录${index + 1}: 用户=${record.user?.name}, 状态=${record.status}, 日期=${record.work_date}`)
      })
    }
    
    // 3. 查找原生产线的其他段长
    console.log('\n3. 查找原生产线的其他段长...')
    const { data: otherSectionChiefs, error: otherError } = await supabase
      .from('users')
      .select('id, name, phone')
      .eq('company_id', sectionChief.company_id)
      .eq('production_line', sectionChief.production_line)
      .eq('role_id', sectionChief.role_id)
      .eq('is_active', true)
      .neq('id', sectionChief.id)
    
    if (otherError) {
      console.error('查询其他段长失败:', otherError)
      return
    }
    
    console.log(`原生产线(${sectionChief.production_line})的其他段长数量: ${otherSectionChiefs?.length || 0}`)
    if (otherSectionChiefs && otherSectionChiefs.length > 0) {
      otherSectionChiefs.forEach((chief, index) => {
        console.log(`  段长${index + 1}: ${chief.name} (${chief.phone})`)
      })
    }
    
    // 4. 查找可用的其他生产线
    console.log('\n4. 查找可用的其他生产线...')
    const { data: productionLines, error: linesError } = await supabase
      .from('processes')
      .select('production_line')
      .eq('company_id', sectionChief.company_id)
      .not('production_line', 'is', null)
    
    if (linesError) {
      console.error('查询生产线失败:', linesError)
      return
    }
    
    const uniqueLines = [...new Set(productionLines?.map(p => p.production_line).filter(Boolean))]
    const otherLines = uniqueLines.filter(line => line !== sectionChief.production_line)
    
    console.log(`可选的其他生产线: ${otherLines.join(', ')}`)
    
    // 5. 检查审批历史
    if (pendingRecords && pendingRecords.length > 0) {
      console.log('\n5. 检查现有审批历史...')
      for (const record of pendingRecords) {
        const { data: history, error: historyError } = await supabase
          .from('approval_history')
          .select('*')
          .eq('timesheet_record_id', record.id)
          .order('created_at', { ascending: false })
        
        if (historyError) {
          console.error(`查询记录 ${record.id} 的审批历史失败:`, historyError)
        } else {
          console.log(`  记录 ${record.id} 的审批历史 (${history?.length || 0} 条):`)
          if (history && history.length > 0) {
            history.forEach((h, index) => {
              console.log(`    历史${index + 1}: ${h.action} by ${h.approver_name} - ${h.comment}`)
            })
          }
        }
      }
    }
    
    console.log('\n测试总结:')
    console.log('- 段长信息: ✓')
    console.log(`- 待转移记录数量: ${pendingRecords?.length || 0}`)
    console.log(`- 原生产线其他段长数量: ${otherSectionChiefs?.length || 0}`)
    console.log(`- 可选的其他生产线数量: ${otherLines.length}`)
    
    if (pendingRecords && pendingRecords.length > 0 && otherSectionChiefs && otherSectionChiefs.length > 0) {
      console.log('\n✅ 数据转移条件满足，可以测试生产线变更功能')
      console.log('建议操作:')
      console.log(`1. 在用户管理页面找到段长 "${sectionChief.name}"`)
      console.log(`2. 编辑该用户，将生产线从 "${sectionChief.production_line}" 改为其他生产线`)
      console.log(`3. 系统应该检测到 ${pendingRecords.length} 条待审核数据需要转移`)
      console.log(`4. 选择接收人: ${otherSectionChiefs.map(c => c.name).join(' 或 ')}`)
      console.log('5. 确认转移，检查数据是否正确转移到接收人')
      console.log('6. 检查审批历史是否正确记录转移操作')
    } else {
      console.log('\n❌ 数据转移条件不满足')
      if (!pendingRecords || pendingRecords.length === 0) {
        console.log('- 没有待转移的记录')
      }
      if (!otherSectionChiefs || otherSectionChiefs.length === 0) {
        console.log('- 原生产线没有其他段长可以接收数据')
      }
    }
    
  } catch (error) {
    console.error('测试过程中发生错误:', error)
  }
}

// 运行测试
testProductionLineChangeFix()