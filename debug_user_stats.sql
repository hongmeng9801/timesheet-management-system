-- 查询每个用户的工时记录状态分布
SELECT 
    user_name,
    status,
    COUNT(*) as record_count,
    COUNT(DISTINCT work_date) as work_days
FROM timesheet_records 
WHERE user_name IS NOT NULL
GROUP BY user_name, status
ORDER BY user_name, status;

-- 查询每个用户的汇总统计
SELECT 
    user_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT work_date) as total_work_days,
    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as supervisor_pending,
    SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as section_chief_pending,
    SUM(CASE WHEN status = 'section_chief_approved' THEN 1 ELSE 0 END) as completed
FROM timesheet_records 
WHERE user_name IS NOT NULL
GROUP BY user_name
ORDER BY user_name;