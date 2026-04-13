-- ============================================================
-- SUPABASE DATABASE VERIFICATION TEST
-- Run this entire script in the Supabase SQL Editor
-- ============================================================

-- Store results in a temp table so we get a visible result set
CREATE TEMP TABLE IF NOT EXISTS test_results (
    test_num INT,
    test_name TEXT,
    result TEXT
);
DELETE FROM test_results;

-- 1. Table count
INSERT INTO test_results SELECT 1, 'Table Count (expect 35)',
  count(*)::text || CASE WHEN count(*) = 35 THEN ' ✅' ELSE ' ❌' END
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- 2. View count
INSERT INTO test_results SELECT 2, 'View Count (expect >=20)',
  count(*)::text || CASE WHEN count(*) >= 20 THEN ' ✅' ELSE ' ❌' END
FROM information_schema.views WHERE table_schema = 'public';

-- 3. Trigger count
INSERT INTO test_results SELECT 3, 'Trigger Count (expect >=15)',
  count(DISTINCT trigger_name)::text || CASE WHEN count(DISTINCT trigger_name) >= 15 THEN ' ✅' ELSE ' ❌' END
FROM information_schema.triggers WHERE trigger_schema = 'public';

-- 4. Function count
INSERT INTO test_results SELECT 4, 'Function Count (expect >=10)',
  count(*)::text || CASE WHEN count(*) >= 10 THEN ' ✅' ELSE ' ❌' END
FROM information_schema.routines WHERE routine_schema = 'public';

-- 5. Check all 35 tables exist
INSERT INTO test_results
SELECT 5, 'All 35 tables exist',
  CASE WHEN count(*) = 35 THEN 'ALL PRESENT ✅'
  ELSE (35 - count(*))::text || ' tables MISSING ❌' END
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
  'customers','accounts','transactions','transfers'
);

-- 6. Check all 11 key views exist
INSERT INTO test_results
SELECT 6, 'All 11 key views exist',
  CASE WHEN count(*) = 11 THEN 'ALL PRESENT ✅'
  ELSE (11 - count(*))::text || ' views MISSING ❌' END
FROM information_schema.views
WHERE table_schema = 'public' AND table_name IN (
  'student_attendance_summary','student_exam_view','student_timetable_view',
  'current_sem_sgpa','student_current_sem_courses_grades','student_previous_sgpa',
  'faculty_courses_taught','faculty_leave_approvals','faculty_course_students',
  'faculty_advisory_students','student_faculty_advisor'
);

-- 7. transactions.transaction_type exists (not 'type')
INSERT INTO test_results SELECT 7, 'transactions.transaction_type column',
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='transaction_type')
    THEN 'EXISTS ✅' ELSE 'MISSING ❌' END;

INSERT INTO test_results SELECT 8, 'transactions.type column removed',
  CASE WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='type')
    THEN 'CORRECT ✅' ELSE 'STILL EXISTS ❌' END;

-- 9. Transfers table columns
INSERT INTO test_results SELECT 9, 'transfers table (transfer_id, from_account, to_account)',
  CASE WHEN (
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transfers' AND column_name='transfer_id') AND
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transfers' AND column_name='from_account') AND
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transfers' AND column_name='to_account')
  ) THEN 'ALL COLUMNS PRESENT ✅' ELSE 'COLUMNS MISSING ❌' END;

-- 10. leave_requests.request_id is SERIAL
INSERT INTO test_results SELECT 10, 'leave_requests.request_id is SERIAL',
  CASE WHEN column_default LIKE '%nextval%' THEN 'SERIAL ✅' ELSE 'NOT SERIAL ❌' END
FROM information_schema.columns
WHERE table_name='leave_requests' AND column_name='request_id';

-- 11. booked_class.booking_date exists
INSERT INTO test_results SELECT 11, 'booked_class.booking_date column',
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='booked_class' AND column_name='booking_date')
    THEN 'EXISTS ✅' ELSE 'MISSING ❌' END;

-- 12. customers.password exists
INSERT INTO test_results SELECT 12, 'customers.password column',
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customers' AND column_name='password')
    THEN 'EXISTS ✅' ELSE 'MISSING ❌' END;

-- 13. customers.customer_id is SERIAL
INSERT INTO test_results SELECT 13, 'customers.customer_id is SERIAL',
  CASE WHEN column_default LIKE '%nextval%' THEN 'SERIAL ✅' ELSE 'NOT SERIAL ❌' END
FROM information_schema.columns
WHERE table_name='customers' AND column_name='customer_id';

-- 14. EIMS smoke test
DO $$
BEGIN
  INSERT INTO Users (user_id, password, role) VALUES ('__TEST__', 'test', 'Student');
  INSERT INTO Departments (dept_id, dept_name) VALUES (9999, 'Test Dept');
  DELETE FROM Users WHERE user_id = '__TEST__';
  DELETE FROM Departments WHERE dept_id = 9999;
  INSERT INTO test_results SELECT 14, 'EIMS insert/delete smoke test', 'PASSED ✅';
EXCEPTION WHEN OTHERS THEN
  INSERT INTO test_results SELECT 14, 'EIMS insert/delete smoke test', 'FAILED: ' || SQLERRM || ' ❌';
END $$;

-- 15. Bank smoke test
DO $$
BEGIN
  INSERT INTO Customers (name, email, phone, password) VALUES ('__Test__', '__test@test.com__', '0000000000', 'pass');
  DELETE FROM Customers WHERE email = '__test@test.com__';
  INSERT INTO test_results SELECT 15, 'Bank insert/delete smoke test', 'PASSED ✅';
EXCEPTION WHEN OTHERS THEN
  INSERT INTO test_results SELECT 15, 'Bank insert/delete smoke test', 'FAILED: ' || SQLERRM || ' ❌';
END $$;

-- ========== FINAL RESULTS (single combined output) ==========
SELECT * FROM (
  SELECT test_num AS "#", test_name AS "Test", result AS "Result" FROM test_results
  UNION ALL
  SELECT 99, '====== FINAL VERDICT ======',
    CASE WHEN count(*) FILTER (WHERE result LIKE '%❌%') = 0
      THEN '✅ ALL ' || count(*) || ' TESTS PASSED — DATABASE READY FOR DEPLOYMENT'
      ELSE '❌ ' || count(*) FILTER (WHERE result LIKE '%❌%') || ' of ' || count(*) || ' TEST(S) FAILED'
    END
  FROM test_results
) combined
ORDER BY "#";

DROP TABLE IF EXISTS test_results;
