-- Exam locations for a course_offering

CREATE TABLE Exams (
    exam_id INT PRIMARY KEY,
    course_offering_id INT NOT NULL,
    room_number INT,
    building_name TEXT NOT NULL,
    date_of_exam DATE NOT NULL
);