import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkDatabaseData() {
  try {
    console.log('=== 检查数据库中的冗余姓名字段 ===\n');
    
    // 1. 检查timesheet_records表中的冗余姓名字段
    console.log('1. 检查timesheet_records表中的冗余姓名字段...');
    const { data: timesheetRecords, error: timesheetError } = await supabase
      .from('timesheet_records')
      .select('id, user_id, user_name, supervisor_id, supervisor_name, section_chief_id, section_chief_name, work_date')
      .limit(10);
    
    if (timesheetError) {
      console.error('查询timesheet_records失败:', timesheetError);
      return;
    }
    
    console.log('timesheet_records样本数据:');
    timesheetRecords.forEach((record, index) => {
      console.log(`记录${index + 1}:`, {
        id: record.id,
        user_id: record.user_id,
        user_name: record.user_name,
        supervisor_id: record.supervisor_id,
        supervisor_name: record.supervisor_name,
        section_chief_id: record.section_chief_id,
        section_chief_name: record.section_chief_name,
        work_date: record.work_date
      });
    });
    
    // 2. 检查approval_history表中的冗余姓名字段
    console.log('\n2. 检查approval_history表中的冗余姓名字段...');
    const { data: approvalHistory, error: approvalError } = await supabase
      .from('approval_history')
      .select('id, timesheet_record_id, approver_id, approver_name, action, comment, created_at')
      .limit(10);
    
    if (approvalError) {
      console.error('查询approval_history失败:', approvalError);
      return;
    }
    
    console.log('approval_history样本数据:');
    approvalHistory.forEach((record, index) => {
      console.log(`记录${index + 1}:`, {
        id: record.id,
        timesheet_record_id: record.timesheet_record_id,
        approver_id: record.approver_id,
        approver_name: record.approver_name,
        action: record.action,
        comment: record.comment,
        created_at: record.created_at
      });
    });
    
    // 3. 检查是否有姓名字段为空的记录
    console.log('\n3. 检查是否有姓名字段为空的记录...');
    
    const { data: emptyUserNames, error: emptyUserError } = await supabase
      .from('timesheet_records')
      .select('id, user_id, user_name')
      .is('user_name', null)
      .limit(5);
    
    if (emptyUserError) {
      console.error('查询空user_name失败:', emptyUserError);
    } else {
      console.log('user_name为空的记录数量:', emptyUserNames.length);
      if (emptyUserNames.length > 0) {
        console.log('空user_name记录样本:', emptyUserNames);
      }
    }
    
    const { data: emptySupervisorNames, error: emptySupervisorError } = await supabase
      .from('timesheet_records')
      .select('id, supervisor_id, supervisor_name')
      .is('supervisor_name', null)
      .not('supervisor_id', 'is', null)
      .limit(5);
    
    if (emptySupervisorError) {
      console.error('查询空supervisor_name失败:', emptySupervisorError);
    } else {
      console.log('supervisor_name为空但supervisor_id不为空的记录数量:', emptySupervisorNames.length);
      if (emptySupervisorNames.length > 0) {
        console.log('空supervisor_name记录样本:', emptySupervisorNames);
      }
    }
    
    const { data: emptyApproverNames, error: emptyApproverError } = await supabase
      .from('approval_history')
      .select('id, approver_id, approver_name')
      .is('approver_name', null)
      .not('approver_id', 'is', null)
      .limit(5);
    
    if (emptyApproverError) {
      console.error('查询空approver_name失败:', emptyApproverError);
    } else {
      console.log('approver_name为空但approver_id不为空的记录数量:', emptyApproverNames.length);
      if (emptyApproverNames.length > 0) {
        console.log('空approver_name记录样本:', emptyApproverNames);
      }
    }
    
    console.log('\n=== 数据库检查完成 ===');
    
  } catch (error) {
    console.error('检查数据库数据时发生错误:', error);
  }
}

checkDatabaseData();