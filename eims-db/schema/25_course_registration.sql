-- Course Registration table

CREATE TABLE Course_Registration (
    student_id TEXT,
    course_offering_id INT,
    semester INT,
    selected BOOLEAN DEFAULT FALSE,
    approved BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (student_id, course_offering_id, semester)
);