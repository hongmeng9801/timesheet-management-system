import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://agesdprmugyybtqrvqks.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnZXNkcHJtdWd5eWJ0cXJ2cWtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNDY0OTIsImV4cCI6MjA3MDcyMjQ5Mn0.bfo_xb818yMd7-u6cJhDoJrqmDwcGY1nBDJIesFSfWk'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkUsers() {
  console.log('检查现有用户数据...')
  
  try {
    // 查看所有用户
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        id, name, production_line, role_id,
        role:role_id(id, name)
      `)
      .eq('is_active', true)
    
    if (error) {
      console.error('查询用户失败:', error)
      return
    }
    
    console.log('\n所有活跃用户:')
    users.forEach(user => {
      console.log(`  - ${user.name} | 生产线: ${user.production_line} | 角色: ${user.role?.name || '未知'} | 角色ID: ${user.role_id}`)
    })
    
    // 按角色分组
    const roleGroups = {}
    users.forEach(user => {
      const roleName = user.role?.name || '未知角色'
      if (!roleGroups[roleName]) {
        roleGroups[roleName] = []
      }
      roleGroups[roleName].push(user)
    })
    
    console.log('\n按角色分组:')
    Object.keys(roleGroups).forEach(roleName => {
      console.log(`\n${roleName}:`)
      roleGroups[roleName].forEach(user => {
        console.log(`  - ${user.name} (生产线: ${user.production_line})`)
      })
    })
    
    // 按生产线分组
    const lineGroups = {}
    users.forEach(user => {
      const line = user.production_line || '未分配'
      if (!lineGroups[line]) {
        lineGroups[line] = []
      }
      lineGroups[line].push(user)
    })
    
    console.log('\n按生产线分组:')
    Object.keys(lineGroups).forEach(line => {
      console.log(`\n${line}:`)
      lineGroups[line].forEach(user => {
        console.log(`  - ${user.name} (${user.role?.name || '未知角色'})`)
      })
    })
    
  } catch (error) {
    console.error('操作失败:', error)
  }
}

checkUsers()
  .then(() => console.log('\n检查完成'))
  .catch(console.error)