-- Scheduled Class table
-- Stores weekly class schedule for course offerings

CREATE TABLE booked_class (
  booking_id SERIAL PRIMARY KEY,
  course_offering_id INT,
  building_name TEXT NOT NULL,
  room_number INT NOT NULL,
  scheduled_day TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  faculty_id TEXT,

  FOREIGN KEY (course_offering_id)
  REFERENCES Course_Offerings(course_offering_id)

  CHECK (start_time < end_time)
);