-- ============================================================
-- DEMO DATA FOR ERP SYSTEM
-- Run in Supabase SQL Editor AFTER schema + extras
-- ============================================================

-- ========== SYSTEM CONFIG (singleton row) ==========
INSERT INTO System_Config (config_id, registration_open_date, registration_close_date, results_declaration_date, is_fees_open)
VALUES (1, '2026-01-10', '2026-01-25', '2026-06-01', TRUE);

-- ========== DEPARTMENTS ==========
INSERT INTO Departments (dept_id, dept_name) VALUES
(1, 'Computer Science'),
(2, 'Electrical Engineering'),
(3, 'Mechanical Engineering');

-- ========== DISCIPLINES ==========
INSERT INTO Discipline (discipline_id, max_semester, fees) VALUES
('CSE', 8, 150000),
('EE', 8, 140000),
('ME', 8, 135000);

-- ========== USERS (EIMS passwords can be plain text — auto-hashed on first login) ==========
INSERT INTO Users (user_id, password, role) VALUES
('admin01',   'Admin@123',   'Admin'),
('FAC001',    'Faculty@1',   'Faculty'),
('FAC002',    'Faculty@2',   'Faculty'),
('FAC003',    'Faculty@3',   'Faculty'),
('STU001',    'Student@1',   'Student'),
('STU002',    'Student@2',   'Student'),
('STU003',    'Student@3',   'Student'),
('STU004',    'Student@4',   'Student');

-- ========== FACULTY ==========
INSERT INTO Faculty (faculty_id, faculty_name, contact_no, email, department_id) VALUES
('FAC001', 'Dr. Ramesh Kumar',    '9876543210', 'ramesh@iitbbs.ac.in',  1),
('FAC002', 'Dr. Priya Sharma',    '9876543211', 'priya@iitbbs.ac.in',   2),
('FAC003', 'Dr. Vikram Singh',    '9876543212', 'vikram@iitbbs.ac.in',  1);

-- ========== UPDATE DEPARTMENT HEADS ==========
UPDATE Departments SET head_dept_id = 'FAC001' WHERE dept_id = 1;
UPDATE Departments SET head_dept_id = 'FAC002' WHERE dept_id = 2;

-- ========== STUDENTS ==========
INSERT INTO Students (student_id, student_name, contact_no, college_email, personal_email, residence_address, join_date, semester, department_id, discipline_id) VALUES
('STU001', 'Arjun Reddy',    '8001000001', 'stu001@iitbbs.ac.in', 'arjun@gmail.com',  'Hall 1, Room 101', '2023-07-20', 4, 1, 'CSE'),
('STU002', 'Sneha Patel',    '8001000002', 'stu002@iitbbs.ac.in', 'sneha@gmail.com',  'Hall 2, Room 205', '2023-07-20', 4, 1, 'CSE'),
('STU003', 'Rahul Verma',    '8001000003', 'stu003@iitbbs.ac.in', 'rahul@gmail.com',  'Hall 1, Room 302', '2023-07-20', 4, 2, 'EE'),
('STU004', 'Meera Nair',     '8001000004', 'stu004@iitbbs.ac.in', 'meera@gmail.com',  'Hall 3, Room 110', '2024-07-20', 2, 1, 'CSE');

-- ========== FACULTY ADVISORS ==========
INSERT INTO Faculty_Advisor (student_id, faculty_id) VALUES
('STU001', 'FAC001'),
('STU002', 'FAC001'),
('STU003', 'FAC002'),
('STU004', 'FAC003');

-- ========== COURSES ==========
INSERT INTO Courses (course_id, course_name, department_id, credits) VALUES
('CS201', 'Data Structures',          1, 4),
('CS202', 'Database Systems',         1, 4),
('CS203', 'Operating Systems',        1, 3),
('CS301', 'Machine Learning',         1, 4),
('EE201', 'Signals and Systems',      2, 4),
('EE202', 'Digital Electronics',      2, 3),
('ME201', 'Thermodynamics',           3, 4);

-- ========== PREREQUISITES ==========
INSERT INTO Prerequisites (main_course_id, prereq_course_id) VALUES
('CS301', 'CS201'),
('CS203', 'CS201');

-- ========== COURSE OFFERINGS (current semester: year 2026, sem 4) ==========
INSERT INTO Course_Offerings (course_offering_id, faculty_id, course_id, year_offering, semester, discipline_id, capacity) VALUES
(1, 'FAC001', 'CS201', 2026, 4, 'CSE', 60),
(2, 'FAC003', 'CS202', 2026, 4, 'CSE', 60),
(3, 'FAC001', 'CS203', 2026, 4, 'CSE', 45),
(4, 'FAC002', 'EE201', 2026, 4, 'EE',  50),
(5, 'FAC002', 'EE202', 2026, 4, 'EE',  50),
(6, 'FAC003', 'CS301', 2026, 6, 'CSE', 40),
(7, 'FAC001', 'CS201', 2026, 2, 'CSE', 60);

-- ========== COURSE ALLOTTED ==========
INSERT INTO Course_Allotted (student_id, course_offering_id, mid_sem_marks, end_sem_marks) VALUES
('STU001', 1, 38, 72),
('STU001', 2, 42, 85),
('STU001', 3, 35, 68),
('STU002', 1, 45, 90),
('STU002', 2, 40, 78),
('STU003', 4, 36, 70),
('STU003', 5, 30, 65),
('STU004', 7, 44, NULL);

-- ========== ROOMS ==========
INSERT INTO Rooms (building_name, room_number, capacity) VALUES
('Academic Block 1', 101, 60),
('Academic Block 1', 102, 60),
('Academic Block 1', 201, 45),
('Academic Block 2', 101, 50),
('Academic Block 2', 201, 40);

-- ========== SCHEDULED CLASSES (timetable) ==========
INSERT INTO Scheduled_class (course_offering_id, start_time, end_time, scheduled_day, building_name, room_number) VALUES
(1, '09:00', '10:00', 'Monday',    'Academic Block 1', 101),
(1, '09:00', '10:00', 'Wednesday', 'Academic Block 1', 101),
(2, '10:00', '11:00', 'Monday',    'Academic Block 1', 102),
(2, '10:00', '11:00', 'Thursday',  'Academic Block 1', 102),
(3, '11:00', '12:00', 'Tuesday',   'Academic Block 1', 201),
(3, '11:00', '12:00', 'Friday',    'Academic Block 1', 201),
(4, '09:00', '10:00', 'Tuesday',   'Academic Block 2', 101),
(4, '09:00', '10:00', 'Thursday',  'Academic Block 2', 101),
(5, '10:00', '11:00', 'Wednesday', 'Academic Block 2', 101),
(7, '14:00', '15:00', 'Monday',    'Academic Block 1', 101),
(7, '14:00', '15:00', 'Wednesday', 'Academic Block 1', 101);

-- ========== ATTENDANCE ==========
INSERT INTO Attendance (student_id, course_offering_id, class_date, status) VALUES
('STU001', 1, '2026-03-02', 'Present'),
('STU001', 1, '2026-03-04', 'Present'),
('STU001', 1, '2026-03-09', 'Absent'),
('STU001', 1, '2026-03-11', 'Present'),
('STU001', 2, '2026-03-02', 'Present'),
('STU001', 2, '2026-03-05', 'Present'),
('STU001', 3, '2026-03-03', 'Present'),
('STU001', 3, '2026-03-06', 'Absent'),
('STU002', 1, '2026-03-02', 'Present'),
('STU002', 1, '2026-03-04', 'Present'),
('STU002', 1, '2026-03-09', 'Present'),
('STU002', 2, '2026-03-02', 'Present'),
('STU002', 2, '2026-03-05', 'Absent'),
('STU003', 4, '2026-03-03', 'Present'),
('STU003', 4, '2026-03-05', 'Present'),
('STU003', 5, '2026-03-04', 'Absent'),
('STU004', 7, '2026-03-02', 'Present'),
('STU004', 7, '2026-03-04', 'Present');

-- ========== GRADES (for previous semesters / completed courses) ==========
INSERT INTO Grades (student_id, course_offering_id, grade) VALUES
('STU001', 1, 'B'),
('STU001', 2, 'A'),
('STU001', 3, 'B'),
('STU002', 1, 'Ex'),
('STU002', 2, 'A'),
('STU003', 4, 'B'),
('STU003', 5, 'C');

-- ========== RESULTS ==========
INSERT INTO Results (student_id, cgpa, total_credits) VALUES
('STU001', 8.20, 44),
('STU002', 9.10, 44),
('STU003', 7.50, 44),
('STU004', 0.00, 0);

-- ========== BALANCE ==========
INSERT INTO Balance (student_id, remaining_balance) VALUES
('STU001', 150000),
('STU002', 0),
('STU003', 140000),
('STU004', 150000);

-- ========== FEE PAYMENTS ==========
INSERT INTO Fee_Payment (payment_id, student_id, semester, amount_paid, payment_date) VALUES
(1, 'STU002', 1, 150000, '2023-08-01'),
(2, 'STU002', 2, 150000, '2024-01-10'),
(3, 'STU002', 3, 150000, '2024-07-15'),
(4, 'STU002', 4, 150000, '2025-01-12');

-- ========== EXAMS ==========
INSERT INTO Exams (exam_id, course_offering_id, room_number, building_name, date_of_exam) VALUES
(1, 1, 101, 'Academic Block 1', '2026-05-10'),
(2, 2, 102, 'Academic Block 1', '2026-05-12'),
(3, 3, 201, 'Academic Block 1', '2026-05-14'),
(4, 4, 101, 'Academic Block 2', '2026-05-11'),
(5, 7, 101, 'Academic Block 1', '2026-05-15');

-- ========== EXAM SEATING ==========
INSERT INTO Exam_Seating (exam_id, student_id) VALUES
(1, 'STU001'), (1, 'STU002'),
(2, 'STU001'), (2, 'STU002'),
(3, 'STU001'),
(4, 'STU003'),
(5, 'STU004');

-- ========== LEAVE REQUESTS ==========
INSERT INTO Leave_Requests (student_id, start_date, end_date, reason, status) VALUES
('STU001', '2026-03-20', '2026-03-22', 'Family function', 'Approved'),
('STU002', '2026-04-01', '2026-04-03', 'Medical appointment', 'Pending'),
('STU003', '2026-03-15', '2026-03-16', 'Personal work', 'Rejected');

-- ========== COURSE REGISTRATION ==========
INSERT INTO Course_Registration (student_id, course_offering_id, semester, selected, approved) VALUES
('STU001', 1, 4, TRUE, TRUE),
('STU001', 2, 4, TRUE, TRUE),
('STU001', 3, 4, TRUE, TRUE),
('STU002', 1, 4, TRUE, TRUE),
('STU002', 2, 4, TRUE, TRUE),
('STU003', 4, 4, TRUE, TRUE),
('STU003', 5, 4, TRUE, TRUE),
('STU004', 7, 2, TRUE, FALSE);

-- ========== FEEDBACK ==========
INSERT INTO Feedback (student_id, course_offering_id, feedback) VALUES
('STU001', 1, 'Excellent teaching methodology. Very clear explanations.'),
('STU002', 1, 'Great course! Assignments were very helpful.'),
('STU001', 2, 'Good course content but pace was a bit fast.');

-- ========== BACKLOGS ==========
INSERT INTO Backlogs (student_id, course_id) VALUES
('STU003', 'EE202');

-- ========== SUPPLEMENTARY EXAMS ==========
INSERT INTO Supplementary_exams (student_id, course_offering_id, price) VALUES
('STU003', 5, 5000);

-- ========== CDC (Campus Drive) ==========
INSERT INTO CDC (company_name, apply_link, job_type, cgpa_cutoff, ot_link, interview_link) VALUES
('Google India',   'https://careers.google.com',   'Placement', 8.00, 'https://ot.google.com',   'https://meet.google.com/abc'),
('Microsoft',      'https://careers.microsoft.com', 'Intern',    7.50, 'https://ot.microsoft.com', 'https://teams.microsoft.com/xyz');

INSERT INTO CDC_Eligible_Departments (cdc_id, department_id) VALUES
(1, 1), (1, 2),
(2, 1);

INSERT INTO CDC_Applications (student_id, cdc_id, resume_link, ot_status, interview_status, final_status) VALUES
('STU001', 1, 'https://resume.stu001.pdf', 'Qualified', 'Pending', 'Pending'),
('STU002', 1, 'https://resume.stu002.pdf', 'Qualified', 'Qualified', 'Selected');

-- ========== BANK: CUSTOMERS (bcrypt hash of 'Demo@123') ==========
-- Hash generated for password: Demo@123
INSERT INTO Customers (name, email, phone, password) VALUES
('Arjun Reddy',    'arjun@bank.com',  '8001000001', '$2b$10$1D.7LPaX3HIfvzZjx8LIYOaeFZ3znd5gMs9LnmGIpi92AG1lcWST2'),
('Sneha Patel',    'sneha@bank.com',  '8001000002', '$2b$10$1D.7LPaX3HIfvzZjx8LIYOaeFZ3znd5gMs9LnmGIpi92AG1lcWST2'),
('College Account', 'college@iitbbs.ac.in', '9000000000', '$2b$10$1D.7LPaX3HIfvzZjx8LIYOaeFZ3znd5gMs9LnmGIpi92AG1lcWST2');

-- ========== BANK: ACCOUNTS ==========
-- College account gets ID 999 (used by payment flow)
INSERT INTO Accounts (account_id, customer_id, balance, account_type, status) VALUES
(999, 3, 0, 'current', 'active');

INSERT INTO Accounts (customer_id, balance, account_type, status) VALUES
(1, 500000.00, 'savings', 'active'),
(2, 300000.00, 'savings', 'active');

-- ========== VERIFICATION ==========
SELECT 'Demo data loaded! Login credentials:' AS info
UNION ALL SELECT '---'
UNION ALL SELECT 'EIMS Student: STU001 / Student@1'
UNION ALL SELECT 'EIMS Student: STU002 / Student@2'
UNION ALL SELECT 'EIMS Faculty: FAC001 / Faculty@1'
UNION ALL SELECT 'EIMS Admin:   admin01 / Admin@123'
UNION ALL SELECT '---'
UNION ALL SELECT 'Bank: arjun@bank.com / Demo@123'
UNION ALL SELECT 'Bank: sneha@bank.com / Demo@123';
