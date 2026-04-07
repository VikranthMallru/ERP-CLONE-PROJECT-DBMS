-- Rooms table
-- Stores classroom details

CREATE TABLE Rooms (
    building_name TEXT,
    room_number INT,
    capacity INT CHECK (capacity > 0),

    PRIMARY KEY(building_name, room_number)
);