import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = 'https://agesdprmugyybtqrvqks.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnZXNkcHJtdWd5eWJ0cXJ2cWtzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE0NjQ5MiwiZXhwIjoyMDcwNzIyNDkyfQ.cCu0uLbJFNBa4qcNLhkM-nI4ZiDpCsyxCZ52OioJJdw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTriggers() {
  console.log('🔍 检查数据库触发器和函数...');
  
  try {
    // 1. 检查现有的数据库函数
    console.log('\n📋 检查已知的数据库函数...');
    
    // 测试 update_user_names_before_delete 函数是否存在
    const { data: testFunc, error: testFuncError } = await supabase
      .rpc('update_user_names_before_delete', { user_id_to_delete: '00000000-0000-0000-0000-000000000000' });
    
    if (testFuncError) {
      if (testFuncError.message.includes('function') && testFuncError.message.includes('does not exist')) {
        console.log('❌ update_user_names_before_delete 函数不存在');
      } else {
        console.log('✅ update_user_names_before_delete 函数存在');
      }
    } else {
      console.log('✅ update_user_names_before_delete 函数存在且可调用');
    }
    
    // 2. 检查是否存在自动填充INSERT触发器的函数
    console.log('\n📋 测试可能的自动填充函数...');
    
    const possibleFunctions = [
      'fill_user_names_on_insert',
      'auto_fill_names',
      'populate_user_names',
      'set_user_names_trigger'
    ];
    
    for (const funcName of possibleFunctions) {
      try {
        const { error } = await supabase.rpc(funcName);
        if (error && error.message.includes('does not exist')) {
          console.log(`❌ ${funcName} 函数不存在`);
        } else {
          console.log(`✅ ${funcName} 函数存在`);
        }
      } catch (e) {
        console.log(`❌ ${funcName} 函数不存在或无法调用`);
      }
    }
    
    // 4. 尝试手动测试自动填充
    console.log('\n🧪 测试手动创建工时记录...');
    
    // 先获取一个现有用户
    const { data: testUser, error: userError } = await supabase
      .from('users')
      .select('id, name')
      .limit(1)
      .single();
    
    if (userError || !testUser) {
      console.log('❌ 无法获取测试用户:', userError?.message);
      return;
    }
    
    console.log(`👤 使用测试用户: ${testUser.name} (${testUser.id})`);
    
    // 创建测试工时记录
    const { data: testRecord, error: recordError } = await supabase
      .from('timesheet_records')
      .insert({
        user_id: testUser.id,
        supervisor_id: testUser.id,
        section_chief_id: testUser.id,
        work_date: '2024-01-20',
        shift_type: '白班',
        status: 'pending',
        total_hours: 8,
        total_amount: 200
      })
      .select()
      .single();
    
    if (recordError) {
      console.log('❌ 创建测试记录失败:', recordError.message);
    } else {
      console.log('✅ 测试记录创建成功:');
      console.log(`  - user_name: ${testRecord.user_name}`);
      console.log(`  - supervisor_name: ${testRecord.supervisor_name}`);
      console.log(`  - section_chief_name: ${testRecord.section_chief_name}`);
      
      // 清理测试记录
      await supabase.from('timesheet_records').delete().eq('id', testRecord.id);
      console.log('🧹 测试记录已清理');
    }
    
  } catch (error) {
    console.error('❌ 检查过程中发生错误:', error);
  }
}

checkTriggers();