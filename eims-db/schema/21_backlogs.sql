-- Backlogs table
-- Tracks courses that students must retake

CREATE TABLE Backlogs (
    student_id TEXT,
    course_id TEXT,

    PRIMARY KEY(student_id, course_id)
);