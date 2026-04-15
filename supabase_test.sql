-- ============================================================
-- SUPABASE DATABASE VERIFICATION TEST
-- Run this entire script in the Supabase SQL Editor
-- ============================================================

CREATE TEMP TABLE IF NOT EXISTS test_results (
    test_num INT,
    test_name TEXT,
    result TEXT
);
DELETE FROM test_results;

-- ======================== STRUCTURE COUNTS ========================

-- 1. Table count (35 schema + 1 auto-created admin_query_logs = 36)
INSERT INTO test_results SELECT 1, 'Table Count (expect 36)',
  count(*)::text || CASE WHEN count(*) = 36 THEN ' ✅' ELSE ' ❌ (found ' || count(*) || ')' END
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- 2. View count (expect 21)
INSERT INTO test_results SELECT 2, 'View Count (expect 21)',
  count(*)::text || CASE WHEN count(*) = 21 THEN ' ✅' ELSE ' ❌ (found ' || count(*) || ')' END
FROM information_schema.views WHERE table_schema = 'public';

-- 3. Trigger count (expect 19)
INSERT INTO test_results SELECT 3, 'Trigger Count (expect >=19)',
  count(DISTINCT trigger_name)::text || CASE WHEN count(DISTINCT trigger_name) >= 19 THEN ' ✅' ELSE ' ❌' END
FROM information_schema.triggers WHERE trigger_schema = 'public';

-- 4. Function/procedure count (expect >=35)
INSERT INTO test_results SELECT 4, 'Function Count (expect >=35)',
  count(*)::text || CASE WHEN count(*) >= 35 THEN ' ✅' ELSE ' ❌' END
FROM information_schema.routines WHERE routine_schema = 'public';

-- ======================== TABLE EXISTENCE ========================

-- 5. All 36 tables exist
INSERT INTO test_results
SELECT 5, 'All 36 tables exist',
  CASE WHEN count(*) = 36 THEN 'ALL PRESENT ✅'
  ELSE (36 - count(*))::text || ' tables MISSING ❌' END
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
AND table_name IN (
  'users','departments','discipline','students','faculty',
  'faculty_advisor','courses','prerequisites','course_offerings',
  'course_allotted','attendance','grades','feedback','rooms',
  'scheduled_class','leave_requests','on_leave','fee_payment',
  'fee_remission_application','supplementary_exams','backlogs',
  'exams','exam_seating','balance','course_registration',
  'system_config','results','cdc','cdc_eligible_departments',
  'cdc_applications','booked_class',
  'customers','accounts','transactions','transfers',
  'admin_query_logs'
);

-- 6. List any missing tables
INSERT INTO test_results
SELECT 6, 'Missing tables detail',
  COALESCE(
    string_agg(expected_table, ', '),
    'NONE — all present ✅'
  )
FROM (
  SELECT unnest(ARRAY[
    'users','departments','discipline','students','faculty',
    'faculty_advisor','courses','prerequisites','course_offerings',
    'course_allotted','attendance','grades','feedback','rooms',
    'scheduled_class','leave_requests','on_leave','fee_payment',
    'fee_remission_application','supplementary_exams','backlogs',
    'exams','exam_seating','balance','course_registration',
    'system_config','results','cdc','cdc_eligible_departments',
    'cdc_applications','booked_class',
    'customers','accounts','transactions','transfers',
    'admin_query_logs'
  ]) AS expected_table
) expected
LEFT JOIN information_schema.tables t
  ON t.table_name = expected.expected_table
  AND t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
WHERE t.table_name IS NULL;

-- ======================== VIEW EXISTENCE ========================

-- 7. All 21 views exist
INSERT INTO test_results
SELECT 7, 'All 21 views exist',
  CASE WHEN count(*) = 21 THEN 'ALL PRESENT ✅'
  ELSE (21 - count(*))::text || ' views MISSING ❌' END
FROM information_schema.views
WHERE table_schema = 'public' AND table_name IN (
  'student_registration_view','student_course_view','student_attendance_view',
  'student_all_semester_grades','student_sgpa','student_fee_status',
  'student_payment_history','student_supplementary_exams','student_feedback_view',
  'student_leave_requests','student_faculty_advisor',
  'student_attendance_summary','student_exam_view','student_timetable_view',
  'current_sem_sgpa','student_current_sem_courses_grades','student_previous_sgpa',
  'faculty_courses_taught','faculty_leave_approvals','faculty_course_students',
  'faculty_advisory_students'
);

-- 8. List any missing views
INSERT INTO test_results
SELECT 8, 'Missing views detail',
  COALESCE(
    string_agg(expected_view, ', '),
    'NONE — all present ✅'
  )
FROM (
  SELECT unnest(ARRAY[
    'student_registration_view','student_course_view','student_attendance_view',
    'student_all_semester_grades','student_sgpa','student_fee_status',
    'student_payment_history','student_supplementary_exams','student_feedback_view',
    'student_leave_requests','student_faculty_advisor',
    'student_attendance_summary','student_exam_view','student_timetable_view',
    'current_sem_sgpa','student_current_sem_courses_grades','student_previous_sgpa',
    'faculty_courses_taught','faculty_leave_approvals','faculty_course_students',
    'faculty_advisory_students'
  ]) AS expected_view
) expected
LEFT JOIN information_schema.views v
  ON v.table_name = expected.expected_view
  AND v.table_schema = 'public'
WHERE v.table_name IS NULL;

-- ======================== COLUMN CHECKS ========================

-- 9. transactions.transaction_type exists (not 'type')
INSERT INTO test_results SELECT 9, 'transactions.transaction_type column',
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='transaction_type')
    THEN 'EXISTS ✅' ELSE 'MISSING ❌' END;

-- 10. transfers table key columns
INSERT INTO test_results SELECT 10, 'transfers (transfer_id, from_account, to_account)',
  CASE WHEN (
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transfers' AND column_name='transfer_id') AND
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transfers' AND column_name='from_account') AND
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transfers' AND column_name='to_account')
  ) THEN 'ALL COLUMNS ✅' ELSE 'COLUMNS MISSING ❌' END;

-- 11. leave_requests.request_id is SERIAL
INSERT INTO test_results SELECT 11, 'leave_requests.request_id is SERIAL',
  CASE WHEN column_default LIKE '%nextval%' THEN 'SERIAL ✅' ELSE 'NOT SERIAL ❌' END
FROM information_schema.columns
WHERE table_name='leave_requests' AND column_name='request_id';

-- 12. booked_class.booking_date column
INSERT INTO test_results SELECT 12, 'booked_class.booking_date column',
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='booked_class' AND column_name='booking_date')
    THEN 'EXISTS ✅' ELSE 'MISSING ❌' END;

-- 13. customers.password column
INSERT INTO test_results SELECT 13, 'customers.password column',
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customers' AND column_name='password')
    THEN 'EXISTS ✅' ELSE 'MISSING ❌' END;

-- 14. customers.customer_id is SERIAL
INSERT INTO test_results SELECT 14, 'customers.customer_id is SERIAL',
  CASE WHEN column_default LIKE '%nextval%' THEN 'SERIAL ✅' ELSE 'NOT SERIAL ❌' END
FROM information_schema.columns
WHERE table_name='customers' AND column_name='customer_id';

-- 15. admin_query_logs key columns
INSERT INTO test_results SELECT 15, 'admin_query_logs columns',
  CASE WHEN (
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='admin_query_logs' AND column_name='admin_id') AND
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='admin_query_logs' AND column_name='query_string') AND
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='admin_query_logs' AND column_name='execution_time_ms')
  ) THEN 'ALL COLUMNS ✅' ELSE 'COLUMNS MISSING ❌' END;

-- ======================== SMOKE TESTS ========================

-- 16. EIMS insert/delete
DO $$
BEGIN
  INSERT INTO Users (user_id, password, role) VALUES ('__TEST__', 'test', 'Student');
  INSERT INTO Departments (dept_id, dept_name) VALUES (9999, 'Test Dept');
  DELETE FROM Users WHERE user_id = '__TEST__';
  DELETE FROM Departments WHERE dept_id = 9999;
  INSERT INTO test_results SELECT 16, 'EIMS insert/delete smoke test', 'PASSED ✅';
EXCEPTION WHEN OTHERS THEN
  INSERT INTO test_results SELECT 16, 'EIMS insert/delete smoke test', 'FAILED: ' || SQLERRM || ' ❌';
END $$;

-- 17. Bank insert/delete
DO $$
BEGIN
  INSERT INTO Customers (name, email, phone, password) VALUES ('__Test__', '__test@test.com__', '0000000000', 'pass');
  DELETE FROM Customers WHERE email = '__test@test.com__';
  INSERT INTO test_results SELECT 17, 'Bank insert/delete smoke test', 'PASSED ✅';
EXCEPTION WHEN OTHERS THEN
  INSERT INTO test_results SELECT 17, 'Bank insert/delete smoke test', 'FAILED: ' || SQLERRM || ' ❌';
END $$;

-- 18. Key triggers exist
INSERT INTO test_results
SELECT 18, 'Key triggers exist',
  CASE WHEN count(DISTINCT trigger_name) >= 5 THEN count(DISTINCT trigger_name)::text || ' found ✅' ELSE 'MISSING ❌' END
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name IN (
  'trg_course_approval',
  'trg_leave_approved',
  'trg_course_capacity',
  'trg_update_balance',
  'trg_create_backlog',
  'trg_results_declared',
  'trg_create_account'
);

-- 19. Key functions exist
INSERT INTO test_results
SELECT 19, 'Key functions exist',
  CASE WHEN count(DISTINCT routine_name) >= 5 THEN count(DISTINCT routine_name)::text || ' found ✅' ELSE 'MISSING ❌' END
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'make_payment',
  'upload_grade',
  'apply_leave',
  'submit_feedback',
  'apply_fee_remission',
  'mark_attendance'
);

-- ======================== CONSTRAINT CHECKS ========================

-- 20. Foreign key count
INSERT INTO test_results
SELECT 20, 'Foreign key constraints',
  count(*)::text || ' FKs' || CASE WHEN count(*) >= 20 THEN ' ✅' ELSE ' ❌ (expected >=20)' END
FROM information_schema.table_constraints
WHERE constraint_schema = 'public' AND constraint_type = 'FOREIGN KEY';

-- ========== FINAL RESULTS ==========
SELECT * FROM (
  SELECT test_num AS "#", test_name AS "Test", result AS "Result" FROM test_results
  UNION ALL
  SELECT 99, '══════ FINAL VERDICT ══════',
    CASE WHEN count(*) FILTER (WHERE result LIKE '%❌%') = 0
      THEN '✅ ALL ' || count(*) || ' TESTS PASSED'
      ELSE '❌ ' || count(*) FILTER (WHERE result LIKE '%❌%') || ' of ' || count(*) || ' TEST(S) FAILED'
    END
  FROM test_results
) combined
ORDER BY "#";

DROP TABLE IF EXISTS test_results;

