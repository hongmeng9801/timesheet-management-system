// 测试用户删除权限
import { createClient } from '@supabase/supabase-js'

// Supabase配置
const supabaseUrl = 'https://agesdprmugyybtqrvqks.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnZXNkcHJtdWd5eWJ0cXJ2cWtzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE0NjQ5MiwiZXhwIjoyMDcwNzIyNDkyfQ.cCu0uLbJFNBa4qcNLhkM-nI4ZiDpCsyxCZ52OioJJdw'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testDeletePermission() {
  try {
    console.log('测试用户删除权限...')
    
    // 首先查询所有用户
    const { data: users, error: selectError } = await supabase
      .from('users')
      .select('id, name, phone')
      .limit(5)
    
    if (selectError) {
      console.error('查询用户失败:', selectError)
      return
    }
    
    console.log('当前用户列表:', users)
    
    // 测试删除权限（不实际删除，只测试权限）
    const { data, error } = await supabase
      .from('users')
      .delete()
      .eq('id', '00000000-0000-0000-0000-000000000000') // 使用不存在的ID
      .select()
    
    if (error) {
      if (error.code === '42501') {
        console.error('权限错误 - 没有删除权限:', error.message)
      } else if (error.code === '23503') {
        console.log('外键约束错误（正常）:', error.message)
      } else {
        console.error('其他错误:', error)
      }
    } else {
      console.log('删除权限测试通过（没有找到要删除的记录）')
    }
    
  } catch (error) {
    console.error('测试失败:', error)
  }
}

testDeletePermission()
