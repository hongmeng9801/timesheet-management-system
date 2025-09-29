-- 修复现有历史记录中的冗余姓名字段
-- 确保所有现有记录都有正确的冗余姓名

-- 1. 检查当前冗余姓名字段的填充情况
SELECT 
    'timesheet_records' as table_name,
    COUNT(*) as total_records,
    COUNT(user_name) as user_name_filled,
    COUNT(supervisor_name) as supervisor_name_filled,
    COUNT(section_chief_name) as section_chief_name_filled,
    COUNT(*) - COUNT(user_name) as user_name_missing,
    COUNT(*) - COUNT(supervisor_name) as supervisor_name_missing,
    COUNT(*) - COUNT(section_chief_name) as section_chief_name_missing
FROM timesheet_records
WHERE user_id IS NOT NULL OR supervisor_id IS NOT NULL OR section_chief_id IS NOT NULL;

-- 2. 检查审批历史表的冗余姓名字段
SELECT 
    'approval_history' as table_name,
    COUNT(*) as total_records,
    COUNT(approver_name) as approver_name_filled,
    COUNT(*) - COUNT(approver_name) as approver_name_missing
FROM approval_history
WHERE approver_id IS NOT NULL;

-- 3. 更新timesheet_records表中缺失的用户姓名
UPDATE timesheet_records 
SET user_name = u.name
FROM users u 
WHERE timesheet_records.user_id = u.id 
AND (timesheet_records.user_name IS NULL OR timesheet_records.user_name = '');

-- 4. 更新timesheet_records表中缺失的班长姓名
UPDATE timesheet_records 
SET supervisor_name = u.name
FROM users u 
WHERE timesheet_records.supervisor_id = u.id 
AND (timesheet_records.supervisor_name IS NULL OR timesheet_records.supervisor_name = '');

-- 5. 更新timesheet_records表中缺失的段长姓名
UPDATE timesheet_records 
SET section_chief_name = u.name
FROM users u 
WHERE timesheet_records.section_chief_id = u.id 
AND (timesheet_records.section_chief_name IS NULL OR timesheet_records.section_chief_name = '');

-- 6. 更新approval_history表中缺失的审核者姓名
UPDATE approval_history 
SET approver_name = u.name
FROM users u 
WHERE approval_history.approver_id = u.id 
AND (approval_history.approver_name IS NULL OR approval_history.approver_name = '');

-- 7. 再次检查修复后的情况
SELECT 
    'timesheet_records_after_fix' as table_name,
    COUNT(*) as total_records,
    COUNT(user_name) as user_name_filled,
    COUNT(supervisor_name) as supervisor_name_filled,
    COUNT(section_chief_name) as section_chief_name_filled,
    COUNT(*) - COUNT(user_name) as user_name_missing,
    COUNT(*) - COUNT(supervisor_name) as supervisor_name_missing,
    COUNT(*) - COUNT(section_chief_name) as section_chief_name_missing
FROM timesheet_records
WHERE user_id IS NOT NULL OR supervisor_id IS NOT NULL OR section_chief_id IS NOT NULL;

SELECT 
    'approval_history_after_fix' as table_name,
    COUNT(*) as total_records,
    COUNT(approver_name) as approver_name_filled,
    COUNT(*) - COUNT(approver_name) as approver_name_missing
FROM approval_history
WHERE approver_id IS NOT NULL;

-- 8. 查看一些示例记录
SELECT 
    id,
    user_id,
    user_name,
    supervisor_id,
    supervisor_name,
    section_chief_id,
    section_chief_name,
    work_date
FROM timesheet_records 
WHERE user_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;