import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  'https://agesdprmugyybtqrvqks.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnZXNkcHJtdWd5eWJ0cXJ2cWtzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE0NjQ5MiwiZXhwIjoyMDcwNzIyNDkyfQ.cCu0uLbJFNBa4qcNLhkM-nI4ZiDpCsyxCZ52OioJJdw'
);

async function analyzeAutoFillIssue() {
  console.log('🔍 分析自动填充姓名字段的问题...');
  
  try {
    // 测试手动填充姓名字段
    console.log('\n🧪 测试手动填充姓名字段...');
    
    // 获取一个测试用户ID
    const { data: testUser, error: userError } = await supabase
      .from('users')
      .select('id, name')
      .limit(1)
      .single();
    
    if (userError) {
      console.error('❌ 获取测试用户失败:', userError);
      return;
    }
    
    console.log('👤 使用测试用户:', testUser);
    
    // 创建一个工时记录，手动填充姓名字段
    const { data: newRecord, error: insertError } = await supabase
      .from('timesheet_records')
      .insert({
        user_id: testUser.id,
        supervisor_id: testUser.id,
        section_chief_id: testUser.id,
        work_date: '2024-01-16',
        shift_type: '白班',
        status: 'pending',
        total_hours: 8,
        total_amount: 200,
        user_name: testUser.name,
        supervisor_name: testUser.name,
        section_chief_name: testUser.name
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ 创建测试记录失败:', insertError);
    } else {
      console.log('✅ 手动填充姓名字段成功:', newRecord);
    }
    
    // 测试不填充姓名字段的情况
    console.log('\n🧪 测试不填充姓名字段的情况...');
    const { data: autoRecord, error: autoError } = await supabase
      .from('timesheet_records')
      .insert({
        user_id: testUser.id,
        supervisor_id: testUser.id,
        section_chief_id: testUser.id,
        work_date: '2024-01-17',
        shift_type: '白班',
        status: 'pending',
        total_hours: 8,
        total_amount: 200
        // 故意不填充姓名字段，看是否会自动填充
      })
      .select()
      .single();
    
    if (autoError) {
      console.error('❌ 创建自动填充测试记录失败:', autoError);
    } else {
      console.log('📊 自动填充测试结果:', autoRecord);
      
      if (autoRecord.user_name && autoRecord.supervisor_name && autoRecord.section_chief_name) {
        console.log('✅ 自动填充机制正常工作!');
      } else {
        console.log('❌ 自动填充机制未工作，姓名字段为空!');
        console.log('🔧 需要创建触发器来自动填充姓名字段');
      }
    }
    
    // 清理测试数据
    console.log('\n🧹 清理测试数据...');
    if (newRecord) {
      await supabase.from('timesheet_records').delete().eq('id', newRecord.id);
    }
    if (autoRecord) {
      await supabase.from('timesheet_records').delete().eq('id', autoRecord.id);
    }
    console.log('✅ 测试数据清理完成');
    
  } catch (error) {
    console.error('❌ 分析过程中发生错误:', error);
  }
}

analyzeAutoFillIssue();