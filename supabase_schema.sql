-- ========================================
-- COMBINED DATABASE SCHEMA
-- EIMS + BANK DATABASE
-- Run this in Supabase SQL Editor
-- ========================================

CREATE TABLE Users (
    user_id TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    role VARCHAR(10) CHECK (role IN ('Admin','Faculty','Student'))
);

CREATE TABLE Departments (
    dept_id INT PRIMARY KEY,
    dept_name TEXT NOT NULL,
    head_dept_id TEXT
);

CREATE TABLE Discipline (
    discipline_id TEXT PRIMARY KEY,
    max_semester INT,
    fees NUMERIC
);

CREATE TABLE Students (
    student_id TEXT PRIMARY KEY,
    student_name TEXT,
    contact_no VARCHAR(10),
    college_email TEXT,
    personal_email TEXT,
    residence_address TEXT,
    join_date DATE,
    semester INT,
    department_id INT,
    discipline_id TEXT
);

CREATE TABLE Faculty (
    faculty_id TEXT PRIMARY KEY,
    faculty_name VARCHAR(30),
    contact_no VARCHAR(10),
    email TEXT,
    department_id INT
);

CREATE TABLE Faculty_Advisor (
    student_id TEXT PRIMARY KEY,
    faculty_id TEXT
);

CREATE TABLE Courses (
    course_id TEXT PRIMARY KEY,
    course_name TEXT,
    department_id INT,
    credits INT CHECK (credits > 0)
);

CREATE TABLE Prerequisites (
    main_course_id TEXT,
    prereq_course_id TEXT,
    PRIMARY KEY(main_course_id, prereq_course_id)
);

CREATE TABLE Course_Offerings (
    course_offering_id INT PRIMARY KEY,
    faculty_id TEXT,
    course_id TEXT,
    year_offering INT,
    semester INT,
    discipline_id TEXT,
    capacity INT CHECK (capacity > 0)
);

CREATE TABLE Course_Allotted (
    student_id TEXT,
    course_offering_id INT,
    mid_sem_marks INT,
    end_sem_marks INT,
    PRIMARY KEY(student_id, course_offering_id)
);

CREATE TABLE Attendance (
    student_id TEXT,
    course_offering_id INT,
    class_date DATE,
    status VARCHAR(10) CHECK (status IN ('Present', 'Absent', 'On_Leave')),
    PRIMARY KEY(student_id, course_offering_id, class_date)
);

CREATE TABLE Grades (
    student_id TEXT,
    course_offering_id INT,
    grade VARCHAR(2) CHECK (grade IN ('Ex','A','B','C','D','E','P','F')),
    PRIMARY KEY(student_id, course_offering_id)
);

CREATE TABLE Feedback (
    student_id TEXT,
    course_offering_id INT,
    feedback TEXT,
    PRIMARY KEY(student_id, course_offering_id)
);

CREATE TABLE Rooms (
    building_name TEXT,
    room_number INT,
    capacity INT CHECK (capacity > 0),
    PRIMARY KEY(building_name, room_number)
);

CREATE TABLE Scheduled_class (
    course_offering_id INT,
    start_time TIME,
    end_time TIME,
    scheduled_day VARCHAR(10) CHECK (scheduled_day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday')),
    building_name TEXT,
    room_number INT,
    PRIMARY KEY(course_offering_id, scheduled_day, start_time)
);

CREATE TABLE Leave_Requests (
    request_id SERIAL PRIMARY KEY,
    student_id TEXT,
    start_date DATE,
    end_date DATE,
    reason TEXT,
    applied_on TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) CHECK (status IN ('Pending','Approved','Rejected'))
);

CREATE TABLE On_leave (
    student_id TEXT,
    start_date DATE,
    end_date DATE,
    request_id INT,
    PRIMARY KEY(request_id)
);

CREATE TABLE Fee_Payment (
    payment_id INT PRIMARY KEY,
    student_id TEXT,
    semester INT,
    amount_paid NUMERIC CHECK (amount_paid >= 0),
    payment_date DATE
);

CREATE TABLE Fee_Remission_Application (
    application_id INT PRIMARY KEY,
    student_id TEXT,
    status VARCHAR(20) CHECK (status IN ('Pending', 'Approved', 'Rejected'))
);

CREATE TABLE Supplementary_exams (
    student_id TEXT,
    course_offering_id INT,
    price NUMERIC CHECK (price >= 0),
    PRIMARY KEY(student_id, course_offering_id)
);

CREATE TABLE Backlogs (
    student_id TEXT,
    course_id TEXT,
    PRIMARY KEY(student_id, course_id)
);

CREATE TABLE Exams (
    exam_id INT PRIMARY KEY,
    course_offering_id INT NOT NULL,
    room_number INT,
    building_name TEXT NOT NULL,
    date_of_exam DATE NOT NULL
);

CREATE TABLE Exam_Seating (
    exam_id INT,
    student_id TEXT,
    PRIMARY KEY (exam_id, student_id)
);

CREATE TABLE Balance(
    student_id TEXT PRIMARY KEY,
    remaining_balance INT CHECK (remaining_balance>=0)
);

CREATE TABLE Course_Registration (
    student_id TEXT,
    course_offering_id INT,
    semester INT,
    selected BOOLEAN DEFAULT FALSE,
    approved BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (student_id, course_offering_id, semester)
);

CREATE TABLE System_Config (
    config_id INT PRIMARY KEY CHECK (config_id = 1),
    registration_open_date DATE,
    registration_close_date DATE,
    results_declaration_date DATE,
    is_fees_open BOOLEAN
);

CREATE TABLE Results (
    student_id TEXT PRIMARY KEY,
    cgpa NUMERIC(3,2) CHECK (cgpa BETWEEN 0 AND 10),
    total_credits INT CHECK (total_credits >= 0)
);

CREATE TABLE CDC (
    cdc_id SERIAL PRIMARY KEY,
    company_name TEXT,
    apply_link TEXT,
    job_type VARCHAR(10) CHECK (job_type IN ('Intern','Placement')),
    cgpa_cutoff NUMERIC(3,2),
    ot_link TEXT,
    interview_link TEXT
);

CREATE TABLE CDC_Eligible_Departments (
    cdc_id INT,
    department_id INT,
    PRIMARY KEY (cdc_id, department_id)
);

CREATE TABLE CDC_Applications (
    student_id TEXT,
    cdc_id INT,
    resume_link TEXT,
    ot_status VARCHAR(15) CHECK (ot_status IN ('Pending','Qualified','Rejected')),
    interview_status VARCHAR(15) CHECK (interview_status IN ('Pending','Qualified','Rejected')),
    final_status VARCHAR(15) CHECK (final_status IN ('Selected','Rejected','Pending')),
    offer_details TEXT,
    PRIMARY KEY (student_id, cdc_id)
);

CREATE TABLE booked_class (
    booking_id SERIAL PRIMARY KEY,
    course_offering_id INT,
    building_name TEXT NOT NULL,
    room_number INT NOT NULL,
    scheduled_day TEXT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    faculty_id TEXT,
    booking_date DATE,
    FOREIGN KEY (course_offering_id) REFERENCES Course_Offerings(course_offering_id),
    CHECK (start_time < end_time)
);

-- ========================================
-- BANK SCHEMA
-- ========================================

CREATE TABLE Customers (
    customer_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    password VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Accounts (
    account_id SERIAL UNIQUE,
    customer_id INT PRIMARY KEY,
    balance NUMERIC(12,2) DEFAULT 0,
    account_type VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Transactions (
    transaction_id SERIAL PRIMARY KEY,
    account_id INT,
    transaction_type VARCHAR(20),
    amount NUMERIC(12,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT
);

CREATE TABLE Transfers (
    transfer_id SERIAL PRIMARY KEY,
    from_account INT,
    to_account INT,
    amount NUMERIC(12,2),
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
