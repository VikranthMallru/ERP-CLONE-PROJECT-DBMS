-- Companies and Opportunities

CREATE TABLE CDC (
    cdc_id SERIAL PRIMARY KEY,
    company_name TEXT,
    apply_link TEXT,
    job_type VARCHAR(10) CHECK (job_type IN ('Intern','Placement')),
    cgpa_cutoff NUMERIC(3,2),
    ot_link TEXT,
    interview_link TEXT
);