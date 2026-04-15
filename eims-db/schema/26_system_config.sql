--For dates which are to be set by admin

CREATE TABLE System_Config (
    config_id INT PRIMARY KEY CHECK (config_id = 1),
    registration_open_date DATE,
    registration_close_date DATE,
    results_declaration_date DATE,
    is_fees_open BOOLEAN
);

-- Initialize default config
INSERT INTO System_Config (config_id, registration_open_date, registration_close_date, results_declaration_date, is_fees_open)
VALUES (1, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', NULL, TRUE)
ON CONFLICT (config_id) DO NOTHING;