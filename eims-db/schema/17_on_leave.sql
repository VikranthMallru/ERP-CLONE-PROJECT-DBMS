-- On Leave table
-- Tracks approved leave periods for students

CREATE TABLE On_leave (
    student_id TEXT,
    start_date DATE,
    end_date DATE,
    request_id INT,

    PRIMARY KEY(request_id)
);