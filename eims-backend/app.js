require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const bcrypt = require('bcrypt');
const cron = require('node-cron');

const app = express();
const eimsBackendPort = Number(process.env.PORT) || 5000;
const bankFrontendBaseUrl = process.env.BANK_FRONTEND_URL || 'http://localhost:3001';

app.use(cors());
app.use(express.json());

const transporter = require('./mail');


pool.query("SELECT NOW()", (err) => {
  if (err) {
    console.log("Database connection failed", err);
  } else {
    console.log("Database connected");
  }
});

async function isRegistrationOpen() {
  const result = await pool.query(
    "SELECT registration_close_date FROM System_Config WHERE config_id = 1"
  );

  if (result.rows.length === 0) return false;

  const closeDate = result.rows[0].registration_close_date;
  return new Date(closeDate) >= new Date();
}

cron.schedule('0 0 * * *', async () => {
  try {
    const result = await pool.query(`
      DELETE FROM booked_class
      WHERE booking_date < CURRENT_DATE
    `);

    console.log("Old bookings deleted:", result.rowCount);

  } catch (err) {
    console.error("Cleanup error:", err);
  }
});

cron.schedule('0 0 30 6 *', async () => {
  try {
    await pool.query(`DELETE FROM Feedback`);
    console.log("Feedback deleted (June 30)");
  } catch (err) {
    console.error(err);
  }
});

cron.schedule('0 0 31 12 *', async () => {
  try {
    await pool.query(`DELETE FROM Feedback`);
    console.log("Feedback deleted (Dec 31)");
  } catch (err) {
    console.error(err);
  }
});

cron.schedule('0 0 30 6 *', async () => {
  try {
    await pool.query(`DELETE FROM Scheduled_class`);
    console.log("Scheduled classes cleared (June 30)");
  } catch (err) {
    console.error(err);
  }
});

cron.schedule('0 0 31 12 *', async () => {
  try {
    await pool.query(`DELETE FROM Scheduled_class`);
    console.log("Scheduled classes cleared (Dec 31)");
  } catch (err) {
    console.error(err);
  }
});

cron.schedule('0 0 * * *', async () => {
  try {
    const result = await pool.query(`
      DELETE FROM On_leave
      WHERE end_date < CURRENT_DATE
    `);

    console.log("Old leave records deleted:", result.rowCount);

  } catch (err) {
    console.error("Leave cleanup error:", err);
  }
});


cron.schedule('0 0 * * *', async () => {
  try {

    await pool.query(`
      DELETE FROM exam_seatings
      WHERE exam_date < CURRENT_DATE
    `);

    const result = await pool.query(`
      DELETE FROM exams
      WHERE exam_date < CURRENT_DATE
    `);

    console.log("Old exams deleted:", result.rowCount);

  } catch (err) {
    console.error("Exam cleanup error:", err);
  }
});


app.get('/', (req, res) => {
  res.send("Backend is running");
});


app.post('/signup', async (req, res) => {
  const { user_id, password, role } = req.body;

  try {
    if (
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[^A-Za-z0-9]/.test(password)
    ) {
      return res.status(400).json({
        message: "Password must contain at least 1 uppercase, 1 number, and 1 special character"
      });
    }

    const userCheck = await pool.query(
      "SELECT 1 FROM Users WHERE user_id = $1",
      [user_id]
    );

    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO Users (user_id, password, role) VALUES ($1, $2, $3)",
      [user_id, hashedPassword, role]
    );

    if (role === "Student") {
      await pool.query(
        "INSERT INTO Students (student_id) VALUES ($1)",
        [user_id]
      );
    }
    if (role === "Faculty") {
      await pool.query(
        "INSERT INTO Faculty (faculty_id) VALUES ($1)",
        [user_id]
      );
    }

    res.json({ message: "Signup successful" });

  } catch (err) {
    console.error("FULL ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});


app.post('/login', async (req, res) => {
  const { user_id, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM Users WHERE user_id = $1",
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = result.rows[0];

    // Try bcrypt comparison first (for newly hashed passwords)
    let isMatch = await bcrypt.compare(password, user.password).catch(() => false);
    
    // If bcrypt fails, try plain text comparison (for existing users with plain passwords)
    if (!isMatch && password === user.password) {
      isMatch = true;
    }

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // If password was plain text, hash it now and update the database
    if (password === user.password && !user.password.startsWith('$2')) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query(
        "UPDATE Users SET password = $1 WHERE user_id = $2",
        [hashedPassword, user_id]
      );
    }

    res.json({
      message: "Login successful",
      role: user.role
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post('/student/profile', async (req, res) => {
  const {
    student_id,
    student_name,
    contact_no,
    college_email,
    personal_email,
    residence_address,
    join_date,
    semester,
    department_id,
    discipline_id
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE Students
       SET student_name = $1,
           contact_no = $2,
           college_email = $3,
           personal_email = $4,
           residence_address = $5,
           join_date = $6,
           semester = $7,
           department_id = $8,
           discipline_id = $9
       WHERE student_id = $10
       RETURNING *`,
      [
        student_name,
        contact_no,
        college_email,
        personal_email,
        residence_address,
        join_date,
        semester,
        department_id,
        discipline_id,
        student_id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({
      message: "Profile updated successfully",
      data: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating profile" });
  }
});

app.get('/student/profile/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM Students WHERE student_id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching profile");
  }
});

app.get('/users', async (req, res) => {
  try {
    const result = await pool.query("SELECT user_id, role FROM Users");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching users");
  }
});

app.get('/student/registrations/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM Student_Registration_View WHERE student_id = $1`,
      [id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching registrations");
  }
});


app.post('/student/registration', async (req, res) => {
  const { student_id, course_offering_id, selected } = req.body;

  try {
    const open = await isRegistrationOpen();

    if (!open) {
      return res.status(403).json({
        message: "Registration window closed"
      });
    }

    await pool.query(
      `UPDATE Course_Registration
       SET selected = $1
       WHERE student_id = $2
       AND course_offering_id = $3`,
      [selected, student_id, course_offering_id]
    );

    res.json({ message: "Course selection updated" });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating selection");
  }
});


app.get('/faculty/pending/:faculty_id', async (req, res) => {
  const { faculty_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT DISTINCT srv.student_id,srv.student_name
       FROM Student_Registration_View srv
       JOIN Faculty_Advisory_Students fas 
         ON srv.student_id = fas.student_id
       WHERE fas.faculty_id = $1
       AND srv.selected = TRUE
       AND srv.approved = FALSE`,
      [faculty_id]
    );

    res.json(result.rows);

  } catch (err) {
    res.status(500).send("Error fetching approvals");
  }
});

app.get('/faculty/student-courses/:student_id', async (req, res) => {
  const { student_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT 
          srv.course_offering_id,
          srv.course_id,
          srv.course_name,
          srv.faculty_name,
          srv.approved
       FROM Student_Registration_View srv
       WHERE srv.student_id = $1
       AND srv.approved = FALSE`,
      [student_id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching student courses");
  }
});


app.post('/faculty/approve', async (req, res) => {
  const { student_id, course_offering_id } = req.body;

  try {
    await pool.query(
      `UPDATE Course_Registration
       SET approved = TRUE
       WHERE student_id = $1
       AND course_offering_id = $2`,
      [student_id, course_offering_id]
    );

    const pending = await pool.query(
      `SELECT 1 FROM Course_Registration
       WHERE student_id = $1 AND approved = FALSE`,
      [student_id]
    );

    if (pending.rows.length > 0) {
      return res.json({ message: "Course approved (waiting for all approvals)" });
    }

    const studentRes = await pool.query(
      `SELECT college_email FROM Students WHERE student_id = $1`,
      [student_id]
    );

    const email = studentRes.rows[0].college_email;

    const coursesRes = await pool.query(
      `SELECT course_name, faculty_name, semester
       FROM Student_course_view
       WHERE student_id = $1`,
      [student_id]
    );

    /*let courseList = coursesRes.rows
      .map(c => `• ${c.course_name} (Faculty: ${c.faculty_name}, Sem: ${c.semester})`)
      .join('\n');

      await transporter.sendMail({
      from: '23cs01028@iitbbs.ac.in',
      to: email,
      subject: 'Course Registration Approved',
      text: `Your course registration is fully approved.\n\nRegistered Courses:\n${courseList}`
    });*/

    res.json({ message: "All courses approved. Email sent." });

  } catch (err) {
  console.error("FULL ERROR:", err);
  res.status(500).json({ error: err.message });
}
});

app.get('/student/courses/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM Student_Course_View
       WHERE student_id = $1`,
      [id]
    );

    res.json(result.rows);

  } catch (err) {
    res.status(500).send("Error fetching courses");
  }
});

app.get('/student/:id/fee-status', async (req, res) => {
    const { id } = req.params;
    try {
        // Get overall fee status
        const feeResult = await pool.query(
            `SELECT 
                s.student_id,
                d.fees as total_fee,
                (d.fees - b.remaining_balance) as amount_paid,
                b.remaining_balance as net_payable
            FROM Students s
            JOIN Discipline d ON s.discipline_id = d.discipline_id
            JOIN Balance b ON s.student_id = b.student_id
            WHERE s.student_id = $1`,
            [id]
        );

        if (feeResult.rows.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const feeData = feeResult.rows[0];

        // Get semester-wise fee breakdown for all 8 semesters
        const semesterResult = await pool.query(
            `WITH semesters AS (
                SELECT 1 as semester UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 
                UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8
            )
            SELECT 
                sem.semester,
                d.fees as fee_amount,
                COALESCE(SUM(fp.amount_paid), 0) as paid_amount,
                d.fees - COALESCE(SUM(fp.amount_paid), 0) as balance,
                CASE 
                    WHEN d.fees - COALESCE(SUM(fp.amount_paid), 0) <= 0 THEN 'paid'
                    WHEN CURRENT_DATE > (SELECT registration_close_date FROM System_Config LIMIT 1) THEN 'overdue'
                    ELSE 'pending'
                END as status
            FROM Students s
            JOIN Discipline d ON s.discipline_id = d.discipline_id
            CROSS JOIN semesters sem
            LEFT JOIN Fee_Payment fp ON s.student_id = fp.student_id AND fp.semester = sem.semester
            WHERE s.student_id = $1 AND sem.semester = s.semester
            GROUP BY sem.semester, d.fees
            ORDER BY sem.semester`,
            [id]
        );

        console.log("Semester fee status for student", id, ":", semesterResult.rows);

        res.json({
            student_id: feeData.student_id,
            total_fee: feeData.total_fee,
            amount_paid: feeData.amount_paid,
            net_payable: feeData.net_payable,
            semesters: semesterResult.rows
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.post('/student/:id/pay', async (req, res) => {
  const { id } = req.params;
  const { semester, amount_paid } = req.body;

  console.log("Pay endpoint called with:", { id, semester, amount_paid });

  try {
    const configRes = await pool.query(
      `SELECT is_fees_open FROM System_Config WHERE config_id = 1`
    );

    console.log("Config response:", configRes.rows);

    const isOpen = configRes.rows[0]?.is_fees_open;

    if (!isOpen) {
      console.log("Fees are closed");
      return res.status(403).json({
        message: "Fee payment is currently closed by admin"
      });
    }

   
    const payment_url = `${bankFrontendBaseUrl}?student_id=${id}&semester=${semester}&amount=${amount_paid}`;

    console.log("Sending payment_url:", payment_url);

    res.json({
      message: "Redirect to payment portal",
      payment_url
    });

  } catch (err) {
    console.error("Error initiating payment:", err);
    res.status(500).json({
      message: "Error initiating payment"
    });
  }
});

app.post('/student/payment-success', async (req, res) => {
  const { student_id, semester, amount } = req.body;

  console.log("=== PAYMENT SUCCESS ENDPOINT CALLED ===");
  console.log("Received data:", { student_id, semester, amount });

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log("Calling make_payment stored procedure...");

    const result = await client.query(
      `SELECT make_payment($1, $2, $3)`,
      [student_id, semester, amount]
    );

    console.log("Stored procedure result:", result);

    await client.query('COMMIT');

    console.log("Payment recorded successfully in EIMS");

    res.json({ message: "EIMS updated after payment" });

  } catch (err) {
    console.error("ERROR in payment-success:", err);
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});


app.get('/student/:id/payment-history', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `SELECT * FROM Student_Payment_History WHERE student_id = $1`,
            [id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/student/:id/faculty-advisor', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `SELECT * FROM Student_Faculty_Advisor WHERE student_id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Faculty Advisor not assigned' });
        }

        res.json(result.rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/student/:id/current-sgpa', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT semester, sgpa 
       FROM current_sem_sgpa 
       WHERE student_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.json({ message: "No current SGPA found" });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching current SGPA");
  }
});

app.get('/student/:id/cgpa', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT cgpa, total_credits 
       FROM Results 
       WHERE student_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.json({ message: "No CGPA found" });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching CGPA");
  }
});

app.get('/student/:id/previous-sgpa', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT semester, sgpa
       FROM Student_Previous_SGPA
       WHERE student_id = $1
       ORDER BY semester`,
      [id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching previous SGPA");
  }
});

app.get('/student/:id/current-courses', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT course_name, credits, grade
       FROM Student_Current_Sem_Courses_Grades
       WHERE student_id = $1`,
      [id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching current courses");
  }
});

app.get('/student/:id/semester/:sem/transcript', async (req, res) => {
  const { id, sem } = req.params;

  try {
    const result = await pool.query(
      `SELECT course_name, credits, grade
       FROM Student_All_Semester_Grades
       WHERE student_id = $1 AND semester = $2`,
      [id, sem]
    );

    if (result.rows.length === 0) {
      return res.json({ message: "No data for this semester" });
    }

    res.json({
      semester: sem,
      courses: result.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching transcript");
  }
});

app.get('/student/:id/attendance', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT *
       FROM Student_Attendance_Summary
       WHERE student_id = $1`,
      [id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching attendance");
  }
});

app.get('/student/:id/feedback-courses', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT course_offering_id, course_name,faculty_name
       FROM Student_Course_View
       WHERE student_id = $1
       AND semester = (
         SELECT semester FROM Students WHERE student_id = $1
       )`,
      [id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching courses");
  }
});

app.post('/student/submit-feedback', async (req, res) => {
  let { student_id, course_offering_id, feedback } = req.body;

  try {
    feedback = feedback.trim();

    await pool.query(
      `SELECT submit_feedback($1, $2, $3)`,
      [student_id, course_offering_id, feedback]
    );

    res.json({ message: "Feedback submitted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

app.get('/student/:id/submitted-feedback', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT 
          fb.student_id,
          fb.course_offering_id,
          c.course_name,
          fc.faculty_id,
          fc.faculty_name,
          fb.feedback
       FROM Feedback fb
       JOIN Course_Offerings co ON fb.course_offering_id = co.course_offering_id
       JOIN Courses c ON co.course_id = c.course_id
       JOIN Faculty fc ON co.faculty_id = fc.faculty_id
       WHERE fb.student_id = $1
       ORDER BY c.course_name`,
      [id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching submitted feedback");
  }
});

app.post('/student/apply-leave', async (req, res) => {
  let { student_id, start_date, end_date, reason } = req.body;

  try {
    reason = reason.trim();

    await pool.query(
      `SELECT apply_leave($1, $2, $3, $4)`,
      [student_id, start_date, end_date, reason]
    );

    res.json({ message: "Leave request submitted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

app.get('/student/:id/leave-requests', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT *
       FROM Student_Leave_Requests
       WHERE student_id = $1
       ORDER BY start_date DESC`,
      [id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching leave requests");
  }
});

app.post('/student/apply-fee-remission', async (req, res) => {
  const { student_id } = req.body;

  try {
    await pool.query(
      `SELECT apply_fee_remission($1)`,
      [student_id]
    );

    res.json({ message: "Fee remission application submitted" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

app.get('/student/:id/fee-remission-status', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT status
       FROM Fee_Remission_Application
       WHERE student_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.json({ status: "Not Applied" });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching status");
  }
});

app.get('/student/:id/exams', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT course_name, date_of_exam, building_name, room_number
       FROM Student_Exam_View
       WHERE student_id = $1
       ORDER BY date_of_exam`,
      [id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching exams");
  }
});

app.get('/student/:id/timetable', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT *
       FROM Student_Timetable_View
       WHERE student_id = $1
       ORDER BY 
         CASE scheduled_day
           WHEN 'Monday' THEN 1
           WHEN 'Tuesday' THEN 2
           WHEN 'Wednesday' THEN 3
           WHEN 'Thursday' THEN 4
           WHEN 'Friday' THEN 5
         END,
         start_time`,
      [id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching timetable");
  }
});

app.get('/student/:id/supplementary-exams', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT course_name, price, course_offering_id
       FROM Student_Supplementary_Exams
       WHERE student_id = $1`,
      [id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching supplementary exams");
  }
});

app.get('/faculty/course/:course_offering_id/students-attendance', async (req, res) => {
  const { course_offering_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT s.student_id, s.student_name
       FROM Faculty_Course_Students fcs
       JOIN Students s 
         ON fcs.student_id = s.student_id
       WHERE fcs.course_offering_id = $1`,
      [course_offering_id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching students");
  }
});

app.post('/faculty/mark-attendance', async (req, res) => {
  const { course_offering_id, date, present_student_ids } = req.body;

  try {
    await pool.query(
      `CALL mark_attendance($1, $2, $3)`,
      [course_offering_id, date, present_student_ids]
    );

    res.json({ message: "Attendance marked successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

app.get('/faculty/:id/courses', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT course_name, course_offering_id, semester, year_offering
       FROM Faculty_Courses_Taught
       WHERE faculty_id = $1`,
      [id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching courses");
  }
});

app.get('/faculty/course/:course_offering_id/students', async (req, res) => {
  const { course_offering_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT s.student_id, s.student_name
       FROM Faculty_Course_Students fcs
       JOIN Students s 
         ON fcs.student_id = s.student_id
       WHERE fcs.course_offering_id = $1`,
      [course_offering_id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching students");
  }
});

app.post('/faculty/upload-grades', async (req, res) => {
  const { course_offering_id, grades } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    for (let g of grades) {
      await client.query(
        `SELECT upload_grade($1, $2, $3)`,
        [g.student_id, course_offering_id, g.grade]
      );
    }

    await client.query('COMMIT');

    res.json({ message: "Grades uploaded successfully" });

    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: err.message });
  } finally {
    client.release();
  }
});

app.get('/faculty/:id/current-courses', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT course_name, course_offering_id, semester, year_offering
       FROM Faculty_Courses_Taught
       WHERE faculty_id = $1
       AND year_offering = EXTRACT(YEAR FROM CURRENT_DATE)
       AND (
         (EXTRACT(MONTH FROM CURRENT_DATE) < 6 AND semester % 2 = 0)
         OR
         (EXTRACT(MONTH FROM CURRENT_DATE) >= 6 AND semester % 2 = 1)
       )`,
      [id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching current courses");
  }
});

app.get('/faculty/:id/leave-requests', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT request_id, student_id, student_name,
              start_date, end_date, reason, status
       FROM Faculty_Leave_Approvals
       WHERE faculty_id = $1
       AND status = 'Pending'`,
      [id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching leave requests");
  }
});

app.post('/faculty/leave-action', async (req, res) => {
  const { request_id, action } = req.body; 

  try {
    await pool.query(
      `UPDATE Leave_Requests
       SET status = $1
       WHERE request_id = $2`,
      [action, request_id]
    );

    res.json({ message: `Leave ${action}` });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating leave status");
  }
});

app.get('/faculty/:id/advisory-students', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT sfa.student_id, s.student_name
       FROM Student_Faculty_Advisor sfa
       JOIN Students s 
         ON sfa.student_id = s.student_id
       WHERE sfa.faculty_id = $1`,
      [id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching advisory students");
  }
});

app.get('/faculty/course/:course_offering_id/feedbacks', async (req, res) => {
  const { course_offering_id } = req.params;
  
  try {
    const result = await pool.query(
      `SELECT f.feedback
      FROM Feedback f
      JOIN Students s 
      ON f.student_id = s.student_id
      WHERE f.course_offering_id = $1`,
      [course_offering_id]
    );
    
    res.json(result.rows);
    
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching feedback");
  }
});



app.get('/faculty/available-slots', async (req, res) => {
  const { day, course_offering_id } = req.query;

  try {
    if (!course_offering_id) {
      return res.status(400).json({
        error: "course_offering_id is required"
      });
    }

    const result = await pool.query(
      `SELECT * FROM get_room_availability($1)`,
      [day || null]
    );

    res.json({
      course_offering_id,
      slots: result.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching slots");
  }
});

app.post('/faculty/book-rooms', async (req, res) => {
  const { bookings } = req.body;

  try {
    if (!bookings || bookings.length === 0) {
      return res.status(400).json({
        error: "Bookings array is required"
      });
    }

    for (const b of bookings) {
      if (!b.course_offering_id) {
        return res.status(400).json({
          error: "course_offering_id is required for all bookings"
        });
      }

      if (!b.booking_date) {
        return res.status(400).json({
          error: "booking_date is required for all bookings"
        });
      }

      if (!b.start_time || !b.end_time) {
        return res.status(400).json({
          error: "start_time and end_time are required"
        });
      }
    }

    await pool.query(
      `CALL insert_bookings($1::json)`,
      [JSON.stringify(bookings)]
    );

    res.status(201).json({
      message: "Bookings successful"
    });

  } catch (err) {
    console.error(err);

    res.status(400).json({
      error: err.message
    });
  }
});


app.get('/faculty/:id/bookings', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT *
       FROM booked_class
       WHERE faculty_id = $1
       ORDER BY scheduled_day, start_time`,
      [id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching bookings");
  }
});

app.listen(eimsBackendPort, () => {
  console.log(`Server running on port ${eimsBackendPort}`);
});

