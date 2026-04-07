-- When a customer is added, automatically create a default savings account for them

CREATE OR REPLACE FUNCTION create_account_after_customer()
RETURNS TRIGGER AS
$$
BEGIN

    INSERT INTO Accounts (
        customer_id,
        balance,
        account_type,
        status
    )
    VALUES (
        NEW.customer_id,
        0,
        'savings',
        'active'
    );

    RETURN NEW;

END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER trg_create_account
AFTER INSERT ON Customers
FOR EACH ROW
EXECUTE FUNCTION create_account_after_customer();