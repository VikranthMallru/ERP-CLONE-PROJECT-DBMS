-- ========================================
-- SUPABASE EXTRAS: Constraints, Sequences,
-- Procedures, Triggers, Views, Indexes
-- Run this AFTER supabase_schema.sql
-- ========================================

-- ========================================
-- PART 1: FOREIGN KEY CONSTRAINTS (EIMS)
-- ========================================

ALTER TABLE Faculty ADD CONSTRAINT fk_faculty_user FOREIGN KEY (faculty_id) REFERENCES Users(user_id);
ALTER TABLE Faculty ADD CONSTRAINT fk_faculty_department FOREIGN KEY (department_id) REFERENCES Departments(dept_id);
ALTER TABLE Departments ADD CONSTRAINT fk_department_head FOREIGN KEY (head_dept_id) REFERENCES Faculty(faculty_id);
ALTER TABLE Students ADD CONSTRAINT fk_student_user FOREIGN KEY (student_id) REFERENCES Users(user_id);
ALTER TABLE Students ADD CONSTRAINT fk_student_department FOREIGN KEY (department_id) REFERENCES Departments(dept_id);
ALTER TABLE Students ADD CONSTRAINT fk_student_discipline FOREIGN KEY (discipline_id) REFERENCES Discipline(discipline_id);
ALTER TABLE Faculty_Advisor ADD CONSTRAINT fk_advisor_student FOREIGN KEY (student_id) REFERENCES Students(student_id);
ALTER TABLE Faculty_Advisor ADD CONSTRAINT fk_advisor_faculty FOREIGN KEY (faculty_id) REFERENCES Faculty(faculty_id);
ALTER TABLE Courses ADD CONSTRAINT fk_course_department FOREIGN KEY (department_id) REFERENCES Departments(dept_id);
ALTER TABLE Prerequisites ADD CONSTRAINT fk_prereq_main FOREIGN KEY (main_course_id) REFERENCES Courses(course_id);
ALTER TABLE Prerequisites ADD CONSTRAINT fk_prereq_course FOREIGN KEY (prereq_course_id) REFERENCES Courses(course_id);
ALTER TABLE Course_Offerings ADD CONSTRAINT fk_offering_faculty FOREIGN KEY (faculty_id) REFERENCES Faculty(faculty_id);
ALTER TABLE Course_Offerings ADD CONSTRAINT fk_offering_course FOREIGN KEY (course_id) REFERENCES Courses(course_id);
ALTER TABLE Course_Offerings ADD CONSTRAINT fk_offering_discipline FOREIGN KEY (discipline_id) REFERENCES Discipline(discipline_id);
ALTER TABLE Course_Allotted ADD CONSTRAINT fk_allotted_student FOREIGN KEY (student_id) REFERENCES Students(student_id);
ALTER TABLE Course_Allotted ADD CONSTRAINT fk_allotted_course FOREIGN KEY (course_offering_id) REFERENCES Course_Offerings(course_offering_id);
ALTER TABLE Attendance ADD CONSTRAINT fk_attendance_student FOREIGN KEY (student_id) REFERENCES Students(student_id);
ALTER TABLE Attendance ADD CONSTRAINT fk_attendance_offering FOREIGN KEY (course_offering_id) REFERENCES Course_Offerings(course_offering_id);
ALTER TABLE Grades ADD CONSTRAINT fk_grades_student FOREIGN KEY (student_id) REFERENCES Students(student_id);
ALTER TABLE Grades ADD CONSTRAINT fk_grades_offering FOREIGN KEY (course_offering_id) REFERENCES Course_Offerings(course_offering_id);
ALTER TABLE Feedback ADD CONSTRAINT fk_feedback_student FOREIGN KEY (student_id) REFERENCES Students(student_id);
ALTER TABLE Feedback ADD CONSTRAINT fk_feedback_offering FOREIGN KEY (course_offering_id) REFERENCES Course_Offerings(course_offering_id);
ALTER TABLE Scheduled_class ADD CONSTRAINT fk_schedule_offering FOREIGN KEY (course_offering_id) REFERENCES Course_Offerings(course_offering_id);
ALTER TABLE Scheduled_class ADD CONSTRAINT fk_schedule_room FOREIGN KEY (building_name, room_number) REFERENCES Rooms(building_name, room_number);
ALTER TABLE Leave_Requests ADD CONSTRAINT fk_leave_student FOREIGN KEY (student_id) REFERENCES Students(student_id);
ALTER TABLE On_leave ADD CONSTRAINT fk_onleave_student FOREIGN KEY (student_id) REFERENCES Students(student_id);
ALTER TABLE On_leave ADD CONSTRAINT fk_onleave_request FOREIGN KEY (request_id) REFERENCES Leave_Requests(request_id);
ALTER TABLE Fee_Payment ADD CONSTRAINT fk_fee_payment_student FOREIGN KEY (student_id) REFERENCES Students(student_id);
ALTER TABLE Fee_Remission_Application ADD CONSTRAINT fk_fee_remission_student FOREIGN KEY (student_id) REFERENCES Students(student_id);
ALTER TABLE Supplementary_exams ADD CONSTRAINT fk_supp_student FOREIGN KEY (student_id) REFERENCES Students(student_id);
ALTER TABLE Supplementary_exams ADD CONSTRAINT fk_supp_offering FOREIGN KEY (course_offering_id) REFERENCES Course_Offerings(course_offering_id);
ALTER TABLE Backlogs ADD CONSTRAINT fk_backlog_student FOREIGN KEY (student_id) REFERENCES Students(student_id);
ALTER TABLE Backlogs ADD CONSTRAINT fk_backlog_course FOREIGN KEY (course_id) REFERENCES Courses(course_id);
ALTER TABLE Exams ADD CONSTRAINT fk_exam_offering FOREIGN KEY (course_offering_id) REFERENCES Course_Offerings(course_offering_id);
ALTER TABLE Exam_Seating ADD CONSTRAINT fk_exam_seating_exam FOREIGN KEY (exam_id) REFERENCES Exams(exam_id);
ALTER TABLE Exam_Seating ADD CONSTRAINT fk_exam_seating_student FOREIGN KEY (student_id) REFERENCES Students(student_id);
ALTER TABLE Balance ADD CONSTRAINT fk_student_balance FOREIGN KEY (student_id) REFERENCES Students(student_id);
ALTER TABLE Course_Registration ADD CONSTRAINT fk_registration_student FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE;
ALTER TABLE Course_Registration ADD CONSTRAINT fk_registration_course FOREIGN KEY (course_offering_id) REFERENCES Course_Offerings(course_offering_id) ON DELETE CASCADE;
ALTER TABLE Course_Registration ADD CONSTRAINT chk_selected_before_approval CHECK (approved = FALSE OR selected = TRUE);
ALTER TABLE Results ADD CONSTRAINT fk_results_student FOREIGN KEY (student_id) REFERENCES Students(student_id);
ALTER TABLE CDC_Eligible_Departments ADD CONSTRAINT fk_cdc_dept_cdc FOREIGN KEY (cdc_id) REFERENCES CDC(cdc_id);
ALTER TABLE CDC_Eligible_Departments ADD CONSTRAINT fk_cdc_dept_department FOREIGN KEY (department_id) REFERENCES Departments(dept_id);
ALTER TABLE CDC_Applications ADD CONSTRAINT fk_cdc_app_student FOREIGN KEY (student_id) REFERENCES Students(student_id);
ALTER TABLE CDC_Applications ADD CONSTRAINT fk_cdc_app_cdc FOREIGN KEY (cdc_id) REFERENCES CDC(cdc_id);

-- ========================================
-- PART 1b: FOREIGN KEY CONSTRAINTS (BANK)
-- ========================================

ALTER TABLE Accounts ADD CONSTRAINT fk_accounts_customer FOREIGN KEY (customer_id) REFERENCES Customers(customer_id) ON DELETE CASCADE;
ALTER TABLE Transactions ADD CONSTRAINT fk_transactions_account FOREIGN KEY (account_id) REFERENCES Accounts(account_id) ON DELETE CASCADE;
ALTER TABLE Transfers ADD CONSTRAINT fk_transfers_from FOREIGN KEY (from_account) REFERENCES Accounts(account_id) ON DELETE CASCADE;
ALTER TABLE Transfers ADD CONSTRAINT fk_transfers_to FOREIGN KEY (to_account) REFERENCES Accounts(account_id) ON DELETE CASCADE;
ALTER TABLE Accounts ADD CONSTRAINT chk_balance_non_negative CHECK (balance >= 0);
ALTER TABLE Accounts ADD CONSTRAINT chk_account_type CHECK (account_type IN ('savings', 'current'));
ALTER TABLE Accounts ADD CONSTRAINT chk_account_status CHECK (status IN ('active', 'inactive', 'closed'));
ALTER TABLE Transactions ADD CONSTRAINT chk_transaction_type CHECK (transaction_type IN ('credit', 'debit'));
ALTER TABLE Transactions ADD CONSTRAINT chk_transaction_amount CHECK (amount > 0);

-- ========================================
-- PART 2: SEQUENCES
-- ========================================

CREATE SEQUENCE IF NOT EXISTS leave_request_seq START 1;
CREATE SEQUENCE IF NOT EXISTS fee_payment_seq START 1;
CREATE SEQUENCE IF NOT EXISTS exam_seq START 1;
CREATE SEQUENCE IF NOT EXISTS fee_remission_application_seq START 1;

-- ========================================
-- PART 3: EIMS STORED PROCEDURES/FUNCTIONS
-- ========================================

-- Mark Attendance
CREATE OR REPLACE PROCEDURE mark_attendance(
    p_offering_id INT,
    p_date DATE,
    p_present_student_ids TEXT[]
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM Attendance
    WHERE course_offering_id = p_offering_id
      AND class_date = p_date;

    INSERT INTO Attendance (student_id, course_offering_id, class_date, status)
    SELECT unnest(p_present_student_ids), p_offering_id, p_date, 'Present';

    INSERT INTO Attendance (student_id, course_offering_id, class_date, status)
    SELECT ca.student_id, p_offering_id, p_date,
        CASE WHEN ol.student_id IS NOT NULL THEN 'On_Leave' ELSE 'Absent' END
    FROM Course_Allotted ca
    LEFT JOIN On_leave ol
        ON ca.student_id = ol.student_id
        AND p_date BETWEEN ol.start_date AND ol.end_date
    WHERE ca.course_offering_id = p_offering_id
      AND NOT (ca.student_id = ANY(p_present_student_ids));
END;
$$;

-- Apply Leave
CREATE OR REPLACE FUNCTION apply_leave(
    p_student_id TEXT,
    p_start_date DATE,
    p_end_date DATE,
    p_reason TEXT
)
RETURNS VOID AS $$
BEGIN
    IF p_start_date > p_end_date THEN
        RAISE EXCEPTION 'Start date cannot be after end date';
    END IF;
    INSERT INTO Leave_Requests(student_id, start_date, end_date, reason, status)
    VALUES (p_student_id, p_start_date, p_end_date, TRIM(p_reason), 'Pending');
END;
$$ LANGUAGE plpgsql;

-- Upload Grade
CREATE OR REPLACE FUNCTION upload_grade(
    p_student_id TEXT,
    p_course_offering_id INT,
    p_grade TEXT
)
RETURNS VOID AS $$
BEGIN
    IF p_grade NOT IN ('Ex','A','B','C','D','E','P','F') THEN
        RAISE EXCEPTION 'Invalid grade';
    END IF;
    INSERT INTO Grades(student_id, course_offering_id, grade)
    VALUES (p_student_id, p_course_offering_id, p_grade)
    ON CONFLICT (student_id, course_offering_id)
    DO UPDATE SET grade = EXCLUDED.grade;
END;
$$ LANGUAGE plpgsql;

-- Submit Feedback
CREATE OR REPLACE FUNCTION submit_feedback(
    p_student_id TEXT,
    p_course_offering_id INT,
    p_feedback TEXT
)
RETURNS VOID AS $$
BEGIN
    IF p_feedback IS NULL OR LENGTH(TRIM(p_feedback)) = 0 THEN
        RAISE EXCEPTION 'Feedback cannot be empty';
    END IF;
    INSERT INTO Feedback(student_id, course_offering_id, feedback)
    VALUES (p_student_id, p_course_offering_id, p_feedback)
    ON CONFLICT (student_id, course_offering_id)
    DO UPDATE SET feedback = EXCLUDED.feedback;
END;
$$ LANGUAGE plpgsql;

-- Make Payment
CREATE OR REPLACE FUNCTION make_payment(
    p_student_id TEXT,
    p_semester INT,
    p_amount NUMERIC
)
RETURNS VOID AS $$
DECLARE
    fees_open BOOLEAN;
BEGIN
    SELECT is_fees_open INTO fees_open FROM System_Config WHERE config_id = 1;
    IF fees_open IS NOT TRUE THEN
        RAISE EXCEPTION 'Fee payment is currently closed';
    END IF;
    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Invalid amount';
    END IF;
    INSERT INTO Fee_Payment(payment_id, student_id, semester, amount_paid, payment_date)
    VALUES (nextval('fee_payment_seq'), p_student_id, p_semester, p_amount, CURRENT_DATE);
END;
$$ LANGUAGE plpgsql;

-- Add Exam
CREATE OR REPLACE FUNCTION add_exam(
    p_course_offering_id INT,
    p_room_number VARCHAR,
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

-- Apply Fee Remission
CREATE OR REPLACE FUNCTION apply_fee_remission(p_student_id TEXT)
RETURNS VOID AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM Fee_Remission_Application WHERE student_id = p_student_id) THEN
        RAISE EXCEPTION 'You have already applied for fee remission';
    END IF;
    INSERT INTO Fee_Remission_Application (application_id, student_id, status)
    VALUES (nextval('fee_remission_application_seq'), p_student_id, 'Pending');
END;
$$ LANGUAGE plpgsql;

-- Add Scheduled Class
CREATE OR REPLACE FUNCTION add_scheduled_class(
    p_course_offering_id INT,
    p_start_time TIME,
    p_end_time TIME,
    p_day VARCHAR,
    p_building_name TEXT,
    p_room_number INT
)
RETURNS VOID AS $$
BEGIN
    IF p_start_time >= p_end_time THEN
        RAISE EXCEPTION 'Start time must be before end time';
    END IF;
    IF EXISTS (
        SELECT 1 FROM Scheduled_class sc
        WHERE sc.building_name = p_building_name AND sc.room_number = p_room_number
          AND sc.scheduled_day = p_day
          AND (p_start_time, p_end_time) OVERLAPS (sc.start_time, sc.end_time)
    ) THEN
        RAISE EXCEPTION 'Room is already occupied at this time';
    END IF;
    IF EXISTS (
        SELECT 1 FROM Scheduled_class sc
        WHERE sc.course_offering_id = p_course_offering_id AND sc.scheduled_day = p_day
          AND (p_start_time, p_end_time) OVERLAPS (sc.start_time, sc.end_time)
    ) THEN
        RAISE EXCEPTION 'Course already has a class at this time';
    END IF;
    INSERT INTO Scheduled_class(course_offering_id, start_time, end_time, scheduled_day, building_name, room_number)
    VALUES (p_course_offering_id, p_start_time, p_end_time, p_day, p_building_name, p_room_number);
END;
$$ LANGUAGE plpgsql;

-- Get Room Availability
CREATE OR REPLACE FUNCTION get_room_availability(p_day TEXT DEFAULT NULL)
RETURNS TABLE (
  building_name TEXT,
  room_number INT,
  scheduled_day TEXT,
  start_time TIME,
  end_time TIME
)
LANGUAGE sql
AS $$
WITH days AS (
  SELECT unnest(
    CASE
      WHEN p_day IS NOT NULL THEN ARRAY[p_day]
      ELSE ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday']
    END
  ) AS scheduled_day
),
time_slots AS (
  SELECT generate_series(
    TIMESTAMP '2000-01-01 08:00:00',
    TIMESTAMP '2000-01-01 17:30:00',
    INTERVAL '30 minutes'
  )::TIME AS start_time
),
all_combinations AS (
  SELECT r.building_name, r.room_number, d.scheduled_day,
    ts.start_time, (ts.start_time + INTERVAL '30 minutes')::TIME AS end_time
  FROM Rooms r CROSS JOIN days d CROSS JOIN time_slots ts
),
conflicts AS (
  SELECT building_name, room_number, scheduled_day, start_time, end_time FROM Scheduled_class
  UNION ALL
  SELECT building_name, room_number, scheduled_day, start_time, end_time FROM booked_class
),
free_slots AS (
  SELECT ac.* FROM all_combinations ac
  WHERE NOT EXISTS (
    SELECT 1 FROM conflicts c
    WHERE c.building_name = ac.building_name AND c.room_number = ac.room_number
      AND c.scheduled_day = ac.scheduled_day
      AND NOT (c.end_time <= ac.start_time OR c.start_time >= ac.end_time)
  )
),
grouped_slots AS (
  SELECT *,
    start_time - (ROW_NUMBER() OVER (PARTITION BY building_name, room_number, scheduled_day ORDER BY start_time) * INTERVAL '30 minutes') AS grp
  FROM free_slots
)
SELECT building_name, room_number, scheduled_day,
  MIN(start_time) AS start_time, MAX(end_time) AS end_time
FROM grouped_slots
GROUP BY building_name, room_number, scheduled_day, grp
ORDER BY scheduled_day, building_name, room_number, MIN(start_time);
$$;

-- Insert Bookings
CREATE OR REPLACE PROCEDURE insert_bookings(p_bookings JSON)
LANGUAGE plpgsql
AS $$
DECLARE
  b JSON;
BEGIN
  FOR b IN SELECT * FROM json_array_elements(p_bookings)
  LOOP
    IF EXISTS (
      SELECT 1
      FROM (
        SELECT building_name, room_number, scheduled_day, start_time, end_time FROM Scheduled_class
        UNION ALL
        SELECT building_name, room_number, scheduled_day, start_time, end_time FROM booked_class
      ) AS conflicts
      WHERE building_name = (b->>'building_name')
        AND room_number = (b->>'room_number')::INT
        AND scheduled_day = (b->>'scheduled_day')
        AND NOT (end_time <= (b->>'start_time')::TIME OR start_time >= (b->>'end_time')::TIME)
    ) THEN
      RAISE EXCEPTION 'Conflict for Room %-% on %', b->>'building_name', b->>'room_number', b->>'scheduled_day';
    END IF;

    INSERT INTO booked_class (building_name, room_number, scheduled_day, start_time, end_time, faculty_id, course_offering_id, booking_date)
    VALUES (
      b->>'building_name',
      (b->>'room_number')::INT,
      b->>'scheduled_day',
      (b->>'start_time')::TIME,
      (b->>'end_time')::TIME,
      b->>'faculty_id',
      (b->>'course_offering_id')::INT,
      (b->>'booking_date')::DATE
    );
  END LOOP;
END;
$$;

-- Bulk Register Students
CREATE OR REPLACE PROCEDURE bulk_register_students()
LANGUAGE plpgsql
AS $$
DECLARE
    current_year INT := EXTRACT(YEAR FROM CURRENT_DATE);
BEGIN
    INSERT INTO Course_Registration (student_id, course_offering_id, semester)
    SELECT s.student_id, co.course_offering_id, s.semester
    FROM Students s
    LEFT JOIN Balance b ON s.student_id = b.student_id
    JOIN Course_Offerings co ON s.discipline_id = co.discipline_id
    JOIN Courses c ON co.course_id = c.course_id AND s.department_id = c.department_id
    WHERE (b.remaining_balance IS NULL OR b.remaining_balance <= 0)
      AND s.semester = co.semester AND co.year_offering = current_year
      AND NOT EXISTS (
          SELECT 1 FROM Course_Registration cr
          WHERE cr.student_id = s.student_id AND cr.course_offering_id = co.course_offering_id
      );

    INSERT INTO Course_Registration (student_id, course_offering_id, semester)
    SELECT b_log.student_id, co.course_offering_id, s.semester
    FROM Backlogs b_log
    JOIN Students s ON b_log.student_id = s.student_id
    LEFT JOIN Balance b ON s.student_id = b.student_id
    JOIN Course_Offerings co ON co.course_id = b_log.course_id
    JOIN Courses c ON b_log.course_id = c.course_id AND s.department_id = c.department_id
    WHERE (b.remaining_balance IS NULL OR b.remaining_balance <= 0)
      AND s.semester = co.semester AND co.year_offering = current_year
      AND NOT EXISTS (
          SELECT 1 FROM Course_Registration cr
          WHERE cr.student_id = s.student_id AND cr.course_offering_id = co.course_offering_id
      );
END;
$$;

-- Update CGPA for all students
CREATE OR REPLACE FUNCTION update_cgpa_all_students()
RETURNS VOID AS $$
BEGIN
    INSERT INTO Results (student_id, cgpa, total_credits)
    SELECT
        s.student_id,
        ((COALESCE(r.cgpa,0) * COALESCE(r.total_credits,0)) +
            SUM(c.credits *
                CASE g.grade
                    WHEN 'Ex' THEN 10 WHEN 'A' THEN 9 WHEN 'B' THEN 8
                    WHEN 'C' THEN 7 WHEN 'D' THEN 6 WHEN 'E' THEN 5
                    WHEN 'P' THEN 4 ELSE 0
                END
            )
        ) / NULLIF(COALESCE(r.total_credits,0) +
            SUM(CASE WHEN g.grade <> 'F' THEN c.credits ELSE 0 END), 0
        ) AS cgpa,
        COALESCE(r.total_credits,0) +
            SUM(CASE WHEN g.grade <> 'F' THEN c.credits ELSE 0 END) AS total_credits
    FROM Students s
    LEFT JOIN Results r ON s.student_id = r.student_id
    JOIN Grades g ON s.student_id = g.student_id
    JOIN Course_Offerings co ON g.course_offering_id = co.course_offering_id AND co.semester = s.semester
    JOIN Courses c ON co.course_id = c.course_id
    GROUP BY s.student_id, r.cgpa, r.total_credits
    ON CONFLICT (student_id)
    DO UPDATE SET cgpa = EXCLUDED.cgpa, total_credits = EXCLUDED.total_credits;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- PART 4: BANK STORED PROCEDURES/FUNCTIONS
-- ========================================

CREATE OR REPLACE FUNCTION create_customer(
    p_name VARCHAR, p_email VARCHAR, p_phone VARCHAR, p_password VARCHAR
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO Customers (name, email, phone, password)
    VALUES (p_name, p_email, p_phone, p_password);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION deposit_amount(p_account_id INT, p_amount NUMERIC)
RETURNS TEXT AS $$
BEGIN
    IF p_amount <= 0 THEN RETURN 'Invalid amount'; END IF;
    UPDATE Accounts SET balance = balance + p_amount WHERE account_id = p_account_id;
    INSERT INTO Transactions (account_id, transaction_type, amount, status)
    VALUES (p_account_id, 'credit', p_amount, 'success');
    RETURN 'Deposit successful';
EXCEPTION WHEN others THEN RETURN 'Error: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION withdraw_amount(p_account_id INT, p_amount NUMERIC)
RETURNS TEXT AS $$
DECLARE current_balance NUMERIC;
BEGIN
    IF p_amount <= 0 THEN RETURN 'Invalid amount'; END IF;
    SELECT balance INTO current_balance FROM Accounts WHERE account_id = p_account_id;
    IF current_balance < p_amount THEN
        INSERT INTO Transactions (account_id, transaction_type, amount, status)
        VALUES (p_account_id, 'debit', p_amount, 'failed - insufficient balance');
        RETURN 'Insufficient balance';
    END IF;
    UPDATE Accounts SET balance = balance - p_amount WHERE account_id = p_account_id;
    INSERT INTO Transactions (account_id, transaction_type, amount, status)
    VALUES (p_account_id, 'debit', p_amount, 'success');
    RETURN 'Withdrawal successful';
EXCEPTION WHEN others THEN RETURN 'Error: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION transfer_amount(p_from_account INT, p_to_account INT, p_amount NUMERIC)
RETURNS TEXT AS $$
DECLARE from_balance NUMERIC;
BEGIN
    IF p_amount <= 0 THEN RETURN 'Invalid amount'; END IF;
    IF p_from_account = p_to_account THEN RETURN 'Cannot transfer to same account'; END IF;
    SELECT balance INTO from_balance FROM Accounts WHERE account_id = p_from_account FOR UPDATE;
    IF from_balance < p_amount THEN
        INSERT INTO Transfers (from_account, to_account, amount, status)
        VALUES (p_from_account, p_to_account, p_amount, 'failed');
        RETURN 'Insufficient balance';
    END IF;
    UPDATE Accounts SET balance = balance - p_amount WHERE account_id = p_from_account;
    UPDATE Accounts SET balance = balance + p_amount WHERE account_id = p_to_account;
    INSERT INTO Transfers (from_account, to_account, amount, status)
    VALUES (p_from_account, p_to_account, p_amount, 'completed');
    RETURN 'Transfer successful';
EXCEPTION WHEN others THEN RETURN 'Error: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- PART 5: EIMS TRIGGERS
-- ========================================

-- Update semester trigger
CREATE OR REPLACE FUNCTION update_semester()
RETURNS TRIGGER AS $$
DECLARE months_diff INT;
BEGIN
    months_diff := EXTRACT(YEAR FROM AGE(CURRENT_DATE, NEW.join_date)) * 12 + EXTRACT(MONTH FROM AGE(CURRENT_DATE, NEW.join_date));
    NEW.semester := (months_diff / 6) + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_semester
BEFORE INSERT OR UPDATE OF join_date ON Students
FOR EACH ROW EXECUTE FUNCTION update_semester();

-- Leave approved trigger
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
AFTER UPDATE ON Leave_Requests FOR EACH ROW EXECUTE FUNCTION add_student_on_leave();

-- Course capacity check
CREATE OR REPLACE FUNCTION check_course_capacity()
RETURNS TRIGGER AS $$
DECLARE current_count INT; max_capacity INT;
BEGIN
    SELECT capacity INTO max_capacity FROM Course_Offerings WHERE course_offering_id = NEW.course_offering_id;
    SELECT COUNT(*) INTO current_count FROM Course_Allotted WHERE course_offering_id = NEW.course_offering_id;
    IF current_count >= max_capacity THEN RAISE EXCEPTION 'Course capacity reached'; END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_course_capacity
BEFORE INSERT ON Course_Allotted FOR EACH ROW EXECUTE FUNCTION check_course_capacity();

-- Check prerequisites
CREATE OR REPLACE FUNCTION check_prerequisites()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM Prerequisites p
        WHERE p.main_course_id = (SELECT course_id FROM Course_Offerings WHERE course_offering_id = NEW.course_offering_id)
        AND NOT EXISTS (
            SELECT 1 FROM Grades g JOIN Course_Offerings co ON g.course_offering_id = co.course_offering_id
            WHERE g.student_id = NEW.student_id AND co.course_id = p.prereq_course_id AND g.grade <> 'F'
        )
    ) THEN
        RAISE EXCEPTION 'Prerequisite course not completed';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_prerequisites
BEFORE INSERT ON Course_Registration FOR EACH ROW EXECUTE FUNCTION check_prerequisites();

-- Auto create backlog
CREATE OR REPLACE FUNCTION create_backlog()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.grade = 'F' THEN
        INSERT INTO Backlogs(student_id, course_id)
        VALUES (NEW.student_id, (SELECT course_id FROM Course_Offerings WHERE course_offering_id = NEW.course_offering_id));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_backlog
AFTER INSERT ON Grades FOR EACH ROW EXECUTE FUNCTION create_backlog();

-- Remove backlog on pass
CREATE OR REPLACE FUNCTION remove_backlog_on_pass()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.grade = 'F' AND NEW.grade <> 'F' THEN
        DELETE FROM Backlogs b USING Course_Offerings co
        WHERE b.student_id = NEW.student_id AND co.course_offering_id = NEW.course_offering_id AND b.course_id = co.course_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_remove_backlog
AFTER UPDATE OF grade ON Grades FOR EACH ROW EXECUTE FUNCTION remove_backlog_on_pass();

-- Check fee payment balance
CREATE OR REPLACE FUNCTION check_fee_payment()
RETURNS TRIGGER AS $$
DECLARE current_balance INT;
BEGIN
    SELECT remaining_balance INTO current_balance FROM Balance WHERE student_id = NEW.student_id;
    IF NEW.amount_paid > current_balance THEN RAISE EXCEPTION 'Payment exceeds remaining balance'; END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_fee_payment
BEFORE INSERT ON Fee_Payment FOR EACH ROW EXECUTE FUNCTION check_fee_payment();

-- Update balance after payment
CREATE OR REPLACE FUNCTION update_balance_after_payment()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE Balance SET remaining_balance = remaining_balance - NEW.amount_paid
    WHERE student_id = NEW.student_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_balance
AFTER INSERT ON Fee_Payment FOR EACH ROW EXECUTE FUNCTION update_balance_after_payment();

-- Room capacity check for exams
CREATE OR REPLACE FUNCTION check_room_capacity()
RETURNS TRIGGER AS $$
DECLARE room_cap INT; students INT; room_no INT; building TEXT;
BEGIN
    SELECT room_number, building_name INTO room_no, building FROM Exams WHERE exam_id = NEW.exam_id;
    SELECT capacity INTO room_cap FROM Rooms WHERE room_number = room_no AND building_name = building;
    SELECT COUNT(*) INTO students FROM Exam_Seating WHERE exam_id = NEW.exam_id;
    IF students >= room_cap THEN RAISE EXCEPTION 'Room capacity exceeded for exam %', NEW.exam_id; END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_room_capacity
BEFORE INSERT ON Exam_Seating FOR EACH ROW EXECUTE FUNCTION check_room_capacity();

-- Update balance when discipline fees change
CREATE OR REPLACE FUNCTION set_balance_from_discipline_fee()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE Balance b SET remaining_balance = NEW.fees
    FROM Students s WHERE b.student_id = s.student_id AND s.discipline_id = NEW.discipline_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_balance_from_discipline
AFTER UPDATE OF fees ON Discipline FOR EACH ROW EXECUTE FUNCTION set_balance_from_discipline_fee();

-- Course approval trigger
CREATE OR REPLACE FUNCTION handle_course_approval()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO Course_Allotted (student_id, course_offering_id)
    VALUES (NEW.student_id, NEW.course_offering_id);
    DELETE FROM Course_Registration WHERE student_id = NEW.student_id AND course_offering_id = NEW.course_offering_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_course_approval
AFTER UPDATE OF approved ON Course_Registration FOR EACH ROW
WHEN (NEW.approved = TRUE) EXECUTE FUNCTION handle_course_approval();

-- Auto-assign exam seating
CREATE OR REPLACE FUNCTION generate_exam_seating()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO Exam_Seating (exam_id, student_id)
    SELECT NEW.exam_id, ca.student_id
    FROM Course_Allotted ca WHERE ca.course_offering_id = NEW.course_offering_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_exam_seating
AFTER INSERT ON Exams FOR EACH ROW EXECUTE FUNCTION generate_exam_seating();

-- Handle supplementary exams
CREATE OR REPLACE FUNCTION handle_supplementary()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.grade = 'F' THEN
        INSERT INTO Supplementary_exams(student_id, course_offering_id, price)
        VALUES (NEW.student_id, NEW.course_offering_id, 500)
        ON CONFLICT (student_id, course_offering_id) DO NOTHING;
    ELSIF OLD IS NOT NULL AND OLD.grade = 'F' AND NEW.grade <> 'F' THEN
        DELETE FROM Supplementary_exams WHERE student_id = NEW.student_id AND course_offering_id = NEW.course_offering_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_handle_supplementary
AFTER INSERT OR UPDATE ON Grades FOR EACH ROW EXECUTE FUNCTION handle_supplementary();

-- Clear supplementary on registration open
CREATE OR REPLACE FUNCTION clear_supplementary_on_reg_open()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.registration_open_date IS NOT NULL AND NEW.registration_open_date <> OLD.registration_open_date THEN
        DELETE FROM Supplementary_exams;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_clear_supplementary
AFTER UPDATE OF registration_open_date ON System_Config FOR EACH ROW EXECUTE FUNCTION clear_supplementary_on_reg_open();

-- Results declaration trigger
CREATE OR REPLACE FUNCTION trigger_results_declared()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.results_declaration_date IS NOT NULL AND NEW.results_declaration_date <> OLD.results_declaration_date THEN
        PERFORM update_cgpa_all_students();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_results_declared
AFTER UPDATE OF results_declaration_date ON System_Config
FOR EACH ROW EXECUTE FUNCTION trigger_results_declared();

-- Block registration after close
CREATE OR REPLACE FUNCTION prevent_registration_after_close()
RETURNS TRIGGER AS $$
DECLARE close_date DATE;
BEGIN
    SELECT registration_close_date INTO close_date FROM System_Config WHERE config_id = 1;
    IF CURRENT_DATE > close_date THEN RAISE EXCEPTION 'Registration window closed'; END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_registration
BEFORE UPDATE ON Course_Registration FOR EACH ROW EXECUTE FUNCTION prevent_registration_after_close();

-- Auto-insert results and balance on student signup
CREATE OR REPLACE FUNCTION insert_initial_results()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO Results (student_id, cgpa, total_credits) VALUES (NEW.student_id, 0, 0);
    INSERT INTO Balance (student_id, remaining_balance)
    VALUES (NEW.student_id, (SELECT fees FROM Discipline WHERE discipline_id = NEW.discipline_id));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_student_insert
AFTER INSERT ON Students FOR EACH ROW EXECUTE FUNCTION insert_initial_results();

-- Registration open trigger
CREATE OR REPLACE FUNCTION trg_registration_open()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.registration_open_date <= CURRENT_DATE THEN
        CALL bulk_register_students();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_registration_open
AFTER UPDATE OF registration_open_date ON System_Config
FOR EACH ROW EXECUTE FUNCTION trg_registration_open();

-- ========================================
-- PART 6: BANK TRIGGERS
-- ========================================

CREATE OR REPLACE FUNCTION create_account_after_customer()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO Accounts (customer_id, balance, account_type, status)
    VALUES (NEW.customer_id, 0, 'savings', 'active');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_account
AFTER INSERT ON Customers FOR EACH ROW EXECUTE FUNCTION create_account_after_customer();

-- ========================================
-- PART 7: VIEWS
-- ========================================

CREATE OR REPLACE VIEW Student_Registration_View AS
SELECT cr.student_id, s.student_name, co.course_offering_id, c.course_id, c.course_name,
    co.semester, f.faculty_id, f.faculty_name, cr.approved, cr.selected
FROM Course_Registration cr
JOIN Students s ON cr.student_id = s.student_id
JOIN Course_Offerings co ON cr.course_offering_id = co.course_offering_id
JOIN Courses c ON co.course_id = c.course_id
JOIN Faculty f ON co.faculty_id = f.faculty_id;

CREATE OR REPLACE VIEW Student_Course_View AS
SELECT ca.student_id, co.course_offering_id, c.course_id, c.course_name, co.semester, f.faculty_id, f.faculty_name
FROM Course_Allotted ca
JOIN Course_Offerings co ON ca.course_offering_id = co.course_offering_id
JOIN Courses c ON co.course_id = c.course_id
JOIN Faculty f ON co.faculty_id = f.faculty_id;

CREATE OR REPLACE VIEW Student_Attendance_View AS
SELECT a.student_id, a.course_offering_id, c.course_name, a.class_date, a.status
FROM Attendance a
JOIN Course_Offerings co ON a.course_offering_id = co.course_offering_id
JOIN Courses c ON co.course_id = c.course_id;

CREATE OR REPLACE VIEW Student_All_Semester_Grades AS
SELECT g.student_id, c.course_name, co.semester, c.credits, g.grade
FROM Grades g
JOIN Course_Offerings co ON g.course_offering_id = co.course_offering_id
JOIN Courses c ON co.course_id = c.course_id;

CREATE OR REPLACE VIEW Student_SGPA AS
SELECT ca.student_id, co.semester,
    SUM(c.credits * CASE g.grade
        WHEN 'Ex' THEN 10 WHEN 'A' THEN 9 WHEN 'B' THEN 8
        WHEN 'C' THEN 7 WHEN 'D' THEN 6 WHEN 'E' THEN 5
        WHEN 'P' THEN 4 ELSE 0 END
    ) / NULLIF(SUM(CASE WHEN g.grade <> 'F' THEN c.credits ELSE 0 END), 0) AS sgpa
FROM Course_Allotted ca
JOIN Course_Offerings co ON ca.course_offering_id = co.course_offering_id
JOIN Courses c ON co.course_id = c.course_id
JOIN Grades g ON g.student_id = ca.student_id AND g.course_offering_id = ca.course_offering_id
GROUP BY ca.student_id, co.semester;

CREATE OR REPLACE VIEW Student_Fee_Status AS
SELECT s.student_id, s.college_email, d.discipline_id, d.fees AS total_program_fee,
    (d.fees - b.remaining_balance) AS amount_paid, b.remaining_balance
FROM Students s
JOIN Discipline d ON s.discipline_id = d.discipline_id
JOIN Balance b ON s.student_id = b.student_id;

CREATE OR REPLACE VIEW Student_Payment_History AS
SELECT fp.payment_id, fp.student_id, s.college_email, fp.semester, fp.amount_paid, fp.payment_date, d.discipline_id
FROM Fee_Payment fp
JOIN Students s ON fp.student_id = s.student_id
JOIN Discipline d ON s.discipline_id = d.discipline_id
ORDER BY fp.payment_date DESC;

CREATE OR REPLACE VIEW Student_Supplementary_Exams AS
SELECT se.student_id, c.course_name, se.course_offering_id, se.price
FROM Supplementary_exams se
JOIN Course_Offerings co ON se.course_offering_id = co.course_offering_id
JOIN Courses c ON co.course_id = c.course_id;

CREATE OR REPLACE VIEW Student_Feedback_View AS
SELECT co.faculty_id, c.course_name, f.course_offering_id, f.feedback
FROM Feedback f
JOIN Course_Offerings co ON f.course_offering_id = co.course_offering_id
JOIN Courses c ON co.course_id = c.course_id;

CREATE OR REPLACE VIEW Student_Leave_Requests AS
SELECT student_id, start_date, end_date, reason, status FROM Leave_Requests;

CREATE OR REPLACE VIEW Student_Faculty_Advisor AS
SELECT fa.student_id, f.faculty_id, f.faculty_name, f.email, f.contact_no, d.dept_name
FROM Faculty_Advisor fa
JOIN Faculty f ON fa.faculty_id = f.faculty_id
JOIN Departments d ON f.department_id = d.dept_id;

-- ========================================
-- PART 7b: MISSING VIEWS (backend queries these)
-- ========================================

CREATE OR REPLACE VIEW Student_Attendance_Summary AS
SELECT
    a.student_id,
    c.course_name,
    a.course_offering_id,
    COUNT(*) AS total_classes,
    COUNT(*) FILTER (WHERE a.status = 'Present') AS present_count,
    ROUND(COUNT(*) FILTER (WHERE a.status = 'Present')::NUMERIC / NULLIF(COUNT(*), 0) * 100, 2) AS attendance_percentage
FROM Attendance a
JOIN Course_Offerings co ON a.course_offering_id = co.course_offering_id
JOIN Courses c ON co.course_id = c.course_id
GROUP BY a.student_id, c.course_name, a.course_offering_id;

CREATE OR REPLACE VIEW Student_Exam_View AS
SELECT
    es.student_id,
    c.course_name,
    e.date_of_exam,
    e.building_name,
    e.room_number
FROM Exam_Seating es
JOIN Exams e ON es.exam_id = e.exam_id
JOIN Course_Offerings co ON e.course_offering_id = co.course_offering_id
JOIN Courses c ON co.course_id = c.course_id;

CREATE OR REPLACE VIEW Student_Timetable_View AS
SELECT
    ca.student_id,
    c.course_name,
    sc.scheduled_day,
    sc.start_time,
    sc.end_time,
    sc.building_name,
    sc.room_number
FROM Course_Allotted ca
JOIN Scheduled_class sc ON ca.course_offering_id = sc.course_offering_id
JOIN Course_Offerings co ON ca.course_offering_id = co.course_offering_id
JOIN Courses c ON co.course_id = c.course_id;

CREATE OR REPLACE VIEW current_sem_sgpa AS
SELECT
    ca.student_id,
    co.semester,
    SUM(c.credits * CASE g.grade
        WHEN 'Ex' THEN 10 WHEN 'A' THEN 9 WHEN 'B' THEN 8
        WHEN 'C' THEN 7 WHEN 'D' THEN 6 WHEN 'E' THEN 5
        WHEN 'P' THEN 4 ELSE 0 END
    ) / NULLIF(SUM(CASE WHEN g.grade <> 'F' THEN c.credits ELSE 0 END), 0) AS sgpa
FROM Course_Allotted ca
JOIN Course_Offerings co ON ca.course_offering_id = co.course_offering_id
JOIN Courses c ON co.course_id = c.course_id
JOIN Grades g ON g.student_id = ca.student_id AND g.course_offering_id = ca.course_offering_id
JOIN Students s ON ca.student_id = s.student_id AND co.semester = s.semester
GROUP BY ca.student_id, co.semester;

CREATE OR REPLACE VIEW Student_Current_Sem_Courses_Grades AS
SELECT
    ca.student_id,
    c.course_name,
    c.credits,
    g.grade
FROM Course_Allotted ca
JOIN Course_Offerings co ON ca.course_offering_id = co.course_offering_id
JOIN Courses c ON co.course_id = c.course_id
JOIN Students s ON ca.student_id = s.student_id AND co.semester = s.semester
LEFT JOIN Grades g ON g.student_id = ca.student_id AND g.course_offering_id = ca.course_offering_id;

CREATE OR REPLACE VIEW Student_Previous_SGPA AS
SELECT
    ca.student_id,
    co.semester,
    SUM(c.credits * CASE g.grade
        WHEN 'Ex' THEN 10 WHEN 'A' THEN 9 WHEN 'B' THEN 8
        WHEN 'C' THEN 7 WHEN 'D' THEN 6 WHEN 'E' THEN 5
        WHEN 'P' THEN 4 ELSE 0 END
    ) / NULLIF(SUM(CASE WHEN g.grade <> 'F' THEN c.credits ELSE 0 END), 0) AS sgpa
FROM Course_Allotted ca
JOIN Course_Offerings co ON ca.course_offering_id = co.course_offering_id
JOIN Courses c ON co.course_id = c.course_id
JOIN Grades g ON g.student_id = ca.student_id AND g.course_offering_id = ca.course_offering_id
JOIN Students s ON ca.student_id = s.student_id AND co.semester <> s.semester
GROUP BY ca.student_id, co.semester;

CREATE OR REPLACE VIEW Faculty_Courses_Taught AS
SELECT
    co.faculty_id,
    c.course_name,
    co.course_offering_id,
    co.semester,
    co.year_offering
FROM Course_Offerings co
JOIN Courses c ON co.course_id = c.course_id;

CREATE OR REPLACE VIEW Faculty_Leave_Approvals AS
SELECT
    fa.faculty_id,
    lr.request_id,
    lr.student_id,
    s.student_name,
    lr.start_date,
    lr.end_date,
    lr.reason,
    lr.status
FROM Leave_Requests lr
JOIN Students s ON lr.student_id = s.student_id
JOIN Faculty_Advisor fa ON lr.student_id = fa.student_id;

CREATE OR REPLACE VIEW Faculty_Course_Students AS
SELECT
    ca.course_offering_id,
    ca.student_id
FROM Course_Allotted ca;

CREATE OR REPLACE VIEW Faculty_Advisory_Students AS
SELECT
    fa.faculty_id,
    fa.student_id
FROM Faculty_Advisor fa;

-- ========================================
-- PART 8: INDEXES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_users_role ON Users(role);
CREATE INDEX IF NOT EXISTS idx_departments_head ON Departments(head_dept_id);
CREATE INDEX IF NOT EXISTS idx_students_department ON Students(department_id);
CREATE INDEX IF NOT EXISTS idx_students_discipline ON Students(discipline_id);
CREATE INDEX IF NOT EXISTS idx_students_semester ON Students(semester);
CREATE INDEX IF NOT EXISTS idx_faculty_department ON Faculty(department_id);
CREATE INDEX IF NOT EXISTS idx_advisor_faculty ON Faculty_Advisor(faculty_id);
CREATE INDEX IF NOT EXISTS idx_courses_department ON Courses(department_id);
CREATE INDEX IF NOT EXISTS idx_prereq_main ON Prerequisites(main_course_id);
CREATE INDEX IF NOT EXISTS idx_prereq_course ON Prerequisites(prereq_course_id);
CREATE INDEX IF NOT EXISTS idx_offering_faculty ON Course_Offerings(faculty_id);
CREATE INDEX IF NOT EXISTS idx_offering_course ON Course_Offerings(course_id);
CREATE INDEX IF NOT EXISTS idx_offering_discipline ON Course_Offerings(discipline_id);
CREATE INDEX IF NOT EXISTS idx_offering_year ON Course_Offerings(year_offering);
CREATE INDEX IF NOT EXISTS idx_allotted_student ON Course_Allotted(student_id);
CREATE INDEX IF NOT EXISTS idx_allotted_offering ON Course_Allotted(course_offering_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON Attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_offering ON Attendance(course_offering_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON Attendance(class_date);
CREATE INDEX IF NOT EXISTS idx_grades_student ON Grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_offering ON Grades(course_offering_id);
CREATE INDEX IF NOT EXISTS idx_feedback_student ON Feedback(student_id);
CREATE INDEX IF NOT EXISTS idx_feedback_offering ON Feedback(course_offering_id);
CREATE INDEX IF NOT EXISTS idx_schedule_offering ON Scheduled_class(course_offering_id);
CREATE INDEX IF NOT EXISTS idx_schedule_room ON Scheduled_class(building_name, room_number);
CREATE INDEX IF NOT EXISTS idx_leave_student ON Leave_Requests(student_id);
CREATE INDEX IF NOT EXISTS idx_leave_status ON Leave_Requests(status);
CREATE INDEX IF NOT EXISTS idx_onleave_student ON On_leave(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_payment_student ON Fee_Payment(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_payment_sem ON Fee_Payment(semester);
CREATE INDEX IF NOT EXISTS idx_fee_remission_student ON Fee_Remission_Application(student_id);
CREATE INDEX IF NOT EXISTS idx_supp_student ON Supplementary_exams(student_id);
CREATE INDEX IF NOT EXISTS idx_supp_offering ON Supplementary_exams(course_offering_id);
CREATE INDEX IF NOT EXISTS idx_backlog_student ON Backlogs(student_id);
CREATE INDEX IF NOT EXISTS idx_backlog_course ON Backlogs(course_id);
CREATE INDEX IF NOT EXISTS idx_exam_offering ON Exams(course_offering_id);
CREATE INDEX IF NOT EXISTS idx_exam_date ON Exams(date_of_exam);
CREATE INDEX IF NOT EXISTS idx_exam_seating_student ON Exam_Seating(student_id);
CREATE INDEX IF NOT EXISTS idx_registration_student ON Course_Registration(student_id);
CREATE INDEX IF NOT EXISTS idx_registration_course ON Course_Registration(course_offering_id);
CREATE INDEX IF NOT EXISTS idx_registration_sem ON Course_Registration(semester);
CREATE INDEX IF NOT EXISTS idx_registration_approved ON Course_Registration(approved);
CREATE INDEX IF NOT EXISTS idx_cdc_cgpa ON CDC(cgpa_cutoff);
CREATE INDEX IF NOT EXISTS idx_cdc_dept ON CDC_Eligible_Departments(department_id);
CREATE INDEX IF NOT EXISTS idx_cdc_app_student ON CDC_Applications(student_id);
CREATE INDEX IF NOT EXISTS idx_cdc_app_cdc ON CDC_Applications(cdc_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_class_main ON Scheduled_class(building_name, room_number, scheduled_day, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_booked_class_main ON booked_class(building_name, room_number, scheduled_day, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_rooms_main ON Rooms(building_name, room_number);
CREATE INDEX IF NOT EXISTS idx_scheduled_class_day ON Scheduled_class(scheduled_day);

-- ========================================
-- DONE! All constraints, procedures,
-- triggers, views, and indexes loaded.
-- ========================================
