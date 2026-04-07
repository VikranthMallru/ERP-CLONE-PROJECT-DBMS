-- =============================
-- USERS TABLE CONSTRAINTS
-- =============================



ALTER TABLE Users
ADD CONSTRAINT chk_user_role
CHECK (role IN ('Admin','Faculty','Student'));


-- =============================
-- FACULTY TABLE CONSTRAINTS
-- =============================

ALTER TABLE Faculty
ADD CONSTRAINT fk_faculty_user
FOREIGN KEY (faculty_id)
REFERENCES Users(user_id);

ALTER TABLE Faculty
ADD CONSTRAINT fk_faculty_department
FOREIGN KEY (department_id)
REFERENCES Departments(dept_id);


-- =============================
-- DEPARTMENT HEAD CONSTRAINT
-- =============================

ALTER TABLE Departments
ADD CONSTRAINT fk_department_head
FOREIGN KEY (head_dept_id)
REFERENCES Faculty(faculty_id);


-- =============================
-- STUDENTS TABLE CONSTRAINTS
-- =============================

ALTER TABLE Students
ADD CONSTRAINT fk_student_user
FOREIGN KEY (student_id)
REFERENCES Users(user_id);

ALTER TABLE Students
ADD CONSTRAINT fk_student_department
FOREIGN KEY (department_id)
REFERENCES Departments(dept_id);

ALTER TABLE Students
ADD CONSTRAINT fk_student_discipline
FOREIGN KEY (discipline_id)
REFERENCES Discipline(discipline_id);


-- =============================
-- FACULTY ADVISOR
-- =============================

ALTER TABLE Faculty_Advisor
ADD CONSTRAINT fk_advisor_student
FOREIGN KEY (student_id)
REFERENCES Students(student_id);

ALTER TABLE Faculty_Advisor
ADD CONSTRAINT fk_advisor_faculty
FOREIGN KEY (faculty_id)
REFERENCES Faculty(faculty_id);


-- =============================
-- COURSES
-- =============================

ALTER TABLE Courses
ADD CONSTRAINT fk_course_department
FOREIGN KEY (department_id)
REFERENCES Departments(dept_id);


-- =============================
-- PREREQUISITES
-- =============================

ALTER TABLE Prerequisites
ADD CONSTRAINT fk_prereq_main
FOREIGN KEY (main_course_id)
REFERENCES Courses(course_id);

ALTER TABLE Prerequisites
ADD CONSTRAINT fk_prereq_course
FOREIGN KEY (prereq_course_id)
REFERENCES Courses(course_id);


-- =============================
-- COURSE OFFERINGS
-- =============================

ALTER TABLE Course_Offerings
ADD CONSTRAINT fk_offering_faculty
FOREIGN KEY (faculty_id)
REFERENCES Faculty(faculty_id);

ALTER TABLE Course_Offerings
ADD CONSTRAINT fk_offering_course
FOREIGN KEY (course_id)
REFERENCES Courses(course_id);

ALTER TABLE Course_Offerings
ADD CONSTRAINT fk_offering_discipline
FOREIGN KEY (discipline_id)
REFERENCES Discipline(discipline_id);


-- =============================
-- COURSE ALLOTTED
-- =============================

ALTER TABLE Course_Allotted
ADD CONSTRAINT fk_allotted_student
FOREIGN KEY (student_id)
REFERENCES Students(student_id);

ALTER TABLE Course_Allotted
ADD CONSTRAINT fk_allotted_course
FOREIGN KEY (course_offering_id)
REFERENCES Course_Offerings(course_offering_id);

-- ❌ WRONG constraint removed (course_id, semester not present)


-- =============================
-- ATTENDANCE
-- =============================

ALTER TABLE Attendance
ADD CONSTRAINT fk_attendance_student
FOREIGN KEY (student_id)
REFERENCES Students(student_id);

ALTER TABLE Attendance
ADD CONSTRAINT fk_attendance_offering
FOREIGN KEY (course_offering_id)
REFERENCES Course_Offerings(course_offering_id);


-- =============================
-- GRADES
-- =============================

ALTER TABLE Grades
ADD CONSTRAINT fk_grades_student
FOREIGN KEY (student_id)
REFERENCES Students(student_id);

ALTER TABLE Grades
ADD CONSTRAINT fk_grades_offering
FOREIGN KEY (course_offering_id)
REFERENCES Course_Offerings(course_offering_id);


-- =============================
-- FEEDBACK
-- =============================

ALTER TABLE Feedback
ADD CONSTRAINT fk_feedback_student
FOREIGN KEY (student_id)
REFERENCES Students(student_id);

ALTER TABLE Feedback
ADD CONSTRAINT fk_feedback_offering
FOREIGN KEY (course_offering_id)
REFERENCES Course_Offerings(course_offering_id);


-- =============================
-- SCHEDULED CLASS
-- =============================

ALTER TABLE Scheduled_class
ADD CONSTRAINT fk_schedule_offering
FOREIGN KEY (course_offering_id)
REFERENCES Course_Offerings(course_offering_id);

ALTER TABLE Scheduled_class
ADD CONSTRAINT fk_schedule_room
FOREIGN KEY (building_name, room_number)
REFERENCES Rooms(building_name, room_number);


-- =============================
-- LEAVE REQUESTS
-- =============================

ALTER TABLE Leave_Requests
ADD CONSTRAINT fk_leave_student
FOREIGN KEY (student_id)
REFERENCES Students(student_id);


-- =============================
-- ON LEAVE
-- =============================

ALTER TABLE On_leave
ADD CONSTRAINT fk_onleave_student
FOREIGN KEY (student_id)
REFERENCES Students(student_id);

ALTER TABLE On_leave
ADD CONSTRAINT fk_onleave_request
FOREIGN KEY (request_id)
REFERENCES Leave_Requests(request_id);


-- =============================
-- FEE PAYMENT
-- =============================

ALTER TABLE Fee_Payment
ADD CONSTRAINT fk_fee_payment_student
FOREIGN KEY (student_id)
REFERENCES Students(student_id);


-- =============================
-- FEE REMISSION APPLICATION
-- =============================

ALTER TABLE Fee_Remission_Application
ADD CONSTRAINT fk_fee_remission_student
FOREIGN KEY (student_id)
REFERENCES Students(student_id);


-- =============================
-- SUPPLEMENTARY EXAMS
-- =============================

ALTER TABLE Supplementary_exams
ADD CONSTRAINT fk_supp_student
FOREIGN KEY (student_id)
REFERENCES Students(student_id);

ALTER TABLE Supplementary_exams
ADD CONSTRAINT fk_supp_offering
FOREIGN KEY (course_offering_id)
REFERENCES Course_Offerings(course_offering_id);


-- =============================
-- BACKLOGS
-- =============================

ALTER TABLE Backlogs
ADD CONSTRAINT fk_backlog_student
FOREIGN KEY (student_id)
REFERENCES Students(student_id);

ALTER TABLE Backlogs
ADD CONSTRAINT fk_backlog_course
FOREIGN KEY (course_id)
REFERENCES Courses(course_id);


-- =============================
-- EXAMS
-- =============================

ALTER TABLE Exams
ADD CONSTRAINT fk_exam_offering
FOREIGN KEY (course_offering_id)
REFERENCES Course_Offerings(course_offering_id);


-- =============================
-- EXAM SEATING
-- =============================

ALTER TABLE Exam_Seating
ADD CONSTRAINT fk_exam_seating_exam
FOREIGN KEY (exam_id)
REFERENCES Exams(exam_id);

ALTER TABLE Exam_Seating
ADD CONSTRAINT fk_exam_seating_student
FOREIGN KEY (student_id)
REFERENCES Students(student_id);


-- =============================
-- BALANCE
-- =============================

ALTER TABLE Balance
ADD CONSTRAINT fk_student_balance
FOREIGN KEY (student_id)
REFERENCES Students(student_id);


-- ==============================
-- CONSTRAINTS FOR Course_Registration
-- ==============================

ALTER TABLE Course_Registration
ADD CONSTRAINT fk_registration_student
FOREIGN KEY (student_id)
REFERENCES Students(student_id)
ON DELETE CASCADE;

ALTER TABLE Course_Registration
ADD CONSTRAINT fk_registration_course
FOREIGN KEY (course_offering_id)
REFERENCES Course_Offerings(course_offering_id)
ON DELETE CASCADE;

ALTER TABLE Course_Registration
ADD CONSTRAINT chk_selected_before_approval
CHECK (approved = FALSE OR selected = TRUE);


-- ==============================
-- CONSTRAINTS FOR Results
-- ==============================

ALTER TABLE Results
ADD CONSTRAINT fk_results_student
FOREIGN KEY (student_id)
REFERENCES Students(student_id);


-- ==============================
-- CONSTRAINTS FOR CDC ELIGIBLE DEPARTMENTS
-- ==============================

ALTER TABLE CDC_Eligible_Departments
ADD CONSTRAINT fk_cdc_dept_cdc
FOREIGN KEY (cdc_id)
REFERENCES CDC(cdc_id);

ALTER TABLE CDC_Eligible_Departments
ADD CONSTRAINT fk_cdc_dept_department
FOREIGN KEY (department_id)
REFERENCES Departments(dept_id);


-- ==============================
-- CONSTRAINTS FOR CDC Applications
-- ==============================

ALTER TABLE CDC_Applications
ADD CONSTRAINT fk_cdc_app_student
FOREIGN KEY (student_id)
REFERENCES Students(student_id);

ALTER TABLE CDC_Applications
ADD CONSTRAINT fk_cdc_app_cdc
FOREIGN KEY (cdc_id)
REFERENCES CDC(cdc_id);