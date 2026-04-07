-- Update semester for all students at the end of each semester

CREATE OR REPLACE FUNCTION update_semester()
RETURNS TRIGGER AS $$
DECLARE
    months_diff INT;
BEGIN

    months_diff := EXTRACT(YEAR FROM AGE(CURRENT_DATE, NEW.join_date)) * 12 + EXTRACT(MONTH FROM AGE(CURRENT_DATE, NEW.join_date));

    NEW.semester := (months_diff / 6) + 1;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_semester
BEFORE INSERT OR UPDATE OF join_date
ON Students
FOR EACH ROW
EXECUTE FUNCTION update_semester();

--When Leave_Approval approved, Add to On_Leave

CREATE OR REPLACE FUNCTION add_student_on_leave()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'Approved' AND OLD.status <> 'Approved' THEN
        INSERT INTO On_leave(student_id, start_date, end_date, request_id)
        VALUES (NEW.student_id, NEW.start_date, NEW.end_date, NEW.request_id);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_leave_approved
AFTER UPDATE ON Leave_Requests
FOR EACH ROW
EXECUTE FUNCTION add_student_on_leave();

--Course Capacity Check

CREATE OR REPLACE FUNCTION check_course_capacity()
RETURNS TRIGGER AS $$
DECLARE
    current_count INT;
    max_capacity INT;
BEGIN

    SELECT capacity INTO max_capacity
    FROM Course_Offerings
    WHERE course_offering_id = NEW.course_offering_id;

    SELECT COUNT(*) INTO current_count
    FROM Course_Allotted
    WHERE course_offering_id = NEW.course_offering_id;

    IF current_count >= max_capacity THEN
        RAISE EXCEPTION 'Course capacity reached';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_course_capacity
BEFORE INSERT ON Course_Allotted
FOR EACH ROW
EXECUTE FUNCTION check_course_capacity();

-- Check Prerquistes

CREATE OR REPLACE FUNCTION check_prerequisites()
RETURNS TRIGGER AS $$
BEGIN

IF EXISTS (
    SELECT 1
    FROM Prerequisites p
    WHERE p.main_course_id = (
            SELECT course_id
            FROM Course_Offerings
            WHERE course_offering_id = NEW.course_offering_id
        )

    AND NOT EXISTS (
        SELECT 1
        FROM Grades g
        JOIN Course_Offerings co
        ON g.course_offering_id = co.course_offering_id
        WHERE g.student_id = NEW.student_id
        AND co.course_id = p.prereq_course_id
        AND g.grade <> 'F'
    )
)
THEN
    RAISE EXCEPTION 'Prerequisite course not completed';
END IF;

RETURN NEW;

END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_prerequisites
BEFORE INSERT ON Course_Registration
FOR EACH ROW
EXECUTE FUNCTION check_prerequisites();

--Auto Create Backlog

CREATE OR REPLACE FUNCTION create_backlog()
RETURNS TRIGGER AS $$
BEGIN

IF NEW.grade = 'F' THEN
    INSERT INTO Backlogs(student_id, course_id)
    VALUES (
        NEW.student_id,
        (SELECT course_id
         FROM Course_Offerings
         WHERE course_offering_id = NEW.course_offering_id)
    );
END IF;

RETURN NEW;

END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_backlog
AFTER INSERT ON Grades
FOR EACH ROW
EXECUTE FUNCTION create_backlog();

-- Clearing Backlogs

CREATE OR REPLACE FUNCTION remove_backlog_on_pass()
RETURNS TRIGGER AS $$
BEGIN

    IF OLD.grade = 'F' AND NEW.grade <> 'F' THEN

        DELETE FROM Backlogs b
        USING Course_Offerings co
        WHERE b.student_id = NEW.student_id
        AND co.course_offering_id = NEW.course_offering_id
        AND b.course_id = co.course_id;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_remove_backlog
AFTER UPDATE OF grade
ON Grades
FOR EACH ROW
EXECUTE FUNCTION remove_backlog_on_pass();

--Check remaining balance

CREATE OR REPLACE FUNCTION check_fee_payment()
RETURNS TRIGGER AS $$
DECLARE
    current_balance INT;
BEGIN

SELECT remaining_balance
INTO current_balance
FROM Balance
WHERE student_id = NEW.student_id;

IF NEW.amount_paid > current_balance THEN
    RAISE EXCEPTION 'Payment exceeds remaining balance';
END IF;

RETURN NEW;

END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_fee_payment
BEFORE INSERT ON Fee_Payment
FOR EACH ROW
EXECUTE FUNCTION check_fee_payment();

--Update Balance after payment

CREATE OR REPLACE FUNCTION update_balance_after_payment()
RETURNS TRIGGER AS $$
BEGIN

UPDATE Balance
SET remaining_balance = remaining_balance - NEW.amount_paid
WHERE student_id = NEW.student_id and NEW.payment_date=(SELECT MAX(payment_date) FROM Fee_Payment WHERE student_id = NEW.student_id);

RETURN NEW;

END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_balance
AFTER INSERT ON Fee_Payment
FOR EACH ROW
EXECUTE FUNCTION update_balance_after_payment();

-- Room capacity check

CREATE OR REPLACE FUNCTION check_room_capacity()
RETURNS TRIGGER AS $$
DECLARE
    room_cap INT;
    students INT;
    room_no INT;
    building TEXT;
BEGIN
    -- get room info from Exams table
    SELECT room_number, building_name INTO room_no, building
    FROM Exams
    WHERE exam_id = NEW.exam_id;

    -- get room capacity from Rooms table
    SELECT capacity INTO room_cap
    FROM Rooms
    WHERE room_number = room_no
      AND building_name = building;

    -- count current students in Exam_Seating for this exam
    SELECT COUNT(*) INTO students
    FROM Exam_Seating
    WHERE exam_id = NEW.exam_id;

    IF students >= room_cap THEN
        RAISE EXCEPTION 'Room capacity exceeded for exam %', NEW.exam_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_room_capacity
BEFORE INSERT ON Exam_Seating
FOR EACH ROW
EXECUTE FUNCTION check_room_capacity();

--Update Balance after fees update in discipline by admin

CREATE OR REPLACE FUNCTION set_balance_from_discipline_fee()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE Balance b
    SET remaining_balance = NEW.fees
    FROM Students s
    WHERE b.student_id = s.student_id
    AND s.discipline_id = NEW.discipline_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_balance_from_discipline
AFTER UPDATE OF fees
ON Discipline
FOR EACH ROW
EXECUTE FUNCTION set_balance_from_discipline_fee();

-- Insert into Course Registration when Registration Window Opens

CREATE OR REPLACE PROCEDURE bulk_register_students()
LANGUAGE plpgsql
AS $$
DECLARE
    current_year INT := EXTRACT(YEAR FROM CURRENT_DATE);
BEGIN

    -- Regular courses
    INSERT INTO Course_Registration (student_id, course_offering_id, semester)
    SELECT 
        s.student_id, 
        co.course_offering_id, 
        s.semester
    FROM Students s
    LEFT JOIN Balance b ON s.student_id = b.student_id
    JOIN Course_Offerings co 
        ON s.discipline_id = co.discipline_id
    JOIN Courses c 
        ON co.course_id = c.course_id 
       AND s.department_id = c.department_id
    WHERE (b.remaining_balance IS NULL OR b.remaining_balance <= 0)
      AND s.semester = co.semester
      AND co.year_offering = current_year
      AND NOT EXISTS (
          SELECT 1 FROM Course_Registration cr 
          WHERE cr.student_id = s.student_id 
          AND cr.course_offering_id = co.course_offering_id
      );

    -- Backlogs
    INSERT INTO Course_Registration (student_id, course_offering_id, semester)
    SELECT 
        b_log.student_id, 
        co.course_offering_id,
        s.semester
    FROM Backlogs b_log
    JOIN Students s ON b_log.student_id = s.student_id
    LEFT JOIN Balance b ON s.student_id = b.student_id
    JOIN Course_Offerings co 
        ON co.course_id = b_log.course_id
    JOIN Courses c 
        ON b_log.course_id = c.course_id 
       AND s.department_id = c.department_id
    WHERE (b.remaining_balance IS NULL OR b.remaining_balance <= 0)
      AND s.semester = co.semester
      AND co.year_offering = current_year
      AND NOT EXISTS (
          SELECT 1 FROM Course_Registration cr 
          WHERE cr.student_id = s.student_id 
          AND cr.course_offering_id = co.course_offering_id
      );

END;
$$;

CREATE OR REPLACE FUNCTION trg_registration_open()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.registration_open_date <= CURRENT_DATE THEN
        CALL bulk_register_students();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

--Move approved courses to Course_Allotted and remove from Course_Registration

CREATE OR REPLACE FUNCTION handle_course_approval()
RETURNS TRIGGER AS $$
BEGIN

    INSERT INTO Course_Allotted (student_id, course_offering_id)
    VALUES (NEW.student_id, NEW.course_offering_id);

    DELETE FROM Course_Registration
    WHERE student_id = NEW.student_id
    AND course_offering_id = NEW.course_offering_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_course_approval
AFTER UPDATE OF approved
ON Course_Registration
FOR EACH ROW
WHEN (NEW.approved = TRUE)
EXECUTE FUNCTION handle_course_approval();

-- Auto-assign exam seating when a new record is inserted into Exams

CREATE OR REPLACE FUNCTION generate_exam_seating()
RETURNS TRIGGER AS $$
BEGIN

    INSERT INTO Exam_Seating (exam_id, student_id)
    SELECT
        NEW.exam_id,
        ca.student_id
    FROM Course_Allotted ca
    WHERE ca.course_offering_id = NEW.course_offering_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_exam_seating
AFTER INSERT ON Exams
FOR EACH ROW
EXECUTE FUNCTION generate_exam_seating();

-- Update the Supplementary_exams table when a grade is updated to 'F' and delete when grade is updated from 'F' to a passing grade

CREATE OR REPLACE FUNCTION handle_supplementary()
RETURNS TRIGGER AS $$
BEGIN

    IF NEW.grade = 'F' THEN

        INSERT INTO Supplementary_exams(
            student_id,
            course_offering_id,
            price
        )
        VALUES (
            NEW.student_id,
            NEW.course_offering_id,
            500
        )
        ON CONFLICT (student_id, course_offering_id)
        DO NOTHING;

    ELSIF OLD.grade = 'F' AND NEW.grade <> 'F' THEN

        DELETE FROM Supplementary_exams
        WHERE student_id = NEW.student_id
        AND course_offering_id = NEW.course_offering_id;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_handle_supplementary
AFTER INSERT OR UPDATE ON Grades
FOR EACH ROW
EXECUTE FUNCTION handle_supplementary();

-- Delete from Supplementary_exams at registration time

CREATE OR REPLACE FUNCTION clear_supplementary_on_reg_open()
RETURNS TRIGGER AS $$
BEGIN

    IF NEW.registration_open_date IS NOT NULL
    AND NEW.registration_open_date <> OLD.registration_open_date THEN

        DELETE FROM Supplementary_exams;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_clear_supplementary
AFTER UPDATE OF registration_open_date
ON System_Config
FOR EACH ROW
EXECUTE FUNCTION clear_supplementary_on_reg_open();

-- Update CGPA and total credits in Results table after grade upload(At results declaration date)

CREATE OR REPLACE FUNCTION update_cgpa_all_students()
RETURNS VOID AS $$
BEGIN

INSERT INTO Results (student_id, cgpa, total_credits)

SELECT 
    s.student_id,

    (
        (COALESCE(r.cgpa,0) * COALESCE(r.total_credits,0)) +
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
        )
    )
    /
    NULLIF(
        COALESCE(r.total_credits,0) +
        SUM(
            CASE 
                WHEN g.grade <> 'F' THEN c.credits
                ELSE 0
            END
        ), 0
    ) AS cgpa,

    COALESCE(r.total_credits,0) +
    SUM(
        CASE 
            WHEN g.grade <> 'F' THEN c.credits
            ELSE 0
        END
    ) AS total_credits

FROM Students s

LEFT JOIN Results r 
    ON s.student_id = r.student_id

JOIN Grades g 
    ON s.student_id = g.student_id

JOIN Course_Offerings co 
    ON g.course_offering_id = co.course_offering_id
    AND co.semester = s.semester

JOIN Courses c 
    ON co.course_id = c.course_id

GROUP BY s.student_id, r.cgpa, r.total_credits

ON CONFLICT (student_id)
DO UPDATE SET
    cgpa = EXCLUDED.cgpa,
    total_credits = EXCLUDED.total_credits;

END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trigger_results_declared()
RETURNS TRIGGER AS $$
BEGIN

IF NEW.results_declaration_date IS NOT NULL
   AND NEW.results_declaration_date <> OLD.results_declaration_date THEN

    PERFORM update_cgpa_all_students();

END IF;

RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_results_declared
AFTER UPDATE OF results_declaration_date
ON System_Config
FOR EACH ROW
EXECUTE FUNCTION trigger_results_declared();

-- Block course registration if registration window is closed

CREATE OR REPLACE FUNCTION prevent_registration_after_close()
RETURNS TRIGGER AS $$
DECLARE
    close_date DATE;
BEGIN
    SELECT registration_close_date
    INTO close_date
    FROM System_Config
    WHERE config_id = 1;

    IF CURRENT_DATE > close_date THEN
        RAISE EXCEPTION 'Registration window closed ❌';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_registration
BEFORE UPDATE ON Course_Registration
FOR EACH ROW
EXECUTE FUNCTION prevent_registration_after_close();

--When student signs up add into results table and balance table

CREATE OR REPLACE FUNCTION insert_initial_results()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO Results (student_id, cgpa, total_credits)
    VALUES (NEW.student_id, 0, 0);

    INSERT INTO Balance (student_id, remaining_balance)
    VALUES (NEW.student_id, (SELECT fees FROM Discipline WHERE discipline_id = NEW.discipline_id));

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_student_insert
AFTER INSERT ON Students
FOR EACH ROW
EXECUTE FUNCTION insert_initial_results();