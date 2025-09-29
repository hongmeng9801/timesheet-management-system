// 测试用户删除后姓名保留的脚本
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// Supabase 配置
const supabaseUrl = 'https://agesdprmugyybtqrvqks.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnZXNkcHJtdWd5eWJ0cXJ2cWtzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE0NjQ5MiwiZXhwIjoyMDcwNzIyNDkyfQ.cCu0uLbJFNBa4qcNLhkM-nI4ZiDpCsyxCZ52OioJJdw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testUserDeletion() {
  try {
    console.log('=== 测试用户删除后姓名保留功能 ===\n');
    
    // 1. 获取现有的公司和角色ID
    console.log('1. 获取现有的公司和角色ID...');
    const { data: companies } = await supabase.from('companies').select('id').limit(1);
    const { data: roles } = await supabase.from('user_roles').select('id').limit(1);
    
    if (!companies?.length || !roles?.length) {
      console.error('缺少必要的公司或角色数据');
      return;
    }
    
    // 2. 创建测试用户
    console.log('2. 创建测试用户...');
    const timestamp = Date.now().toString().slice(-10); // 使用时间戳后10位
    const { data: testUser, error: createError } = await supabase
      .from('users')
      .insert({
        name: '测试用户_删除测试',
        phone: `138${timestamp}`,
        password_hash: 'test_hash',
        id_card: `12345678901234${timestamp.slice(-4)}`,
        company_id: companies[0].id,
        role_id: roles[0].id,
        is_active: true
      })
      .select()
      .single();
    
    if (createError) {
      console.error('创建测试用户失败:', createError);
      return;
    }
    
    console.log('测试用户创建成功:', testUser.name, testUser.id);
    
    // 3. 创建工时记录
    console.log('\n3. 创建工时记录...');
    const { data: timesheetRecord, error: recordError } = await supabase
      .from('timesheet_records')
      .insert({
        user_id: testUser.id,
        work_date: '2024-01-15',
        shift_type: '白班',
        status: 'approved',
        supervisor_id: testUser.id, // 简化测试，使用同一个用户
        section_chief_id: testUser.id
      })
      .select()
      .single();
    
    if (recordError) {
      console.error('创建工时记录失败:', recordError);
      return;
    }
    
    console.log('工时记录创建成功:', timesheetRecord.id);
    
    // 4. 创建审批历史
    console.log('\n4. 创建审批历史...');
    const { data: approvalHistory, error: approvalError } = await supabase
      .from('approval_history')
      .insert({
        timesheet_record_id: timesheetRecord.id,
        approver_id: testUser.id,
        action: 'approved',
        comment: '测试审批'
      })
      .select()
      .single();
    
    if (approvalError) {
      console.error('创建审批历史失败:', approvalError);
      return;
    }
    
    console.log('审批历史创建成功:', approvalHistory.id);
    
    // 5. 检查删除前的数据状态
    console.log('\n5. 检查删除前的数据状态...');
    
    const { data: beforeRecord } = await supabase
      .from('timesheet_records')
      .select('user_name, supervisor_name, section_chief_name')
      .eq('id', timesheetRecord.id)
      .single();
    
    const { data: beforeApproval } = await supabase
      .from('approval_history')
      .select('approver_name')
      .eq('id', approvalHistory.id)
      .single();
    
    console.log('删除前工时记录冗余姓名:', beforeRecord);
    console.log('删除前审批历史冗余姓名:', beforeApproval);
    
    // 6. 清理外键引用
    console.log('\n6. 清理外键引用...');
    
    // 清理timesheet_records表中的外键引用
    const { error: userUpdateError } = await supabase
      .from('timesheet_records')
      .update({ user_id: null })
      .eq('user_id', testUser.id);
    
    if (userUpdateError) {
      console.error('清理user_id引用失败:', userUpdateError);
      return;
    }
    
    const { error: supervisorUpdateError } = await supabase
      .from('timesheet_records')
      .update({ supervisor_id: null })
      .eq('supervisor_id', testUser.id);
    
    if (supervisorUpdateError) {
      console.error('清理supervisor_id引用失败:', supervisorUpdateError);
      return;
    }
    
    const { error: sectionChiefUpdateError } = await supabase
      .from('timesheet_records')
      .update({ section_chief_id: null })
      .eq('section_chief_id', testUser.id);
    
    if (sectionChiefUpdateError) {
      console.error('清理section_chief_id引用失败:', sectionChiefUpdateError);
      return;
    }
    
    // 清理approval_history表中的approver_id引用
    const { error: approvalUpdateError } = await supabase
      .from('approval_history')
      .update({ approver_id: null })
      .eq('approver_id', testUser.id);
    
    if (approvalUpdateError) {
      console.error('清理approver_id引用失败:', approvalUpdateError);
      return;
    }
    
    console.log('外键引用清理完成');
    
    // 7. 在删除前调用 update_user_names_before_delete 函数
    console.log('\n7. 调用 update_user_names_before_delete 函数...');
    const { error: updateNamesError } = await supabase.rpc('update_user_names_before_delete', {
      user_id_to_delete: testUser.id
    });
    
    if (updateNamesError) {
      console.error('更新姓名字段失败:', updateNamesError);
      return;
    }
    
    console.log('姓名字段更新成功');
    
    // 8. 删除用户
    console.log('\n8. 删除用户...');
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', testUser.id);
    
    if (deleteError) {
      console.error('删除用户失败:', deleteError);
      return;
    }
    
    console.log('用户删除成功');
    
    // 9. 检查删除后的数据状态
    console.log('\n9. 检查删除后的数据状态...');
    
    const { data: afterRecord } = await supabase
      .from('timesheet_records')
      .select('user_name, supervisor_name, section_chief_name')
      .eq('id', timesheetRecord.id)
      .single();
    
    const { data: afterApproval } = await supabase
      .from('approval_history')
      .select('approver_name')
      .eq('id', approvalHistory.id)
      .single();
    
    console.log('删除后工时记录冗余姓名:', afterRecord);
    console.log('删除后审批历史冗余姓名:', afterApproval);
    
    // 10. 验证结果
    console.log('\n10. 验证结果...');
    
    const success = 
      afterRecord.user_name === testUser.name &&
      afterRecord.supervisor_name === testUser.name &&
      afterRecord.section_chief_name === testUser.name &&
      afterApproval.approver_name === testUser.name;
    
    if (success) {
      console.log('✅ 测试通过：用户删除后姓名正确保留在历史记录中');
    } else {
      console.log('❌ 测试失败：用户删除后姓名未正确保留');
      console.log('期望姓名:', testUser.name);
      console.log('实际结果:', {
        user_name: afterRecord.user_name,
        supervisor_name: afterRecord.supervisor_name,
        section_chief_name: afterRecord.section_chief_name,
        approver_name: afterApproval.approver_name
      });
    }
    
    // 9. 清理测试数据
    console.log('\n9. 清理测试数据...');
    await supabase.from('approval_history').delete().eq('id', approvalHistory.id);
    await supabase.from('timesheet_records').delete().eq('id', timesheetRecord.id);
    console.log('测试数据清理完成');
    
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

// 运行测试
testUserDeletion();