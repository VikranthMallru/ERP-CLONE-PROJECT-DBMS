-- Create database
CREATE DATABASE eims_db;

\c eims_db

-- Load schema files
\i schema/01_users.sql
\i schema/02_departments.sql
\i schema/03_disciplines.sql
\i schema/04_students.sql
\i schema/05_faculty.sql
\i schema/06_faculty_advisor.sql
\i schema/07_courses.sql
\i schema/08_prerequisites.sql
\i schema/09_course_offerings.sql
\i schema/10_course_allotted.sql
\i schema/11_attendance.sql
\i schema/12_grades.sql
\i schema/13_feedback.sql
\i schema/14_rooms.sql
\i schema/15_schedule_class.sql
\i schema/16_leave_requests.sql
\i schema/17_on_leave.sql
\i schema/18_fee_payment.sql
\i schema/19_fee_remission_application.sql
\i schema/20_supplementary_exam.sql
\i schema/21_backlogs.sql
\i schema/22_exams.sql
\i schema/23_exam_seating.sql
\i schema/24_balance.sql
\i schema/25_course_registration.sql
\i schema/26_system_config.sql
\i schema/27_results.sql

--Load constraint file
\i schema/constraints.sql