-- Prerequisites table
-- Stores prerequisite relationships between courses

CREATE TABLE Prerequisites (
    main_course_id TEXT,
    prereq_course_id TEXT,

    PRIMARY KEY(main_course_id, prereq_course_id)
);