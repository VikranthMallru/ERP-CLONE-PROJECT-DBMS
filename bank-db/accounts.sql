CREATE TABLE Accounts (
    account_id SERIAL UNIQUE,
    customer_id INT  PRIMARY KEY,
    balance NUMERIC(12,2) DEFAULT 0,
    account_type VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active',  
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);