CREATE TABLE Transactions (
    transaction_id SERIAL PRIMARY KEY,
    account_id INT,
    transaction_type VARCHAR(20),
    amount NUMERIC(12,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT
);