-- Users table
-- Stores login credentials and roles

CREATE TABLE Users (
    user_id TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    role VARCHAR(10) CHECK (role IN ('Admin','Faculty','Student'))
);