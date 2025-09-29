-- 检查工时记录表中冗余姓名字段的填充情况
SELECT 
  tr.id,
  tr.user_id,
  tr.user_name,
  tr.supervisor_name,
  tr.section_chief_name,
  tr.work_date,
  tr.status,
  u.name as current_user_name,
  s.name as current_supervisor_name,
  sc.name as current_section_chief_name
FROM timesheet_records tr
LEFT JOIN users u ON tr.user_id = u.id
LEFT JOIN users s ON tr.supervisor_id = s.id
LEFT JOIN users sc ON tr.section_chief_id = sc.id
ORDER BY tr.created_at DESC
LIMIT 10;

-- 检查有多少记录的冗余姓名字段为空
SELECT 
  COUNT(*) as total_records,
  COUNT(CASE WHEN user_name IS NULL OR user_name = '' THEN 1 END) as empty_user_names,
  COUNT(CASE WHEN supervisor_name IS NULL OR supervisor_name = '' THEN 1 END) as empty_supervisor_names,
  COUNT(CASE WHEN section_chief_name IS NULL OR section_chief_name = '' THEN 1 END) as empty_section_chief_names
FROM timesheet_records;

-- 检查审批历史表中的冗余姓名字段
SELECT 
  ah.id,
  ah.approver_id,
  ah.approver_name,
  ah.action,
  ah.created_at,
  u.name as current_approver_name
FROM approval_history ah
LEFT JOIN users u ON ah.approver_id = u.id
ORDER BY ah.created_at DESC
LIMIT 5;