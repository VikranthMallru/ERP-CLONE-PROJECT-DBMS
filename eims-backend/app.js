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
      DELETE FROM Exam_Seating
      WHERE exam_id IN (SELECT exam_id FROM Exams WHERE date_of_exam < CURRENT_DATE)
    `);

    const result = await pool.query(`
      DELETE FROM Exams
      WHERE date_of_exam < CURRENT_DATE
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
  const { 
    user_id, 
    password, 
    role,
    // Student fields
    student_name,
    contact_no,
    college_email,
    personal_email,
    residence_address,
    join_date,
    semester,
    department_id,
    discipline_id,
    // Faculty fields
    faculty_name,
    email
  } = req.body;

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
        `INSERT INTO Students (student_id, student_name, contact_no, college_email, personal_email, residence_address, join_date, semester, department_id, discipline_id) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [user_id, student_name || null, contact_no || null, college_email || null, personal_email || null, residence_address || null, join_date || null, semester || null, department_id || null, discipline_id || null]
      );
    }
    if (role === "Faculty") {
      await pool.query(
        `INSERT INTO Faculty (faculty_id, faculty_name, contact_no, email, department_id) 
         VALUES ($1, $2, $3, $4, $5)`,
        [user_id, faculty_name || null, contact_no || null, email || null, department_id || null]
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
        student_name || null,
        contact_no || null,
        college_email || null,
        personal_email || null,
        residence_address || null,
        join_date || null,
        semester || null,
        department_id || null,
        discipline_id || null,
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

// Faculty Profile Endpoints
app.post('/faculty/profile', async (req, res) => {
  const {
    faculty_id,
    faculty_name,
    contact_no,
    email,
    department_id
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE Faculty
       SET faculty_name = $1,
           contact_no = $2,
           email = $3,
           department_id = $4
       WHERE faculty_id = $5
       RETURNING *`,
      [
        faculty_name || null,
        contact_no || null,
        email || null,
        department_id || null,
        faculty_id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    res.json({
      message: "Profile updated successfully",
      data: result.rows[0]
    });

  } catch (err) {
    console.error("Faculty profile update error:", err);
    res.status(500).json({ message: "Error updating profile: " + err.message });
  }
});

app.get('/faculty/profile/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM Faculty WHERE faculty_id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Faculty not found" });
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
    console.log('Received approval request:', { student_id, course_offering_id });

    // First, verify the record exists
    const checkRes = await pool.query(
      `SELECT * FROM Course_Registration
       WHERE student_id = $1
       AND course_offering_id = $2`,
      [student_id, course_offering_id]
    );
    
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ error: 'Course registration not found' });
    }
    
    console.log('Found registration record:', checkRes.rows[0]);

    // Update the approved field
    const updateResult = await pool.query(
      `UPDATE Course_Registration
       SET approved = TRUE
       WHERE student_id = $1
       AND course_offering_id = $2
       RETURNING *`,
      [student_id, course_offering_id]
    );
    
    console.log('Update result - rows affected:', updateResult.rowCount);
    if (updateResult.rows.length > 0) {
      console.log('Updated record:', updateResult.rows[0]);
    }

    // Check if the record was deleted by the trigger
    const afterDeleteCheck = await pool.query(
      `SELECT * FROM Course_Registration
       WHERE student_id = $1
       AND course_offering_id = $2`,
      [student_id, course_offering_id]
    );
    
    console.log('After trigger - record still in Course_Registration?', afterDeleteCheck.rows.length > 0);

    // Check if record was added to Course_Allotted
    const courseAllottedCheck = await pool.query(
      `SELECT * FROM Course_Allotted
       WHERE student_id = $1
       AND course_offering_id = $2`,
      [student_id, course_offering_id]
    );
    
    console.log('Record in Course_Allotted?', courseAllottedCheck.rows.length > 0);

    // Check for pending approvals
    const pending = await pool.query(
      `SELECT COUNT(*) as count FROM Course_Registration
       WHERE student_id = $1 AND approved = FALSE`,
      [student_id]
    );
    
    const pendingCount = parseInt(pending.rows[0].count);
    console.log('Remaining pending approvals for student:', pendingCount);

    if (pendingCount > 0) {
      return res.json({ 
        message: "Course approved (waiting for all approvals)",
        pendingCount: pendingCount
      });
    }

    res.json({ 
      message: "All courses approved successfully",
      registered: courseAllottedCheck.rows.length > 0
    });

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
      `SELECT request_id, student_id, start_date, end_date, reason, status, applied_on
       FROM Leave_Requests
       WHERE student_id = $1
       ORDER BY applied_on DESC`,
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
  const { course_offering_id, date, attendance, present_student_ids } = req.body;

  try {
    // Support both formats: attendance array or direct present_student_ids
    let ids = present_student_ids;
    if (attendance && Array.isArray(attendance)) {
      ids = attendance
        .filter((record) => record.is_present)
        .map((record) => record.student_id);
    }

    await pool.query(
      `CALL mark_attendance($1, $2, $3)`,
      [course_offering_id, date, ids]
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
      `SELECT course_name, course_offering_id, semester, year_offering, capacity
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
      `SELECT fct.course_name, fct.course_offering_id, fct.semester, fct.year_offering, fct.capacity,
        (SELECT COUNT(*) FROM Faculty_Course_Students fcs WHERE fcs.course_offering_id = fct.course_offering_id) AS enrolled_students
       FROM Faculty_Courses_Taught fct
       WHERE fct.faculty_id = $1
       AND fct.year_offering = EXTRACT(YEAR FROM CURRENT_DATE)`,
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
    console.log('Fetching leave requests for faculty:', id);
    
    const result = await pool.query(
      `SELECT 
        lr.request_id,
        lr.student_id,
        s.student_name,
        lr.start_date,
        lr.end_date,
        lr.reason,
        lr.status,
        lr.applied_on
       FROM Leave_Requests lr
       JOIN Faculty_Advisor fa ON lr.student_id = fa.student_id
       JOIN Students s ON lr.student_id = s.student_id
       WHERE fa.faculty_id = $1
       ORDER BY lr.applied_on DESC`,
      [id]
    );

    console.log('Leave requests:', result.rows);
    res.json(result.rows);

  } catch (err) {
    console.error('Error fetching leave requests:', err);
    res.status(500).json({ error: "Error fetching leave requests", details: err.message });
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

  // validate and coerce to integer
  const cid = parseInt(course_offering_id, 10);
  if (isNaN(cid)) {
    return res.status(400).json({ error: 'Invalid course_offering_id' });
  }

  try {
    const result = await pool.query(
      `SELECT f.student_id, f.feedback, co.course_offering_id, c.course_name
       FROM Feedback f
       JOIN Course_Offerings co ON f.course_offering_id = co.course_offering_id
       JOIN Courses c ON co.course_id = c.course_id
       WHERE f.course_offering_id = $1
       ORDER BY f.student_id`,
      [cid]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching feedback");
  }
});



app.get('/faculty/available-slots', async (req, res) => {
  const { building } = req.query;

  try {
    console.log('Fetching available rooms for building:', building);
    
    const query = building
      ? `SELECT DISTINCT
          r.room_number,
          r.building_name,
          r.capacity
         FROM Rooms r
         WHERE r.building_name = $1
         ORDER BY r.building_name, r.room_number`
      : `SELECT DISTINCT
          r.room_number,
          r.building_name,
          r.capacity
         FROM Rooms r
         ORDER BY r.building_name, r.room_number`;

    const result = building
      ? await pool.query(query, [building])
      : await pool.query(query);

    const slots = result.rows.map(room => ({
      room_id: room.room_number,
      room_name: `Room ${room.room_number}`,
      building_name: room.building_name,
      building_number: room.building_name,
      capacity: room.capacity,
      room_capacity: room.capacity
    }));

    console.log('Available slots:', slots);
    res.json(slots);

  } catch (err) {
    console.error('Error fetching slots:', err);
    res.status(500).json({ error: "Error fetching slots", details: err.message });
  }
});

app.get('/faculty/buildings', async (req, res) => {
  try {
    console.log('Fetching available buildings');
    
    const result = await pool.query(
      `SELECT DISTINCT building_name
       FROM Rooms
       ORDER BY building_name`
    );

    const buildings = result.rows.map(row => row.building_name);

    console.log('Available buildings:', buildings);
    res.json(buildings);

  } catch (err) {
    console.error('Error fetching buildings:', err);
    res.status(500).json({ error: "Error fetching buildings", details: err.message });
  }
});

app.post('/faculty/book-class', async (req, res) => {
  const { course_offering_id, room_id, building_name, scheduled_day, start_time, end_time, booked_by_faculty_id } = req.body;

  try {
    console.log('Booking class request:', { course_offering_id, room_id, building_name, scheduled_day, start_time, end_time, booked_by_faculty_id });
    
    if (!course_offering_id || !room_id || !building_name || !scheduled_day || !start_time || !end_time || !booked_by_faculty_id) {
      return res.status(400).json({
        error: "All fields are required: course_offering_id, room_id, building_name, scheduled_day, start_time, end_time, booked_by_faculty_id"
      });
    }

    const result = await pool.query(
      `INSERT INTO booked_class 
       (course_offering_id, faculty_id, room_number, building_name, scheduled_day, start_time, end_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [course_offering_id, booked_by_faculty_id, room_id, building_name, scheduled_day, start_time, end_time]
    );

    console.log('Class booked:', result.rows[0]);
    res.status(201).json({
      message: "Class scheduled successfully",
      booking: result.rows[0]
    });

  } catch (err) {
    console.error('Class booking error:', err);
    res.status(400).json({
      error: err.message
    });
  }
});

app.post('/faculty/book-rooms', async (req, res) => {
  const { room_id, booking_reason, booked_by_faculty_id, booking_date, start_time, end_time } = req.body;

  try {
    console.log('Booking request:', { room_id, booking_reason, booked_by_faculty_id, booking_date, start_time, end_time });
    
    if (!room_id || !booking_reason || !booked_by_faculty_id) {
      return res.status(400).json({
        error: "room_id, booking_reason, and booked_by_faculty_id are required"
      });
    }

    const bookingStartTime = start_time || '09:00:00';
    const bookingEndTime = end_time || '10:00:00';

    const result = await pool.query(
      `INSERT INTO booked_class 
       (faculty_id, room_number, scheduled_day, start_time, end_time, building_name)
       VALUES ($1, $2, $3, $4, $5, 'Main Building')
       RETURNING *`,
      [booked_by_faculty_id, room_id, booking_date || new Date().toISOString().split('T')[0], bookingStartTime, bookingEndTime]
    );

    console.log('Booking created:', result.rows[0]);
    res.status(201).json({
      message: "Room booked successfully",
      booking: result.rows[0]
    });

  } catch (err) {
    console.error('Room booking error:', err);
    res.status(400).json({
      error: err.message
    });
  }
});


app.get('/faculty/:id/bookings', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT 
        bc.booking_id,
        bc.course_offering_id,
        bc.faculty_id,
        bc.room_number,
        bc.building_name,
        bc.scheduled_day,
        bc.start_time,
        bc.end_time,
        c.course_name,
        c.course_code,
        r.capacity
       FROM booked_class bc
       LEFT JOIN Course_Offerings co ON bc.course_offering_id = co.course_offering_id
       LEFT JOIN Courses c ON co.course_id = c.course_id
       LEFT JOIN Rooms r ON bc.room_number = r.room_number AND bc.building_name = r.building_name
       WHERE bc.faculty_id = $1
       ORDER BY bc.scheduled_day DESC, bc.start_time DESC`,
      [id]
    );

    const bookings = result.rows.map(row => ({
      booking_id: row.booking_id,
      course_offering_id: row.course_offering_id,
      faculty_id: row.faculty_id,
      room_id: row.room_number,
      room_name: `Room ${row.room_number}`,
      building_name: row.building_name,
      capacity: row.capacity,
      course_name: row.course_name,
      course_code: row.course_code,
      booking_date: row.scheduled_day,
      start_time: row.start_time,
      end_time: row.end_time,
      status: 'confirmed'
    }));

    console.log('Faculty bookings:', bookings);
    res.json(bookings);

  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ error: "Error fetching bookings", details: err.message });
  }
});

// Faculty Schedule
app.get('/faculty/:id/schedule', async (req, res) => {
  const { id } = req.params;

  try {
    console.log('Fetching schedule for faculty:', id);
    
    const result = await pool.query(
      `SELECT 
        sc.course_offering_id,
        sc.scheduled_day,
        sc.start_time,
        sc.end_time,
        sc.room_number,
        sc.building_name,
        c.course_id,
        c.course_name
       FROM Scheduled_class sc
       INNER JOIN Course_Offerings co ON sc.course_offering_id = co.course_offering_id
       INNER JOIN Courses c ON co.course_id = c.course_id
       WHERE co.faculty_id = $1
       ORDER BY 
         CASE 
           WHEN sc.scheduled_day = 'Monday' THEN 1
           WHEN sc.scheduled_day = 'Tuesday' THEN 2
           WHEN sc.scheduled_day = 'Wednesday' THEN 3
           WHEN sc.scheduled_day = 'Thursday' THEN 4
           WHEN sc.scheduled_day = 'Friday' THEN 5
           WHEN sc.scheduled_day = 'Saturday' THEN 6
           ELSE 7
         END,
         sc.start_time`,
      [id]
    );

    console.log('Query found', result.rows.length, 'scheduled classes for faculty:', id);
    
    const schedule = result.rows.map(row => ({
      course_offering_id: row.course_offering_id,
      course_id: row.course_id,
      course_name: row.course_name,
      scheduled_day: row.scheduled_day,
      start_time: row.start_time,
      end_time: row.end_time,
      room_number: row.room_number,
      building_name: row.building_name
    }));

    res.json(schedule);

  } catch (err) {
    console.error('Error fetching schedule:', err);
    res.status(500).json({ error: "Error fetching schedule", details: err.message });
  }
});

// Admin APIs
app.post('/admin/declare-results', async (req, res) => {
  const { results_declaration_date } = req.body;

  try {
    if (!results_declaration_date) {
      return res.status(400).json({ error: "results_declaration_date is required" });
    }

    console.log('Declaring results for date:', results_declaration_date);
    
    const result = await pool.query(
      `UPDATE System_Config 
       SET results_declaration_date = $1
       WHERE config_id = 1
       RETURNING *`,
      [results_declaration_date]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "System config not found" });
    }

    res.json({
      message: "Results declared successfully. CGPA updated for all students.",
      config: result.rows[0]
    });

  } catch (err) {
    console.error('Error declaring results:', err);
    res.status(500).json({ error: "Error declaring results", details: err.message });
  }
});

app.get('/admin/system-config', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM System_Config WHERE config_id = 1`
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "System config not found" });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error('Error fetching system config:', err);
    res.status(500).json({ error: "Error fetching system config", details: err.message });
  }
});

// Student Results APIs
app.get('/student/:id/results', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT cgpa, total_credits
       FROM Results
       WHERE student_id = $1`,
      [id]
    );

    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.json({ cgpa: 0, total_credits: 0 });
    }

  } catch (err) {
    console.error('Error fetching results:', err);
    res.status(500).json({ error: "Error fetching results", details: err.message });
  }
});

app.get('/student/:id/grades', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT 
        g.student_id,
        g.course_offering_id,
        g.grade,
        c.course_name,
        c.course_id,
        co.semester,
        co.year_offering,
        co.faculty_id
       FROM Grades g
       LEFT JOIN Course_Offerings co ON g.course_offering_id = co.course_offering_id
       LEFT JOIN Courses c ON co.course_id = c.course_id
       WHERE g.student_id = $1
       ORDER BY co.year_offering DESC, co.semester DESC`,
      [id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error('Error fetching grades:', err);
    res.status(500).json({ error: "Error fetching grades", details: err.message });
  }
});

// Admin SQL Console Endpoint
app.post('/admin/run-query', async (req, res) => {
  const { query, admin_id } = req.body;

  try {
    // Validate admin role
    if (!admin_id) {
      return res.status(403).json({ error: 'Admin ID required' });
    }

    // Check if user is admin
    const adminCheck = await pool.query(
      `SELECT role FROM Users WHERE user_id = $1`,
      [admin_id]
    );

    if (adminCheck.rows.length === 0 || adminCheck.rows[0].role !== 'Admin') {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }

    // Validate query
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({ error: 'Invalid query: Query cannot be empty' });
    }

    // Remove trailing semicolon and normalize
    let cleanQuery = query.trim();
    if (cleanQuery.endsWith(';')) {
      cleanQuery = cleanQuery.slice(0, -1).trim();
    }

    const queryUpper = cleanQuery.toUpperCase();

    // Allow SELECT, INSERT, UPDATE, DELETE queries
    if (!queryUpper.startsWith('SELECT') && !queryUpper.startsWith('INSERT') && 
        !queryUpper.startsWith('UPDATE') && !queryUpper.startsWith('DELETE')) {
      return res.status(400).json({ error: 'Invalid query: Only SELECT, INSERT, UPDATE, and DELETE queries are allowed' });
    }

    // Block dangerous DDL/DCL operations
    const dangerousKeywords = ['DROP', 'ALTER', 'TRUNCATE', 'CREATE', 'EXEC', 'EXECUTE', 'GRANT', 'REVOKE'];
    for (const keyword of dangerousKeywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(queryUpper)) {
        return res.status(400).json({ error: `Invalid query: ${keyword} operations are not allowed` });
      }
    }

    // Enforce LIMIT for SELECT queries
    let executionQuery = cleanQuery;
    if (queryUpper.startsWith('SELECT')) {
      if (!queryUpper.includes('LIMIT')) {
        executionQuery += ' LIMIT 100';
      } else {
        const limitMatch = executionQuery.match(/LIMIT\s+(\d+)/i);
        if (limitMatch && parseInt(limitMatch[1]) > 100) {
          executionQuery = executionQuery.replace(/LIMIT\s+\d+/i, 'LIMIT 100');
        }
      }
    }

    // Execute query with timeout
    const startTime = Date.now();
    let result;

    try {
      result = await Promise.race([
        pool.query(executionQuery),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Query timeout: exceeded 5 seconds')), 5000)
        )
      ]);
    } catch (timeoutErr) {
      if (timeoutErr.message.includes('timeout')) {
        return res.status(408).json({ error: 'Query timeout: exceeded 5 seconds maximum' });
      }
      throw timeoutErr;
    }

    const executionTime = Date.now() - startTime;
    const affectedRows = result.rows ? result.rows.length : (result.rowCount || 0);

    // Log the query
    try {
      await pool.query(
        `INSERT INTO Admin_Query_Logs (admin_id, query_string, executed_at, row_count, execution_time_ms)
         VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4)`,
        [admin_id, query, affectedRows, executionTime]
      );
    } catch (logErr) {
      console.error('Error logging query:', logErr);
    }

    res.json({
      rows: result.rows || [],
      rowCount: affectedRows,
      executionTime: executionTime,
      columns: result.fields ? result.fields.map(f => f.name) : []
    });

  } catch (err) {
    console.error('Error executing admin query:', err);

    try {
      const { admin_id: aid, query: q } = req.body;
      if (aid && q) {
        await pool.query(
          `INSERT INTO Admin_Query_Logs (admin_id, query_string, executed_at, error_message)
           VALUES ($1, $2, CURRENT_TIMESTAMP, $3)`,
          [aid, q, err.message]
        );
      }
    } catch (logErr) {
      console.error('Error logging query error:', logErr);
    }

    const errorMessage = err.message.includes('syntax error')
      ? `SQL Syntax Error: ${err.message}`
      : err.message.includes('does not exist')
      ? `Table/Column Error: ${err.message}`
      : `Query Error: ${err.message}`;

    res.status(400).json({ error: errorMessage });
  }
});

// Create Admin Query Logs table if it doesn't exist
pool.query(`
  CREATE TABLE IF NOT EXISTS Admin_Query_Logs (
    log_id SERIAL PRIMARY KEY,
    admin_id VARCHAR(50) NOT NULL,
    query_string TEXT NOT NULL,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    row_count INTEGER,
    execution_time_ms INTEGER,
    error_message TEXT,
    FOREIGN KEY (admin_id) REFERENCES Users(user_id)
  );

  CREATE INDEX IF NOT EXISTS idx_admin_query_logs_admin_id ON Admin_Query_Logs(admin_id);
  CREATE INDEX IF NOT EXISTS idx_admin_query_logs_timestamp ON Admin_Query_Logs(executed_at);
`).catch(err => console.error('Error creating Admin_Query_Logs table:', err));

app.listen(eimsBackendPort, () => {
  console.log(`Server running on port ${eimsBackendPort}`);
});

