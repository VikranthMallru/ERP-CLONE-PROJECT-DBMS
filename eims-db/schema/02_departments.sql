-- Departments table
-- Stores academic departments and their heads

CREATE TABLE Departments (
    dept_id INT PRIMARY KEY,
    dept_name TEXT NOT NULL,
    head_dept_id TEXT
);