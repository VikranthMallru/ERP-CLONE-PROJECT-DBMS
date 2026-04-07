--Registration options for Students

CREATE VIEW OR REPLACE Student_Registration_View AS
SELECT
    cr.student_id,
    s.student_name,
    co.course_offering_id,
    c.course_id,
    c.course_name,
    co.semester,
    f.faculty_id,
    f.faculty_name,
    cr.approved,
    cr.selected
FROM Course_Registration cr
JOIN Students s
    ON cr.student_id = s.student_id
JOIN Course_Offerings co
    ON cr.course_offering_id = co.course_offering_id
JOIN Courses c
    ON co.course_id = c.course_id
JOIN Faculty f
    ON co.faculty_id = f.faculty_id;

-- Student_Registered_Courses(after Registration)

CREATE VIEW Student_Course_View AS
SELECT
    ca.student_id,
    co.course_offering_id,
    c.course_id,
    c.course_name,
    co.semester,
    f.faculty_id,
    f.faculty_name
FROM Course_Allotted ca
JOIN Course_Offerings co
    ON ca.course_offering_id = co.course_offering_id
JOIN Courses c
    ON co.course_id = c.course_id
JOIN Faculty f
    ON co.faculty_id = f.faculty_id;


--Student_Attendance

CREATE VIEW Student_Attendance_View AS
SELECT
    a.student_id,
    a.course_offering_id,
    c.course_name,
    a.class_date,
    a.status
FROM Attendance a
JOIN Course_Offerings co
    ON a.course_offering_id = co.course_offering_id
JOIN Courses c
    ON co.course_id = c.course_id;


--All Semester Results

CREATE VIEW Student_All_Semester_Grades AS
SELECT
    g.student_id,
    c.course_name,
    co.semester,
    c.credits,
    g.grade
FROM Grades g
JOIN Course_Offerings co
    ON g.course_offering_id = co.course_offering_id
JOIN Courses c
    ON co.course_id = c.course_id;

--Current Semester Results

CREATE VIEW Student_SGPA AS
SELECT 
    ca.student_id,
    co.semester,

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
    /
    NULLIF(
        SUM(
            CASE 
                WHEN g.grade <> 'F' THEN c.credits
                ELSE 0
            END
        ), 0
    ) AS sgpa

FROM Course_Allotted ca
JOIN Course_Offerings co 
    ON ca.course_offering_id = co.course_offering_id
JOIN Courses c 
    ON co.course_id = c.course_id
JOIN Grades g 
    ON g.student_id = ca.student_id 
   AND g.course_offering_id = ca.course_offering_id

GROUP BY ca.student_id, co.semester;


--Fee Details

CREATE OR REPLACE VIEW Student_Fee_Status AS
SELECT 
    s.student_id,
    s.college_email,
    d.discipline_id,
    d.fees AS total_program_fee,
    (d.fees - b.remaining_balance) AS amount_paid, 
    b.remaining_balance
FROM Students s
JOIN Discipline d ON s.discipline_id = d.discipline_id
JOIN Balance b ON s.student_id = b.student_id;

--Fee payment history

CREATE OR REPLACE VIEW Student_Payment_History AS
SELECT 
    fp.payment_id,
    fp.student_id,
    s.college_email,
    fp.semester,
    fp.amount_paid,
    fp.payment_date,
    d.discipline_id
FROM Fee_Payment fp
JOIN Students s ON fp.student_id = s.student_id
JOIN Discipline d ON s.discipline_id = d.discipline_id
ORDER BY fp.payment_date DESC;

--Supplementary exam Registrations

CREATE VIEW Student_Supplementary_Exams AS
SELECT
    se.student_id,
    c.course_name,
    se.course_offering_id,
    se.price
FROM Supplementary_exams se
JOIN Course_Offerings co
    ON se.course_offering_id = co.course_offering_id
JOIN Courses c
    ON co.course_id = c.course_id;

--Student feedback

CREATE VIEW Student_Feedback_View AS
SELECT
    co.faculty_id,
    c.course_name,
    f.course_offering_id,
    f.feedback
FROM Feedback f
JOIN Course_Offerings co
    ON f.course_offering_id = co.course_offering_id
JOIN Courses c
    ON co.course_id = c.course_id;

--Leave Requests

CREATE VIEW Student_Leave_Requests AS
SELECT
    student_id,
    start_date,
    end_date,
    reason,
    status
FROM Leave_Requests;

--Faculty Advisors

CREATE VIEW Student_Faculty_Advisor AS
SELECT
    fa.student_id,
    f.faculty_id,
    f.faculty_name,
    f.email,
    f.contact_no,
    d.dept_name
FROM Faculty_Advisor fa
JOIN Faculty f ON fa.faculty_id = f.faculty_id
JOIN Departments d ON f.department_id = d.dept_id;


--Courses taught by faculty

CREATE VIEW Faculty_Courses_Taught AS
SELECT
    f.faculty_id,
    c.course_name,
    co.course_offering_id,
    co.year_offering,
    co.semester
FROM Faculty f
JOIN Course_Offerings co
    ON f.faculty_id = co.faculty_id
JOIN Courses c
    ON co.course_id = c.course_id;

--Students in a course

CREATE VIEW Faculty_Course_Students AS
SELECT
    co.faculty_id,
    ca.student_id,
    co.course_offering_id,
    c.course_name
FROM Course_Allotted ca
JOIN Course_Offerings co
    ON ca.course_offering_id = co.course_offering_id
JOIN Courses c
    ON co.course_id = c.course_id;

--Faculty Leave Approvals

CREATE OR REPLACE VIEW Faculty_Leave_Approvals AS
SELECT
    lr.request_id,
    lr.student_id,
    s.student_name,
    lr.start_date,
    lr.end_date,
    lr.reason,
    lr.status,
    sfa.faculty_id
FROM Leave_Requests lr
JOIN Student_Faculty_Advisor sfa
    ON lr.student_id = sfa.student_id
JOIN Students s
    ON lr.student_id = s.student_id;

--Students under Advisory

CREATE VIEW Faculty_Advisory_Students AS
SELECT
    fa.faculty_id,
    s.student_id,
    s.college_email,
    s.department_id
FROM Faculty_Advisor fa
JOIN Students s
    ON fa.student_id = s.student_id;

-- Feedback views

CREATE OR REPLACE VIEW view_faculty_feedback_comments AS
SELECT 
    co.faculty_id,
    c.course_id,
    c.course_name,
    co.semester,
    co.year_offering,
    fb.feedback 
FROM Feedback fb
JOIN Course_Offerings co ON fb.course_offering_id = co.course_offering_id
JOIN Courses c ON co.course_id = c.course_id;

-- Exam views for a student

CREATE VIEW Student_Exam_View AS
SELECT
    es.student_id,
    c.course_name,
    e.date_of_exam,
    e.building_name,
    e.room_number
FROM Exam_Seating es
JOIN Exams e
    ON es.exam_id = e.exam_id
JOIN Course_Offerings co
    ON e.course_offering_id = co.course_offering_id
JOIN Courses c
    ON co.course_id = c.course_id;

-- Show CDC Opportunities for a student

CREATE VIEW Eligible_CDC_For_Student AS
SELECT 
    s.student_id,
    c.cdc_id,
    c.company_name,
    c.apply_link,
    c.job_type,
    c.cgpa_cutoff
FROM Students s

JOIN Results r 
    ON s.student_id = r.student_id

JOIN CDC c 
    ON r.cgpa >= c.cgpa_cutoff

JOIN CDC_Eligible_Departments ced 
    ON c.cdc_id = ced.cdc_id
    AND ced.department_id = s.department_id;

-- Show Student SGPA

CREATE VIEW current_sem_sgpa AS
SELECT s.*
FROM Student_SGPA s
JOIN Students st
ON s.student_id = st.student_id
WHERE s.semester = st.semester;

-- Show result transcript for a student


CREATE VIEW Student_Current_Sem_Courses_Grades AS
SELECT
    ca.student_id,
    s.student_name,
    co.semester,
    co.course_offering_id,
    c.course_id,
    c.course_name,
    c.credits,
    g.grade,
    ca.mid_sem_marks,
    ca.end_sem_marks
FROM Course_Allotted ca

JOIN Students s
    ON ca.student_id = s.student_id

JOIN Course_Offerings co
    ON ca.course_offering_id = co.course_offering_id

JOIN Courses c
    ON co.course_id = c.course_id

LEFT JOIN Grades g
    ON g.student_id = ca.student_id
   AND g.course_offering_id = ca.course_offering_id

WHERE co.semester = s.semester;

-- Show Student previous SGPA

CREATE VIEW Student_Previous_SGPA AS
SELECT s.*
FROM Student_SGPA s
JOIN Students st
ON s.student_id = st.student_id
WHERE s.semester < st.semester;

-- Attendance view of this semester for all students

CREATE VIEW Student_Attendance_Summary AS
SELECT 
    scv.student_id,
    scv.course_name,

    COUNT(CASE WHEN a.status = 'Present' THEN 1 END) AS total_present,
    COUNT(CASE WHEN a.status = 'Absent' THEN 1 END) AS total_absent

FROM Student_Course_View scv

LEFT JOIN Attendance a
    ON scv.student_id = a.student_id
    AND scv.course_offering_id = a.course_offering_id

WHERE scv.semester = (
    SELECT s.semester 
    FROM Students s 
    WHERE s.student_id = scv.student_id
)

GROUP BY 
    scv.student_id,
    scv.course_name;

-- Student timetable view

CREATE OR REPLACE VIEW Student_Timetable_View AS

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
JOIN Scheduled_class sc
    ON ca.course_offering_id = sc.course_offering_id
JOIN Course_Offerings co
    ON sc.course_offering_id = co.course_offering_id
JOIN Courses c
    ON co.course_id = c.course_id

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
JOIN booked_class bc
    ON ca.course_offering_id = bc.course_offering_id
JOIN Course_Offerings co
    ON bc.course_offering_id = co.course_offering_id
JOIN Courses c
    ON co.course_id = c.course_id;

