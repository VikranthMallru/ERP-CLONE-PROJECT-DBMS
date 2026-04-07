-- Supplementary Exams table
-- Stores supplementary exam registrations

CREATE TABLE Supplementary_exams (
    student_id TEXT,
    course_offering_id INT,
    price NUMERIC CHECK (price >= 0),

    PRIMARY KEY(student_id, course_offering_id)
);