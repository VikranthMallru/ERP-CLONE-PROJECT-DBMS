--For dates which are to be set by admin

CREATE TABLE System_Config (
    config_id INT PRIMARY KEY CHECK (config_id = 1),
    registration_open_date DATE,
    registration_close_date DATE,
    results_declaration_date DATE,
    is_fees_open BOOLEAN
);