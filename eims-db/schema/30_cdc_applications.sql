-- CDC Applications by Students

CREATE TABLE CDC_Applications (
    student_id TEXT,
    cdc_id INT,

    resume_link TEXT,

    ot_status VARCHAR(15) CHECK (
        ot_status IN ('Pending','Qualified','Rejected')
    ),

    interview_status VARCHAR(15) CHECK (
        interview_status IN ('Pending','Qualified','Rejected')
    ),

    final_status VARCHAR(15) CHECK (
        final_status IN ('Selected','Rejected','Pending')
    ),

    offer_details TEXT,

    PRIMARY KEY (student_id, cdc_id)

);