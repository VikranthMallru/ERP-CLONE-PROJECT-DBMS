-- Scheduled Class table
-- Stores weekly class schedule for course offerings

CREATE TABLE Scheduled_class (
    course_offering_id INT,
    start_time TIME,
    end_time TIME,
    scheduled_day VARCHAR(10) CHECK (scheduled_day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday')),
    building_name TEXT,
    room_number INT,

    PRIMARY KEY(course_offering_id, scheduled_day, start_time)
);