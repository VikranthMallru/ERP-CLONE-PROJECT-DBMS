-- Attendance table
-- Stores attendance records for each class session

CREATE TABLE Attendance (
    student_id TEXT,
    course_offering_id INT,
    class_date DATE,
    status VARCHAR(10) CHECK (status IN ('Present', 'Absent', 'On_Leave')),

    PRIMARY KEY(student_id, course_offering_id, class_date)
);