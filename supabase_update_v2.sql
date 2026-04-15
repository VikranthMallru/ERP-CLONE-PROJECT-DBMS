-- supabase_update_v2.sql — Merge Shashi's bug fixes and enhancements
-- Run this in the Supabase SQL Editor

-- 1. Fix check_room_capacity() — check across ALL exams on same room+date
CREATE OR REPLACE FUNCTION check_room_capacity()
RETURNS TRIGGER AS $$
DECLARE
    room_cap INT;
    students INT;
    room_no INT;
    exam_date DATE;
    building TEXT;
BEGIN
    SELECT room_number, building_name, date_of_exam
    INTO room_no, building, exam_date
    FROM Exams
    WHERE exam_id = NEW.exam_id;

    SELECT capacity INTO room_cap
    FROM Rooms
    WHERE room_number = room_no
      AND building_name = building;

    SELECT COUNT(*) INTO students
    FROM Exam_Seating es
    JOIN Exams e ON e.exam_id = es.exam_id
    WHERE e.room_number = room_no
      AND e.building_name = building
      AND e.date_of_exam = exam_date;

    IF students + 1 > room_cap THEN
        RAISE EXCEPTION 'Room capacity exceeded for % % on %',
            building, room_no, exam_date;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Fix update_cgpa_all_students() — correct CGPA calculation
CREATE OR REPLACE FUNCTION update_cgpa_all_students()
RETURNS VOID AS $$
BEGIN

INSERT INTO Results (student_id, cgpa, total_credits)

SELECT 
    s.student_id,
    CASE 
        WHEN SUM(CASE WHEN g.grade <> 'F' THEN c.credits ELSE 0 END) = 0 THEN 0
        ELSE ROUND(
            SUM(
                c.credits *
                CASE g.grade
                    WHEN 'Ex' THEN 10
                    WHEN 'A' THEN 9
                    WHEN 'B' THEN 8
                    WHEN 'C' THEN 7
                    WHEN 'D' THEN 6
                    WHEN 'E' THEN 5
                    WHEN 'P' THEN 4
                    ELSE 0
                END
            )::NUMERIC / 
            SUM(CASE WHEN g.grade <> 'F' THEN c.credits ELSE 0 END)::NUMERIC, 
            2
        )
    END AS cgpa,
    SUM(
        CASE 
            WHEN g.grade <> 'F' THEN c.credits
            ELSE 0
        END
    ) AS total_credits

FROM Students s
JOIN Grades g ON s.student_id = g.student_id
JOIN Course_Offerings co ON g.course_offering_id = co.course_offering_id
JOIN Courses c ON co.course_id = c.course_id
GROUP BY s.student_id

ON CONFLICT (student_id)
DO UPDATE SET
    cgpa = EXCLUDED.cgpa,
    total_credits = EXCLUDED.total_credits;

END;
$$ LANGUAGE plpgsql;

-- 3. Add trg_registration_open_window trigger (function already exists)
DROP TRIGGER IF EXISTS trg_registration_open_window ON System_Config;
CREATE TRIGGER trg_registration_open_window
AFTER UPDATE OF registration_open_date
ON System_Config
FOR EACH ROW
EXECUTE FUNCTION trg_registration_open();

-- 4. Fix add_exam() — p_room_number should be INT
CREATE OR REPLACE FUNCTION add_exam(
    p_course_offering_id INT,
    p_room_number INT,
    p_building_name VARCHAR,
    p_date DATE
)
RETURNS VOID AS $$
BEGIN
    IF p_date < CURRENT_DATE THEN
        RAISE EXCEPTION 'Exam date cannot be in the past';
    END IF;

    INSERT INTO Exams(
        exam_id,
        course_offering_id,
        room_number,
        building_name,
        date_of_exam
    )
    VALUES (
        nextval('exam_seq'),
        p_course_offering_id,
        p_room_number,
        p_building_name,
        p_date
    );
END;
$$ LANGUAGE plpgsql;

-- 5. Update Student_Timetable_View to include booked_class
DROP VIEW IF EXISTS Student_Timetable_View;
CREATE VIEW Student_Timetable_View AS
SELECT
    ca.student_id,
    c.course_name,
    sc.scheduled_day,
    sc.start_time,
    sc.end_time,
    sc.building_name,
    sc.room_number,
    'REGULAR' AS class_type
FROM Course_Allotted ca
JOIN Scheduled_class sc ON ca.course_offering_id = sc.course_offering_id
JOIN Course_Offerings co ON sc.course_offering_id = co.course_offering_id
JOIN Courses c ON co.course_id = c.course_id

UNION ALL

SELECT
    ca.student_id,
    c.course_name,
    bc.scheduled_day,
    bc.start_time,
    bc.end_time,
    bc.building_name,
    bc.room_number,
    'EXTRA' AS class_type
FROM Course_Allotted ca
JOIN booked_class bc ON ca.course_offering_id = bc.course_offering_id
JOIN Course_Offerings co ON bc.course_offering_id = co.course_offering_id
JOIN Courses c ON co.course_id = c.course_id;
