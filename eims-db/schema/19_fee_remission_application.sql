-- Fee Remission Application table
-- Stores applications for fee remission

CREATE TABLE Fee_Remission_Application (
    application_id INT PRIMARY KEY,
    student_id TEXT,
    status VARCHAR(20) CHECK (status IN ('Pending', 'Approved', 'Rejected'))
);