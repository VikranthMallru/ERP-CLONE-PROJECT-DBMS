-- =============================
-- USERS
-- =============================
CREATE INDEX IF NOT EXISTS idx_users_role
ON Users(role);


-- =============================
-- DEPARTMENTS
-- =============================
CREATE INDEX IF NOT EXISTS idx_departments_head
ON Departments(head_dept_id);


-- =============================
-- DISCIPLINE
-- =============================
-- Usually no extra index needed (PK already exists)


-- =============================
-- STUDENTS
-- =============================
CREATE INDEX IF NOT EXISTS idx_students_department
ON Students(department_id);

CREATE INDEX IF NOT EXISTS idx_students_discipline
ON Students(discipline_id);

CREATE INDEX IF NOT EXISTS idx_students_semester
ON Students(semester);


-- =============================
-- FACULTY
-- =============================
CREATE INDEX IF NOT EXISTS idx_faculty_department
ON Faculty(department_id);


-- =============================
-- FACULTY ADVISOR
-- =============================
CREATE INDEX IF NOT EXISTS idx_advisor_faculty
ON Faculty_Advisor(faculty_id);


-- =============================
-- COURSES
-- =============================
CREATE INDEX IF NOT EXISTS idx_courses_department
ON Courses(department_id);


-- =============================
-- PREREQUISITES
-- =============================
CREATE INDEX IF NOT EXISTS idx_prereq_main
ON Prerequisites(main_course_id);

CREATE INDEX IF NOT EXISTS idx_prereq_course
ON Prerequisites(prereq_course_id);


-- =============================
-- COURSE OFFERINGS
-- =============================
CREATE INDEX IF NOT EXISTS idx_offering_faculty
ON Course_Offerings(faculty_id);

CREATE INDEX IF NOT EXISTS idx_offering_course
ON Course_Offerings(course_id);

CREATE INDEX IF NOT EXISTS idx_offering_discipline
ON Course_Offerings(discipline_id);

CREATE INDEX IF NOT EXISTS idx_offering_year
ON Course_Offerings(year_offering);


-- =============================
-- COURSE ALLOTTED
-- =============================
CREATE INDEX IF NOT EXISTS idx_allotted_student
ON Course_Allotted(student_id);

CREATE INDEX IF NOT EXISTS idx_allotted_offering
ON Course_Allotted(course_offering_id);


-- =============================
-- ATTENDANCE
-- =============================
CREATE INDEX IF NOT EXISTS idx_attendance_student
ON Attendance(student_id);

CREATE INDEX IF NOT EXISTS idx_attendance_offering
ON Attendance(course_offering_id);

CREATE INDEX IF NOT EXISTS idx_attendance_date
ON Attendance(class_date);


-- =============================
-- GRADES
-- =============================
CREATE INDEX IF NOT EXISTS idx_grades_student
ON Grades(student_id);

CREATE INDEX IF NOT EXISTS idx_grades_offering
ON Grades(course_offering_id);


-- =============================
-- FEEDBACK
-- =============================
CREATE INDEX IF NOT EXISTS idx_feedback_student
ON Feedback(student_id);

CREATE INDEX IF NOT EXISTS idx_feedback_offering
ON Feedback(course_offering_id);


-- =============================
-- ROOMS
-- =============================
-- Composite PK already indexed


-- =============================
-- SCHEDULED CLASS
-- =============================
CREATE INDEX IF NOT EXISTS idx_schedule_offering
ON Scheduled_class(course_offering_id);

CREATE INDEX IF NOT EXISTS idx_schedule_room
ON Scheduled_class(building_name, room_number);


-- =============================
-- LEAVE REQUESTS
-- =============================
CREATE INDEX IF NOT EXISTS idx_leave_student
ON Leave_Requests(student_id);

CREATE INDEX IF NOT EXISTS idx_leave_status
ON Leave_Requests(status);


-- =============================
-- ON LEAVE
-- =============================
CREATE INDEX IF NOT EXISTS idx_onleave_student
ON On_leave(student_id);


-- =============================
-- FEE PAYMENT
-- =============================
CREATE INDEX IF NOT EXISTS idx_fee_payment_student
ON Fee_Payment(student_id);

CREATE INDEX IF NOT EXISTS idx_fee_payment_sem
ON Fee_Payment(semester);


-- =============================
-- FEE REMISSION
-- =============================
CREATE INDEX IF NOT EXISTS idx_fee_remission_student
ON Fee_Remission_Application(student_id);


-- =============================
-- SUPPLEMENTARY EXAMS
-- =============================
CREATE INDEX IF NOT EXISTS idx_supp_student
ON Supplementary_exams(student_id);

CREATE INDEX IF NOT EXISTS idx_supp_offering
ON Supplementary_exams(course_offering_id);


-- =============================
-- BACKLOGS
-- =============================
CREATE INDEX IF NOT EXISTS idx_backlog_student
ON Backlogs(student_id);

CREATE INDEX IF NOT EXISTS idx_backlog_course
ON Backlogs(course_id);


-- =============================
-- EXAMS
-- =============================
CREATE INDEX IF NOT EXISTS idx_exam_offering
ON Exams(course_offering_id);

CREATE INDEX IF NOT EXISTS idx_exam_date
ON Exams(date_of_exam);


-- =============================
-- EXAM SEATING
-- =============================
CREATE INDEX IF NOT EXISTS idx_exam_seating_student
ON Exam_Seating(student_id);


-- =============================
-- BALANCE
-- =============================
-- PK already indexed


-- =============================
-- COURSE REGISTRATION
-- =============================
CREATE INDEX IF NOT EXISTS idx_registration_student
ON Course_Registration(student_id);

CREATE INDEX IF NOT EXISTS idx_registration_course
ON Course_Registration(course_id);

CREATE INDEX IF NOT EXISTS idx_registration_sem
ON Course_Registration(semester);

CREATE INDEX IF NOT EXISTS idx_registration_approved
ON Course_Registration(approved);


-- =============================
-- SYSTEM CONFIG
-- =============================
-- No index needed (single row table)


-- =============================
-- RESULTS
-- =============================
-- PK already indexed


-- =============================
-- CDC
-- =============================
CREATE INDEX IF NOT EXISTS idx_cdc_cgpa
ON CDC(cgpa_cutoff);


-- =============================
-- CDC ELIGIBLE DEPARTMENTS
-- =============================
CREATE INDEX IF NOT EXISTS idx_cdc_dept
ON CDC_Eligible_Departments(department_id);


-- =============================
-- CDC APPLICATIONS
-- =============================
CREATE INDEX IF NOT EXISTS idx_cdc_app_student
ON CDC_Applications(student_id);

CREATE INDEX IF NOT EXISTS idx_cdc_app_cdc
ON CDC_Applications(cdc_id);


CREATE INDEX idx_scheduled_class_main
ON Scheduled_class (building_name, room_number, scheduled_day, start_time, end_time);

CREATE INDEX idx_booked_class_main
ON booked_class (building_name, room_number, scheduled_day, start_time, end_time);

CREATE INDEX idx_rooms_main
ON Rooms (building_name, room_number);

CREATE INDEX idx_scheduled_class_day
ON Scheduled_class (scheduled_day);

CREATE INDEX idx_booked_class_day
ON booked_class (scheduled_day);

CREATE INDEX idx_booked_class_course
ON booked_class (course_offering_id);