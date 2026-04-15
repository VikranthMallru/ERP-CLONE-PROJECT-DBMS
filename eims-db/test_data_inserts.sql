-- Test Data Insert Script for EIMS
-- Insert order respects foreign key dependencies

-- 1. USERS
INSERT INTO Users (user_id, password, role) VALUES
('admin1', 'pass1', 'Admin'),
('faculty1', 'pass2', 'Faculty'),
('faculty2', 'pass3', 'Faculty'),
('faculty3', 'pass4', 'Faculty'),
('student1', 'pass5', 'Student'),
('student2', 'pass6', 'Student'),
('student3', 'pass7', 'Student'),
('student4', 'pass8', 'Student'),
('student5', 'pass9', 'Student'),
('student6', 'pass10', 'Student');

-- 2. DEPARTMENTS
INSERT INTO Departments (dept_id, dept_name, head_dept_id) VALUES
(1, 'Computer Science', null),
(2, 'Electrical', null),
(3, 'Mechanical', null),
(4, 'Civil', NULL),
(5, 'Chemical', NULL),
(6, 'Mathematics', NULL),
(7, 'Physics', NULL),
(8, 'Biotechnology', NULL),
(9, 'Aerospace', NULL),
(10, 'Metallurgy', NULL);

-- 3. DISCIPLINE
INSERT INTO Discipline (discipline_id, max_semester, fees) VALUES
('B.Tech', 8, 100000),
('M.Tech', 4, 120000),
('PhD', 6, 50000),
('MSc', 4, 90000),
('MBA', 4, 110000),
('BSc', 6, 70000),
('Diploma', 6, 40000),
('PGD', 2, 60000),
('MCA', 4, 95000),
('BBA', 6, 80000);

-- 4. ROOMS
INSERT INTO Rooms (building_name, room_number, capacity) VALUES
('Main', 101, 60),
('Main', 102, 60),
('Annex', 201, 40),
('Annex', 202, 40),
('BlockA', 301, 50),
('BlockA', 302, 50),
('BlockB', 401, 45),
('BlockB', 402, 45),
('BlockC', 501, 35),
('BlockC', 502, 35);

-- 5. COURSES
INSERT INTO Courses (course_id, course_name, department_id, credits) VALUES
('CS101', 'Intro to CS', 1, 4),
('CS102', 'Data Structures', 1, 4),
('CS103', 'Algorithms', 1, 4),
('EE101', 'Circuits', 2, 3),
('ME101', 'Thermodynamics', 3, 3),
('CE101', 'Structural Engg', 4, 3),
('CH101', 'Organic Chem', 5, 3),
('MA101', 'Calculus', 6, 4),
('PH101', 'Physics I', 7, 4),
('BT101', 'Biotech Basics', 8, 3);

-- 6. FACULTY
INSERT INTO Faculty (faculty_id, faculty_name, contact_no, email, department_id) VALUES
('faculty1', 'Dr. Alice', '9000000001', 'alice@univ.edu', 1),
('faculty2', 'Dr. Bob', '9000000002', 'bob@univ.edu', 2),
('faculty3', 'Dr. Carol', '9000000003', 'carol@univ.edu', 3),
('faculty4', 'Dr. Dave', '9000000004', 'dave@univ.edu', 4),
('faculty5', 'Dr. Eve', '9000000005', 'eve@univ.edu', 5),
('faculty6', 'Dr. Frank', '9000000006', 'frank@univ.edu', 6),
('faculty7', 'Dr. Grace', '9000000007', 'grace@univ.edu', 7),
('faculty8', 'Dr. Heidi', '9000000008', 'heidi@univ.edu', 8),
('faculty9', 'Dr. Ivan', '9000000009', 'ivan@univ.edu', 9),
('faculty10', 'Dr. Judy', '9000000010', 'judy@univ.edu', 10);

-- 7. STUDENTS
INSERT INTO Students (student_id, student_name, contact_no, college_email, personal_email, residence_address, join_date, semester, department_id, discipline_id) VALUES
('student1', 'John Doe', '8000000001', 'john1@univ.edu', 'john1@gmail.com', 'Addr1', '2022-08-01', 2, 1, 'B.Tech'),
('student2', 'Jane Roe', '8000000002', 'jane2@univ.edu', 'jane2@gmail.com', 'Addr2', '2022-08-01', 2, 1, 'B.Tech'),
('student3', 'Jim Beam', '8000000003', 'jim3@univ.edu', 'jim3@gmail.com', 'Addr3', '2022-08-01', 2, 2, 'B.Tech'),
('student4', 'Jill Hill', '8000000004', 'jill4@univ.edu', 'jill4@gmail.com', 'Addr4', '2022-08-01', 2, 2, 'B.Tech'),
('student5', 'Jack Black', '8000000005', 'jack5@univ.edu', 'jack5@gmail.com', 'Addr5', '2022-08-01', 2, 3, 'B.Tech'),
('student6', 'Jenny Lake', '8000000006', 'jenny6@univ.edu', 'jenny6@gmail.com', 'Addr6', '2022-08-01', 2, 3, 'B.Tech'),
('student7', 'Joe Root', '8000000007', 'joe7@univ.edu', 'joe7@gmail.com', 'Addr7', '2022-08-01', 2, 4, 'B.Tech'),
('student8', 'Jess West', '8000000008', 'jess8@univ.edu', 'jess8@gmail.com', 'Addr8', '2022-08-01', 2, 4, 'B.Tech'),
('student9', 'Jerry East', '8000000009', 'jerry9@univ.edu', 'jerry9@gmail.com', 'Addr9', '2022-08-01', 2, 5, 'B.Tech'),
('student10', 'Julia North', '8000000010', 'julia10@univ.edu', 'julia10@gmail.com', 'Addr10', '2022-08-01', 2, 5, 'B.Tech');

-- 8. FACULTY_ADVISOR
INSERT INTO Faculty_Advisor (student_id, faculty_id) VALUES
('student1', 'faculty1'),
('student2', 'faculty1'),
('student3', 'faculty2'),
('student4', 'faculty2'),
('student5', 'faculty3'),
('student6', 'faculty3'),
('student7', 'faculty4'),
('student8', 'faculty4'),
('student9', 'faculty5'),
('student10', 'faculty5');

-- 9. PREREQUISITES
INSERT INTO Prerequisites (main_course_id, prereq_course_id) VALUES
('CS102', 'CS101'),
('CS103', 'CS102'),
('EE101', 'MA101'),
('ME101', 'PH101'),
('CE101', 'MA101'),
('CH101', 'MA101'),
('BT101', 'CH101'),
('CS103', 'MA101'),
('CS102', 'MA101'),
('PH101', 'MA101');

-- 10. COURSE_OFFERINGS
INSERT INTO Course_Offerings (course_offering_id, faculty_id, course_id, year_offering, semester, discipline_id, capacity) VALUES
(1, 'faculty1', 'CS101', 2026, 2, 'B.Tech', 60),
(2, 'faculty1', 'CS102', 2026, 2, 'B.Tech', 60),
(3, 'faculty2', 'EE101', 2026, 2, 'B.Tech', 60),
(4, 'faculty3', 'ME101', 2026, 2, 'B.Tech', 60),
(5, 'faculty4', 'CE101', 2026, 2, 'B.Tech', 60),
(6, 'faculty5', 'CH101', 2026, 2, 'B.Tech', 60),
(7, 'faculty6', 'MA101', 2026, 2, 'B.Tech', 60),
(8, 'faculty7', 'PH101', 2026, 2, 'B.Tech', 60),
(9, 'faculty8', 'BT101', 2026, 2, 'B.Tech', 60),
(10, 'faculty9', 'CS103', 2026, 2, 'B.Tech', 60);

-- 11. COURSE_ALLOTTED
INSERT INTO Course_Allotted (student_id, course_offering_id, mid_sem_marks, end_sem_marks) VALUES
('student1', 1, 20, 40),
('student2', 1, 18, 38),
('student3', 2, 19, 39),
('student4', 2, 17, 37),
('student5', 3, 16, 36),
('student6', 3, 15, 35),
('student7', 4, 14, 34),
('student8', 4, 13, 33),
('student9', 5, 12, 32),
('student10', 5, 11, 31);

-- 12. ATTENDANCE
INSERT INTO Attendance (student_id, course_offering_id, class_date, status) VALUES
('student1', 1, '2026-03-01', 'Present'),
('student2', 1, '2026-03-01', 'Absent'),
('student3', 2, '2026-03-01', 'Present'),
('student4', 2, '2026-03-01', 'Present'),
('student5', 3, '2026-03-01', 'On_Leave'),
('student6', 3, '2026-03-01', 'Present'),
('student7', 4, '2026-03-01', 'Absent'),
('student8', 4, '2026-03-01', 'Present'),
('student9', 5, '2026-03-01', 'Present'),
('student10', 5, '2026-03-01', 'Present');

-- 13. GRADES
INSERT INTO Grades (student_id, course_offering_id, grade) VALUES
('student1', 1, 'A'),
('student2', 1, 'B'),
('student3', 2, 'C'),
('student4', 2, 'D'),
('student5', 3, 'E'),
('student6', 3, 'P'),
('student7', 4, 'F'),
('student8', 4, 'A'),
('student9', 5, 'B'),
('student10', 5, 'C');

-- 14. FEEDBACK
INSERT INTO Feedback (student_id, course_offering_id, feedback) VALUES
('student1', 1, 'Good'),
('student2', 1, 'Average'),
('student3', 2, 'Excellent'),
('student4', 2, 'Poor'),
('student5', 3, 'Good'),
('student6', 3, 'Average'),
('student7', 4, 'Excellent'),
('student8', 4, 'Poor'),
('student9', 5, 'Good'),
('student10', 5, 'Average');

-- 15. SCHEDULED_CLASS
INSERT INTO Scheduled_class (course_offering_id, start_time, end_time, scheduled_day, building_name, room_number) VALUES
(1, '09:00', '10:00', 'Monday', 'Main', 101),
(2, '10:00', '11:00', 'Tuesday', 'Main', 102),
(3, '11:00', '12:00', 'Wednesday', 'Annex', 201),
(4, '12:00', '13:00', 'Thursday', 'Annex', 202),
(5, '13:00', '14:00', 'Friday', 'BlockA', 301),
(6, '14:00', '15:00', 'Monday', 'BlockA', 302),
(7, '15:00', '16:00', 'Tuesday', 'BlockB', 401),
(8, '16:00', '17:00', 'Wednesday', 'BlockB', 402),
(9, '17:00', '18:00', 'Thursday', 'BlockC', 501),
(10, '18:00', '19:00', 'Friday', 'BlockC', 502);

-- 16. LEAVE_REQUESTS
INSERT INTO Leave_Requests (request_id, student_id, start_date, end_date, reason, applied_on, status) VALUES
(1, 'student1', '2026-03-10', '2026-03-12', 'Medical', '2026-03-01 10:00', 'Pending'),
(2, 'student2', '2026-03-11', '2026-03-13', 'Personal', '2026-03-02 11:00', 'Approved'),
(3, 'student3', '2026-03-12', '2026-03-14', 'Medical', '2026-03-03 12:00', 'Rejected'),
(4, 'student4', '2026-03-13', '2026-03-15', 'Other', '2026-03-04 13:00', 'Pending'),
(5, 'student5', '2026-03-14', '2026-03-16', 'Personal', '2026-03-05 14:00', 'Approved'),
(6, 'student6', '2026-03-15', '2026-03-17', 'Medical', '2026-03-06 15:00', 'Rejected'),
(7, 'student7', '2026-03-16', '2026-03-18', 'Other', '2026-03-07 16:00', 'Pending'),
(8, 'student8', '2026-03-17', '2026-03-19', 'Personal', '2026-03-08 17:00', 'Approved'),
(9, 'student9', '2026-03-18', '2026-03-20', 'Medical', '2026-03-09 18:00', 'Rejected'),
(10, 'student10', '2026-03-19', '2026-03-21', 'Other', '2026-03-10 19:00', 'Pending');

-- 17. ON_LEAVE
INSERT INTO On_leave (student_id, start_date, end_date, request_id) VALUES
('student1', '2026-03-10', '2026-03-12', 1),
('student2', '2026-03-11', '2026-03-13', 2),
('student3', '2026-03-12', '2026-03-14', 3),
('student4', '2026-03-13', '2026-03-15', 4),
('student5', '2026-03-14', '2026-03-16', 5),
('student6', '2026-03-15', '2026-03-17', 6),
('student7', '2026-03-16', '2026-03-18', 7),
('student8', '2026-03-17', '2026-03-19', 8),
('student9', '2026-03-18', '2026-03-20', 9),
('student10', '2026-03-19', '2026-03-21', 10);

-- 18. FEE_PAYMENT
INSERT INTO Fee_Payment (payment_id, student_id, semester, amount_paid, payment_date) VALUES
(1, 'student1', 2, 100000, '2026-03-01'),
(2, 'student2', 2, 100000, '2026-03-01'),
(3, 'student3', 2, 100000, '2026-03-01'),
(4, 'student4', 2, 100000, '2026-03-01'),
(5, 'student5', 2, 100000, '2026-03-01'),
(6, 'student6', 2, 100000, '2026-03-01'),
(7, 'student7', 2, 100000, '2026-03-01'),
(8, 'student8', 2, 100000, '2026-03-01'),
(9, 'student9', 2, 100000, '2026-03-01'),
(10, 'student10', 2, 100000, '2026-03-01');

-- 19. FEE_REMISSION_APPLICATION
INSERT INTO Fee_Remission_Application (application_id, student_id, status) VALUES
(1, 'student1', 'Pending'),
(2, 'student2', 'Approved'),
(3, 'student3', 'Rejected'),
(4, 'student4', 'Pending'),
(5, 'student5', 'Approved'),
(6, 'student6', 'Rejected'),
(7, 'student7', 'Pending'),
(8, 'student8', 'Approved'),
(9, 'student9', 'Rejected'),
(10, 'student10', 'Pending');

-- 20. SUPPLEMENTARY_EXAMS
INSERT INTO Supplementary_exams (student_id, course_offering_id, price) VALUES
('student1', 1, 2000),
('student2', 2, 2000),
('student3', 3, 2000),
('student4', 4, 2000),
('student5', 5, 2000),
('student6', 6, 2000),
('student7', 7, 2000),
('student8', 8, 2000),
('student9', 9, 2000),
('student10', 10, 2000);

-- 21. BACKLOGS
INSERT INTO Backlogs (student_id, course_id) VALUES
('student1', 'CS102'),
('student2', 'CS103'),
('student3', 'EE101'),
('student4', 'ME101'),
('student5', 'CE101'),
('student6', 'CH101'),
('student7', 'MA101'),
('student8', 'PH101'),
('student9', 'BT101'),
('student10', 'CS101');

-- 22. EXAMS
INSERT INTO Exams (exam_id, course_offering_id, room_number, building_name, date_of_exam) VALUES
(1, 1, 101, 'Main', '2026-04-01'),
(2, 2, 102, 'Main', '2026-04-02'),
(3, 3, 201, 'Annex', '2026-04-03'),
(4, 4, 202, 'Annex', '2026-04-04'),
(5, 5, 301, 'BlockA', '2026-04-05'),
(6, 6, 302, 'BlockA', '2026-04-06'),
(7, 7, 401, 'BlockB', '2026-04-07'),
(8, 8, 402, 'BlockB', '2026-04-08'),
(9, 9, 501, 'BlockC', '2026-04-09'),
(10, 10, 502, 'BlockC', '2026-04-10');

-- 23. EXAM_SEATING
INSERT INTO Exam_Seating (exam_id, student_id) VALUES
(1, 'student1'),
(2, 'student2'),
(3, 'student3'),
(4, 'student4'),
(5, 'student5'),
(6, 'student6'),
(7, 'student7'),
(8, 'student8'),
(9, 'student9'),
(10, 'student10');

-- 24. BALANCE
INSERT INTO Balance (student_id, remaining_balance) VALUES
('student1', 5000),
('student2', 4000),
('student3', 3000),
('student4', 2000),
('student5', 1000),
('student6', 0),
('student7', 6000),
('student8', 7000),
('student9', 8000),
('student10', 9000);

-- 25. COURSE_REGISTRATION
INSERT INTO Course_Registration (student_id, course_offering_id, semester, selected, approved) VALUES
('student1', 1, 2, TRUE, TRUE),
('student2', 2, 2, TRUE, TRUE),
('student3', 3, 2, TRUE, TRUE),
('student4', 4, 2, TRUE, TRUE),
('student5', 5, 2, TRUE, TRUE),
('student6', 6, 2, TRUE, TRUE),
('student7', 7, 2, TRUE, TRUE),
('student8', 8, 2, TRUE, TRUE),
('student9', 9, 2, TRUE, TRUE),
('student10', 10, 2, TRUE, TRUE);

-- More inserts for dependent tables will follow below...
