-- S3-DBA-01: Read current job and department assignment per employee.
-- Uses the existing v_employee_current_status view and current-date logic.
SELECT
    "empNo",
    "fullName",
    "employmentStatus",
    "jobCode",
    "jobDesc",
    "deptCode",
    "deptName",
    "salary",
    "currentJobEffDate"
FROM public.v_employee_current_status
ORDER BY "empNo";
