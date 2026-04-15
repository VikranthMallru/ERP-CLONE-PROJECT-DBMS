require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const session = require('express-session');
const axios = require('axios');

const bankDB = require('./bank_db');

const app = express();
const bankBackendPort = Number(process.env.PORT) || 4000;
const eimsBackendUrl = process.env.EIMS_BACKEND_URL || 'http://localhost:5000';
const sessionSecret = process.env.SESSION_SECRET || 'bank-secret';
const bankFrontendUrl = process.env.BANK_FRONTEND_URL || 'http://localhost:3001';

app.use(cors({
  origin: bankFrontendUrl,
  credentials: true
}));
app.use(express.json());

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: true
}));

bankDB.query("SELECT NOW()", (err) => {
  if (err) console.log("DB failed", err);
  else console.log("Bank DB connected");
});


app.post('/signup', async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, password required"
      });
    }

    if (
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[^A-Za-z0-9]/.test(password)
    ) {
      return res.status(400).json({
        message: "Weak password"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await bankDB.query(
      `SELECT create_customer($1, $2, $3, $4)`,
      [name, email, phone, hashedPassword]
    );

    res.status(201).json({
      message: "Signup successful"
    });

  } catch (err) {

    if (err.code === '23505') {
      return res.status(400).json({
        message: "Email already exists"
      });
    }

    res.status(500).json({ message: "Server error" });
  }
});


app.get('/login', (req, res) => {
  res.send("Login using POST /login");
});

app.post('/login', async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const result = await bankDB.query(
      `SELECT * FROM Customers WHERE email = $1 OR name = $1`,
      [identifier]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    req.session.user = {
      customer_id: user.customer_id
    };

    res.json({
      message: "Login successful ✅"
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


app.get('/pay-fees', (req, res) => {
  const { student_id, semester, amount } = req.query;

  req.session.payment = {
    student_id,
    semester,
    amount
  };

  req.session.save(() => {
    res.redirect('/login');
  });
});


app.post('/account/transfer', async (req, res) => {
  const { from_account_id, to_account_id, amount, purpose, student_id, semester } = req.body;

  try {
    if (!from_account_id || !amount) {
      return res.status(400).json({
        message: "from_account_id and amount are required"
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        message: "Invalid amount"
      });
    }

    // Check sufficient balance
    const balance_result = await bankDB.query(
      `SELECT balance FROM Accounts WHERE account_id = $1`,
      [from_account_id]
    );

    if (balance_result.rows.length === 0) {
      return res.status(404).json({
        message: "Account not found"
      });
    }

    if (balance_result.rows[0].balance < amount) {
      return res.status(400).json({
        message: "Insufficient balance"
      });
    }

    // Get college account ID (default: 999 or first account with status 'college')
    const collegeRes = await bankDB.query(
      `SELECT account_id FROM Accounts WHERE account_id = 999 LIMIT 1`
    );

    const to_account = collegeRes.rows.length > 0 ? collegeRes.rows[0].account_id : 999;

    // Perform transfer
    const result = await bankDB.query(
      `SELECT transfer_amount($1, $2, $3) AS message`,
      [from_account_id, to_account, amount]
    );

    if (result.rows[0].message !== 'Transfer successful') {
      return res.status(400).json({
        message: result.rows[0].message
      });
    }


    // Notify EIMS of successful payment
    try {
      console.log("Notifying EIMS about payment success...");
      const notifyRes = await axios.post(`${eimsBackendUrl}/student/payment-success`, {
        student_id,
        semester,
        amount
      });
      console.log("EIMS notification response:", notifyRes.data);
    } catch (emsErr) {
      console.error('ERROR: Failed to notify EIMS -', emsErr.message);
      if (emsErr.response?.data) {
        console.error('Error details:', emsErr.response.data);
      }
    }

    res.json({
      message: "Payment successful ✅",
      amount: amount,
      student_id: student_id
    });

  } catch (err) {
    console.error('Transfer error:', err);
    res.status(500).json({
      message: "Payment failed",
      error: err.message
    });
  }
});


app.get('/account/:id/balance', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await bankDB.query(
      `SELECT balance FROM Accounts WHERE account_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Account not found"
      });
    }

    res.json({
      balance: result.rows[0].balance
    });

  } catch (err) {
    res.status(500).send("Error fetching balance");
  }
});


// Get customer balance by email or name
app.get('/customer/:identifier/balance', async (req, res) => {
  try {
    const result = await bankDB.query(
      `SELECT a.account_id, a.balance, a.account_type, c.email, c.name
       FROM Accounts a
       JOIN Customers c ON a.customer_id = c.customer_id
       WHERE c.email = $1 OR c.name = $1
       LIMIT 1`,
      [req.params.identifier]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Account not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching balance' });
  }
});


app.post('/account/deposit', async (req, res) => {
  const { account_id, amount } = req.body;

  try {
    const result = await bankDB.query(
      `SELECT deposit_amount($1, $2) AS message`,
      [account_id, amount]
    );

    res.json({ message: result.rows[0].message });

  } catch (err) {
    res.status(500).send("Deposit error");
  }
});


app.post('/account/withdraw', async (req, res) => {
  const { account_id, amount } = req.body;

  try {
    const result = await bankDB.query(
      `SELECT withdraw_amount($1, $2) AS message`,
      [account_id, amount]
    );

    res.json({ message: result.rows[0].message });

  } catch (err) {
    res.status(500).send("Withdraw error");
  }
});


app.get('/account/:id/history', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await bankDB.query(`
      SELECT 
        transaction_id AS id,
        transaction_type AS type,
        amount,
        created_at,
        status
      FROM Transactions
      WHERE account_id = $1 AND transaction_type IN ('credit', 'debit')

      UNION ALL

      SELECT
        transfer_id AS id,
        CASE
          WHEN from_account = $1 THEN 'transfer_sent'
          ELSE 'transfer_received'
        END AS type,
        amount,
        created_at,
        status
      FROM Transfers
      WHERE from_account = $1 OR to_account = $1

      ORDER BY created_at DESC
    `, [id]);

    res.json(result.rows);

  } catch (err) {
    res.status(500).send("History error");
  }
});

// Create new bank account
app.post('/create-account', async (req, res) => {
  const { full_name, account_type, email, phone, pin, initial_balance } = req.body;

  try {
    if (!full_name || !email || !phone || !pin) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    if (pin.length < 4) {
      return res.status(400).json({
        message: "PIN must be at least 4 characters"
      });
    }

    if (initial_balance < 0) {
      return res.status(400).json({
        message: "Initial balance must be positive"
      });
    }

    // Hash PIN
    const hashedPin = await bcrypt.hash(pin, 10);

    // First, check if customer with this email already exists
    const existingCustomer = await bankDB.query(
      `SELECT customer_id FROM Customers WHERE email = $1`,
      [email]
    );

    let customerId;

    if (existingCustomer.rows.length > 0) {
      customerId = existingCustomer.rows[0].customer_id;

      // Check if customer already has an account
      const existingAccount = await bankDB.query(
        `SELECT account_id FROM Accounts WHERE customer_id = $1`,
        [customerId]
      );
      if (existingAccount.rows.length > 0) {
        return res.status(400).json({
          message: "An account already exists for this email"
        });
      }
    } else {
      // Create new customer
      const customerResult = await bankDB.query(
        `INSERT INTO Customers (name, email, phone, password, created_at)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING customer_id`,
        [full_name, email, phone, hashedPin]
      );
      customerId = customerResult.rows[0].customer_id;
    }

    // Create account for this customer
    const accountResult = await bankDB.query(
      `INSERT INTO Accounts (customer_id, account_type, balance, status, created_at)
       VALUES ($1, $2, $3, 'active', NOW())
       RETURNING account_id`,
      [customerId, account_type, initial_balance]
    );

    const accountId = accountResult.rows[0].account_id;

    if (initial_balance > 0) {
      // Record initial deposit
      await bankDB.query(
        `INSERT INTO Transactions (account_id, transaction_type, amount, status, created_at)
         VALUES ($1, 'credit', $2, 'success', NOW())`,
        [accountId, initial_balance]
      );
    }

    res.status(201).json({
      message: "Account created successfully",
      account_id: accountId,
      account_holder_name: full_name,
      balance: initial_balance
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to create account",
      error: err.message
    });
  }
});

app.listen(bankBackendPort, () => {
  console.log(`Bank server running on port ${bankBackendPort} 🚀`);
});