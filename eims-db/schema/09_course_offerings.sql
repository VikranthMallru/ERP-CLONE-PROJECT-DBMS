-- Course Offerings table
-- Represents a specific offering of a course in a semester

CREATE TABLE Course_Offerings (
    course_offering_id INT PRIMARY KEY,
    faculty_id TEXT,
    course_id TEXT,
    year_offering INT,
    semester INT,
    discipline_id TEXT,
    capacity INT CHECK (capacity > 0)
);