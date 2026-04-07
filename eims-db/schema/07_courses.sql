-- Courses table
-- Stores course catalog information

CREATE TABLE Courses (
    course_id TEXT PRIMARY KEY,
    course_name TEXT,
    department_id INT,
    credits INT CHECK (credits > 0)
);