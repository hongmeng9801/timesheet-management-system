import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ixqjqjqjqjqjqjqjqjqj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4cWpxanFqcWpxanFqcWpxanFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI2MDQ4MDAsImV4cCI6MjA0ODE4MDgwMH0.Uy8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'
const supabase = createClient(supabaseUrl, supabaseKey)

async function createAdditionalSupervisor() {
  console.log('开始创建额外的段长用户...')
  
  try {
    // 1. 查找现有段长用户获取角色ID
    const { data: existingSupervisor } = await supabase
      .from('users')
      .select(`
        id, name, role_id, company_id,
        role:role_id(id, name)
      `)
      .eq('production_line', '一线')
      .limit(1)
      .single()
    
    if (!existingSupervisor) {
      console.log('❌ 未找到现有段长用户')
      return
    }
    
    console.log('找到现有段长:', existingSupervisor.name, '角色ID:', existingSupervisor.role_id)
    
    // 2. 创建新的段长用户
    const newSupervisorData = {
      name: '测试段长2',
      username: 'test_supervisor_2',
      password: 'password123',
      role_id: existingSupervisor.role_id,
      company_id: existingSupervisor.company_id,
      production_line: '一线', // 与现有段长同一生产线
      is_active: true
    }
    
    console.log('准备创建段长，公司ID:', existingSupervisor.company_id)
    
    const { data: newSupervisor, error: createError } = await supabase
      .from('users')
      .insert(newSupervisorData)
      .select()
      .single()
    
    if (createError) {
      console.log('创建段长失败:', createError)
      return
    }
    
    console.log('✅ 创建段长成功:', newSupervisor.name, 'ID:', newSupervisor.id)
    
    // 3. 验证创建结果
    const { data: verification } = await supabase
      .from('users')
      .select('id, name, production_line')
      .eq('production_line', '一线')
      .eq('role_id', existingSupervisor.role_id)
    
    console.log('\n一线的段长用户:')
    verification.forEach(user => {
      console.log(`  - ${user.name} (${user.id})`)
    })
    
    console.log('\n✅ 现在可以测试段长更改生产线时的数据转移功能了！')
    
  } catch (error) {
    console.error('操作失败:', error)
  }
}

createAdditionalSupervisor()
  .then(() => console.log('操作完成'))
  .catch(console.error)