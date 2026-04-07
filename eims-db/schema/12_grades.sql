-- Grades table
-- Stores final grades for each course enrollment

CREATE TABLE Grades (
    student_id TEXT,
    course_offering_id INT,
    grade VARCHAR(2) CHECK (grade IN ('Ex','A','B','C','D','E','P','F')),

    PRIMARY KEY(student_id, course_offering_id)
);