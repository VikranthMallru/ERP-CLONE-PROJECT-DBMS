-- Fee Payment table
-- Stores student fee payment records

CREATE TABLE Fee_Payment (
    payment_id INT PRIMARY KEY,
    student_id TEXT,
    semester INT,
    amount_paid NUMERIC CHECK (amount_paid >= 0),
    payment_date DATE
);