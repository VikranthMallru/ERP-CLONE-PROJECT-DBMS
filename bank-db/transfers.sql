CREATE TABLE Transfers (
    transfer_id SERIAL PRIMARY KEY,
    from_account INT,
    to_account INT,
    amount NUMERIC(12,2),
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);