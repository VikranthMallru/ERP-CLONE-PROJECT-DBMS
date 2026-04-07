-- Stores the CGPA for a student until previous semester and total credits completed until previous semester

CREATE TABLE Results (
    student_id TEXT PRIMARY KEY,
    cgpa NUMERIC(3,2) CHECK (cgpa BETWEEN 0 AND 10),
    total_credits INT CHECK (total_credits >= 0)
);