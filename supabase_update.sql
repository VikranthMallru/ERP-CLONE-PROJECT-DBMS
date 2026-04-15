-- ============================================================
-- Supabase Update Script — Run in SQL Editor
-- Applies 4 changed functions/triggers + 1 view update
-- Safe to run multiple times (uses CREATE OR REPLACE / IF EXISTS)
-- ============================================================

-- 1. update_cgpa_all_students() — recalculates from ALL grades instead of incremental
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
                        WHEN 'Ex' THEN 10 WHEN 'A' THEN 9 WHEN 'B' THEN 8
                        WHEN 'C' THEN 7 WHEN 'D' THEN 6 WHEN 'E' THEN 5
                        WHEN 'P' THEN 4 ELSE 0
                    END
                )::NUMERIC /
                SUM(CASE WHEN g.grade <> 'F' THEN c.credits ELSE 0 END)::NUMERIC,
                2
            )
        END AS cgpa,
        SUM(
            CASE WHEN g.grade <> 'F' THEN c.credits ELSE 0 END
        ) AS total_credits
    FROM Students s
    JOIN Grades g ON s.student_id = g.student_id
    JOIN Course_Offerings co ON g.course_offering_id = co.course_offering_id
    JOIN Courses c ON co.course_id = c.course_id
    GROUP BY s.student_id
    ON CONFLICT (student_id)
    DO UPDATE SET cgpa = EXCLUDED.cgpa, total_credits = EXCLUDED.total_credits;
END;
$$ LANGUAGE plpgsql;

-- 2. add_exam() — p_room_number changed from VARCHAR to INT
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
    INSERT INTO Exams(exam_id, course_offering_id, room_number, building_name, date_of_exam)
    VALUES (nextval('exam_seq'), p_course_offering_id, p_room_number, p_building_name, p_date);
END;
$$ LANGUAGE plpgsql;

-- 3. update_balance_after_payment() — now only updates if payment is the latest
DROP TRIGGER IF EXISTS trg_update_balance ON Fee_Payment;

CREATE OR REPLACE FUNCTION update_balance_after_payment()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE Balance SET remaining_balance = remaining_balance - NEW.amount_paid
    WHERE student_id = NEW.student_id
      AND NEW.payment_date = (SELECT MAX(payment_date) FROM Fee_Payment WHERE student_id = NEW.student_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_balance
AFTER INSERT ON Fee_Payment FOR EACH ROW EXECUTE FUNCTION update_balance_after_payment();

-- 4. check_room_capacity() — now checks across ALL exams on same room/date
DROP TRIGGER IF EXISTS trg_room_capacity ON Exam_Seating;

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

CREATE TRIGGER trg_room_capacity
BEFORE INSERT ON Exam_Seating FOR EACH ROW EXECUTE FUNCTION check_room_capacity();

-- 5. Faculty_Courses_Taught view — added capacity column
CREATE OR REPLACE VIEW Faculty_Courses_Taught AS
SELECT
    co.faculty_id,
    c.course_name,
    co.course_offering_id,
    co.semester,
    co.year_offering,
    co.capacity
FROM Course_Offerings co
JOIN Courses c ON co.course_id = c.course_id;

-- ============================================================
-- Done! All 5 updates applied.
-- ============================================================
