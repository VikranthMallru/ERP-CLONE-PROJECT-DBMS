-- Discipline table
-- Stores program types such as B.Tech, M.Tech etc.

CREATE TABLE Discipline (
    discipline_id TEXT PRIMARY KEY,
    max_semester INT,
    fees NUMERIC
);