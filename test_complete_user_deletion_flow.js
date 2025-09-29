import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const supabaseUrl = 'https://agesdprmugyybtqrvqks.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnZXNkcHJtdWd5eWJ0cXJ2cWtzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE0NjQ5MiwiZXhwIjoyMDcwNzIyNDkyfQ.cCu0uLbJFNBa4qcNLhkM-nI4ZiDpCsyxCZ52OioJJdw';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少 Supabase 配置');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCompleteUserDeletionFlow() {
  console.log('🧪 开始完整的用户删除流程测试...');
  
  let testUserId = null;
  let testSupervisorId = null;
  let testSectionChiefId = null;
  let timesheetRecordId = null;
  
  try {
    // 步骤 1: 创建测试用户
    console.log('\n📝 步骤 1: 创建测试用户...');
    
    const timestamp = Date.now();
    

    
    // 步骤 2: 创建工时记录
    console.log('\n📝 步骤 2: 创建工时记录...');
    
    const { data: timesheetRecord, error: recordError } = await supabase
      .from('timesheet_records')
      .insert({
        user_id: testUserId,
        work_date: '2024-01-15',
        supervisor_id: testSupervisorId,
        section_chief_id: testSectionChiefId,
        status: 'approved',
        shift_type: '白班',
        total_hours: 8,
        total_amount: 200
      })
      .select()
      .single();
    
    if (recordError) {
      console.error('❌ 创建工时记录失败:', recordError);
      return;
    }
    
    timesheetRecordId = timesheetRecord.id;
    console.log('✅ 工时记录创建成功 (ID:', timesheetRecordId, ')');
    
    // 创建工时记录明细
    console.log('\n📝 步骤 2.1: 创建工时记录明细...');
    
    // 先创建一个测试工序
     const processSuffix = Math.random().toString(36).substr(2, 6);
     const { data: testProcess, error: processError } = await supabase
       .from('processes')
       .insert({
         company_id: '50550b93-0493-4eb7-ae9c-4347dd41a80a',
         production_line: `测试产线_${processSuffix}`,
         production_category: `测试类别_${processSuffix}`,
         product_name: `测试产品_${processSuffix}`,
         product_process: `测试工序_${processSuffix}`,
         unit_price: 20
       })
       .select()
       .single();
     
     if (processError) {
       console.error('❌ 创建测试工序失败:', processError);
       return;
     }
     
     console.log('✅ 测试工序创建成功 (ID:', testProcess.id, ')');
     
     const { data: timesheetItem, error: itemError } = await supabase
       .from('timesheet_record_items')
       .insert({
         timesheet_record_id: timesheetRecordId,
         process_id: testProcess.id,
         quantity: 10,
         unit_price: 20,
         amount: 200
       })
       .select()
       .single();
    
    if (itemError) {
      console.error('❌ 创建工时记录明细失败:', itemError);
      return;
    }
    
    console.log('✅ 工时记录明细创建成功 (ID:', timesheetItem.id, ')');
    
    // 步骤 3: 验证冗余姓名字段是否正确填充
    console.log('\n📝 步骤 3: 验证冗余姓名字段...');
    
    const { data: recordWithNames, error: fetchError } = await supabase
      .from('timesheet_records')
      .select('*')
      .eq('id', timesheetRecordId)
      .single();
    
    if (fetchError) {
      console.error('❌ 获取工时记录失败:', fetchError);
      return;
    }
    
    console.log('📊 工时记录中的姓名字段:');
    console.log('  - user_name:', recordWithNames.user_name);
    console.log('  - supervisor_name:', recordWithNames.supervisor_name);
    console.log('  - section_chief_name:', recordWithNames.section_chief_name);
    
    if (!recordWithNames.user_name || !recordWithNames.supervisor_name || !recordWithNames.section_chief_name) {
      console.error('❌ 冗余姓名字段未正确填充!');
      return;
    }
    
    console.log('✅ 冗余姓名字段填充正确');
    
    // 步骤 4: 删除用户前的准备工作
    console.log('\n📝 步骤 4: 删除用户前清理外键引用...');
    
    // 清理 timesheet_records 表中的外键引用
    const { error: cleanupError } = await supabase
      .from('timesheet_records')
      .update({
        user_id: null,
        supervisor_id: null,
        section_chief_id: null
      })
      .or(`user_id.eq.${testUserId},supervisor_id.eq.${testSupervisorId},section_chief_id.eq.${testSectionChiefId}`);
    
    if (cleanupError) {
      console.error('❌ 清理外键引用失败:', cleanupError);
      return;
    }
    
    console.log('✅ 外键引用清理成功');
    
    // 步骤 5: 调用 update_user_names_before_delete 函数
    console.log('\n📝 步骤 5: 调用 update_user_names_before_delete 函数...');
    
    const { error: updateNamesError } = await supabase.rpc('update_user_names_before_delete', {
      user_id_to_delete: testUserId
    });
    
    if (updateNamesError) {
      console.error('❌ 调用 update_user_names_before_delete 失败:', updateNamesError);
      return;
    }
    
    console.log('✅ update_user_names_before_delete 调用成功');
    
    // 步骤 6: 删除用户
    console.log('\n📝 步骤 6: 删除用户...');
    
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', testUserId);
    
    if (deleteError) {
      console.error('❌ 删除用户失败:', deleteError);
      return;
    }
    
    console.log('✅ 用户删除成功');
    
    // 步骤 7: 验证姓名是否保留在历史记录中
    console.log('\n📝 步骤 7: 验证姓名保留情况...');
    
    const { data: finalRecord, error: finalFetchError } = await supabase
      .from('timesheet_records')
      .select('*')
      .eq('id', timesheetRecordId)
      .single();
    
    if (finalFetchError) {
      console.error('❌ 获取最终工时记录失败:', finalFetchError);
      return;
    }
    
    console.log('📊 删除用户后的工时记录姓名字段:');
    console.log('  - user_name:', finalRecord.user_name);
    console.log('  - supervisor_name:', finalRecord.supervisor_name);
    console.log('  - section_chief_name:', finalRecord.section_chief_name);
    console.log('  - user_id:', finalRecord.user_id);
    console.log('  - supervisor_id:', finalRecord.supervisor_id);
    console.log('  - section_chief_id:', finalRecord.section_chief_id);
    
    // 验证姓名是否保留
    const namesPreserved = finalRecord.user_name === '测试员工_删除测试' &&
                          finalRecord.supervisor_name === '测试班长_删除测试' &&
                          finalRecord.section_chief_name === '测试段长_删除测试';
    
    if (namesPreserved) {
      console.log('\n🎉 测试成功！用户删除后姓名正确保留在历史记录中');
    } else {
      console.log('\n❌ 测试失败！用户删除后姓名未正确保留');
    }
    
    // 步骤 8: 清理测试数据
    console.log('\n📝 步骤 8: 清理测试数据...');
    
    // 删除工时记录明细
    await supabase.from('timesheet_record_items').delete().eq('timesheet_record_id', timesheetRecordId);
    
    // 删除工时记录
    await supabase.from('timesheet_records').delete().eq('id', timesheetRecordId);
    
    // 删除测试工序
    if (testProcess && testProcess.id) {
      await supabase.from('processes').delete().eq('id', testProcess.id);
    }
    
    // 删除其他测试用户
    await supabase.from('users').delete().eq('id', testSupervisorId);
    await supabase.from('users').delete().eq('id', testSectionChiefId);
    
    console.log('✅ 测试数据清理完成');
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
    
    // 清理可能创建的测试数据
    if (timesheetRecordId) {
      await supabase.from('timesheet_records').delete().eq('id', timesheetRecordId);
    }
    if (testUserId) {
      await supabase.from('users').delete().eq('id', testUserId);
    }
    if (testSupervisorId) {
      await supabase.from('users').delete().eq('id', testSupervisorId);
    }
    if (testSectionChiefId) {
      await supabase.from('users').delete().eq('id', testSectionChiefId);
    }
  }
}

// 运行测试
testCompleteUserDeletionFlow();