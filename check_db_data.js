import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://agesdprmugyybtqrvqks.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnZXNkcHJtdWd5eWJ0cXJ2cWtzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE0NjQ5MiwiZXhwIjoyMDcwNzIyNDkyfQ.cCu0uLbJFNBa4qcNLhkM-nI4ZiDpCsyxCZ52OioJJdw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRedundantNames() {
  console.log('=== 检查工时记录中的冗余姓名字段 ===');
  
  // 查询最近的工时记录
  const { data: records, error: recordsError } = await supabase
    .from('timesheet_records')
    .select(`
      id,
      user_id,
      user_name,
      supervisor_name,
      section_chief_name,
      work_date,
      status,
      users!timesheet_records_user_id_fkey(name),
      supervisor:users!timesheet_records_supervisor_id_fkey(name),
      section_chief:users!timesheet_records_section_chief_id_fkey(name)
    `)
    .order('created_at', { ascending: false })
    .limit(10);

  if (recordsError) {
    console.error('查询工时记录失败:', recordsError);
    return;
  }

  console.log('\n最近10条工时记录:');
  records.forEach((record, index) => {
    console.log(`\n记录 ${index + 1}:`);
    console.log(`  ID: ${record.id}`);
    console.log(`  工作日期: ${record.work_date}`);
    console.log(`  状态: ${record.status}`);
    console.log(`  员工ID: ${record.user_id}`);
    console.log(`  冗余员工姓名: ${record.user_name || '空'}`);
    console.log(`  当前员工姓名: ${record.users?.name || '已删除'}`);
    console.log(`  冗余班长姓名: ${record.supervisor_name || '空'}`);
    console.log(`  当前班长姓名: ${record.supervisor?.name || '已删除'}`);
    console.log(`  冗余段长姓名: ${record.section_chief_name || '空'}`);
    console.log(`  当前段长姓名: ${record.section_chief?.name || '已删除'}`);
  });

  // 统计冗余字段为空的记录数量
  const { data: stats, error: statsError } = await supabase
    .from('timesheet_records')
    .select('user_name, supervisor_name, section_chief_name');

  if (statsError) {
    console.error('查询统计数据失败:', statsError);
    return;
  }

  const totalRecords = stats.length;
  const emptyUserNames = stats.filter(s => !s.user_name || s.user_name === '').length;
  const emptySupervisorNames = stats.filter(s => !s.supervisor_name || s.supervisor_name === '').length;
  const emptySectionChiefNames = stats.filter(s => !s.section_chief_name || s.section_chief_name === '').length;

  console.log('\n=== 冗余姓名字段统计 ===');
  console.log(`总记录数: ${totalRecords}`);
  console.log(`员工姓名为空: ${emptyUserNames} (${((emptyUserNames/totalRecords)*100).toFixed(1)}%)`);
  console.log(`班长姓名为空: ${emptySupervisorNames} (${((emptySupervisorNames/totalRecords)*100).toFixed(1)}%)`);
  console.log(`段长姓名为空: ${emptySectionChiefNames} (${((emptySectionChiefNames/totalRecords)*100).toFixed(1)}%)`);

  // 查询审批历史
  console.log('\n=== 检查审批历史中的冗余姓名字段 ===');
  const { data: approvals, error: approvalsError } = await supabase
    .from('approval_history')
    .select(`
      id,
      approver_id,
      approver_name,
      action,
      created_at,
      users!approval_history_approver_id_fkey(name)
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  if (approvalsError) {
    console.error('查询审批历史失败:', approvalsError);
    return;
  }

  console.log('\n最近5条审批记录:');
  approvals.forEach((approval, index) => {
    console.log(`\n审批记录 ${index + 1}:`);
    console.log(`  ID: ${approval.id}`);
    console.log(`  操作: ${approval.action}`);
    console.log(`  审批人ID: ${approval.approver_id}`);
    console.log(`  冗余审批人姓名: ${approval.approver_name || '空'}`);
    console.log(`  当前审批人姓名: ${approval.users?.name || '已删除'}`);
    console.log(`  时间: ${approval.created_at}`);
  });
}

checkRedundantNames().catch(console.error);