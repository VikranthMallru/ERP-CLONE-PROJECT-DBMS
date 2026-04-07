-- Students table
-- Stores student personal and academic information

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