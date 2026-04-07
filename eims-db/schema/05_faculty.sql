-- Faculty table
-- Stores faculty member details

CREATE TABLE Faculty (
    faculty_id TEXT PRIMARY KEY,
    faculty_name VARCHAR(30),
    contact_no VARCHAR(10),
    email TEXT,
    department_id INT
);