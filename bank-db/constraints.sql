-- Accounts → Customers
ALTER TABLE Accounts
ADD CONSTRAINT fk_accounts_customer
FOREIGN KEY (customer_id)
REFERENCES Customers(customer_id)
ON DELETE CASCADE;

-- Transactions → Accounts
ALTER TABLE Transactions
ADD CONSTRAINT fk_transactions_account
FOREIGN KEY (account_id)
REFERENCES Accounts(account_id)
ON DELETE CASCADE;

-- Transfers → Accounts (from_account)
ALTER TABLE Transfers
ADD CONSTRAINT fk_transfers_from
FOREIGN KEY (from_account)
REFERENCES Accounts(account_id)
ON DELETE CASCADE;

-- Transfers → Accounts (to_account)
ALTER TABLE Transfers
ADD CONSTRAINT fk_transfers_to
FOREIGN KEY (to_account)
REFERENCES Accounts(account_id)
ON DELETE CASCADE;

-- Accounts checks
ALTER TABLE Accounts
ADD CONSTRAINT chk_balance_non_negative
CHECK (balance >= 0);

ALTER TABLE Accounts
ADD CONSTRAINT chk_account_type
CHECK (account_type IN ('savings', 'current'));

ALTER TABLE Accounts
ADD CONSTRAINT chk_account_status
CHECK (status IN ('active', 'inactive', 'closed'));


-- Transactions checks
ALTER TABLE Transactions
ADD CONSTRAINT chk_transaction_type
CHECK (transaction_type IN ('credit', 'debit'));

ALTER TABLE Transactions
ADD CONSTRAINT chk_transaction_amount
CHECK (amount > 0);


-- Transfers checks
ALTER TABLE Transfers
ADD CONSTRAINT chk_transfer_amount
CHECK (amount > 0);

ALTER TABLE Transfers
ADD CONSTRAINT chk_transfer_accounts_different
CHECK (from_account <> to_account);

ALTER TABLE Transfers
ADD CONSTRAINT chk_transfer_status
CHECK (status IN ('pending', 'completed', 'failed'));