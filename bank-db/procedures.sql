-- Procedure to create a new customer

CREATE OR REPLACE FUNCTION create_customer(
    p_name VARCHAR,
    p_email VARCHAR,
    p_phone VARCHAR,
    p_password VARCHAR
)
RETURNS VOID AS
$$
BEGIN

    INSERT INTO Customers (
        name,
        email,
        phone,
        password
    )
    VALUES (
        p_name,
        p_email,
        p_phone,
        p_password
    );

END;
$$
LANGUAGE plpgsql;

-- Deposit procedure

CREATE OR REPLACE FUNCTION deposit_amount(
    p_account_id INT,
    p_amount NUMERIC
)
RETURNS TEXT AS
$$
BEGIN

    -- check amount
    IF p_amount <= 0 THEN
        RETURN 'Invalid amount';
    END IF;

    -- update balance
    UPDATE Accounts
    SET balance = balance + p_amount
    WHERE account_id = p_account_id;

    -- insert transaction record
    INSERT INTO Transactions (
        account_id,
        transaction_type,
        amount,
        status
    )
    VALUES (
        p_account_id,
        'credit',
        p_amount,
        'success'
    );

    RETURN 'Deposit successful';

EXCEPTION
    WHEN others THEN
        RETURN 'Error: ' || SQLERRM;
END;
$$
LANGUAGE plpgsql;

-- Withdraw procedure

CREATE OR REPLACE FUNCTION withdraw_amount(
    p_account_id INT,
    p_amount NUMERIC
)
RETURNS TEXT AS
$$
DECLARE
    current_balance NUMERIC;
BEGIN

    IF p_amount <= 0 THEN
        RETURN 'Invalid amount';
    END IF;

    SELECT balance INTO current_balance
    FROM Accounts
    WHERE account_id = p_account_id;

    IF current_balance < p_amount THEN
        INSERT INTO Transactions (
            account_id,
            transaction_type,
            amount,
            status
        )
        VALUES (
            p_account_id,
            'debit',
            p_amount,
            'failed - insufficient balance'
        );

        RETURN 'Insufficient balance';
    END IF;

    UPDATE Accounts
    SET balance = balance - p_amount
    WHERE account_id = p_account_id;

    INSERT INTO Transactions (
        account_id,
        transaction_type,
        amount,
        status
    )
    VALUES (
        p_account_id,
        'debit',
        p_amount,
        'success'
    );

    RETURN 'Withdrawal successful';

EXCEPTION
    WHEN others THEN
        RETURN 'Error: ' || SQLERRM;
END;
$$
LANGUAGE plpgsql;

-- Transfer procedure

CREATE OR REPLACE FUNCTION transfer_amount(
    p_from_account INT,
    p_to_account INT,
    p_amount NUMERIC
)
RETURNS TEXT AS
$$
DECLARE
    from_balance NUMERIC;
BEGIN

    IF p_amount <= 0 THEN
        RETURN 'Invalid amount';
    END IF;

    IF p_from_account = p_to_account THEN
        RETURN 'Cannot transfer to same account';
    END IF;

    SELECT balance INTO from_balance
    FROM Accounts
    WHERE account_id = p_from_account
    FOR UPDATE;

    IF from_balance < p_amount THEN
     INSERT INTO Transfers (
            from_account,
            to_account,
            amount,
            status
        )
        VALUES (
            p_from_account,
            p_to_account,
            p_amount,
            'failed'
        );
        RETURN 'Insufficient balance';
    END IF;


    UPDATE Accounts
    SET balance = balance - p_amount
    WHERE account_id = p_from_account;

    
    UPDATE Accounts
    SET balance = balance + p_amount
    WHERE account_id = p_to_account;

    INSERT INTO Transfers (
        from_account,
        to_account,
        amount,
        status
    )
    VALUES (
        p_from_account,
        p_to_account,
        p_amount,
        'completed'
    );


    RETURN 'Transfer successful';

EXCEPTION
    WHEN others THEN
        RETURN 'Error: ' || SQLERRM;
END;
$$
LANGUAGE plpgsql;