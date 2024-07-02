-- globalStats-schema.sql

-- Drop existing tables if they exist
DROP TABLE IF EXISTS GlobalStats;

-- Create GlobalStats table
CREATE TABLE GlobalStats (
    id SERIAL PRIMARY KEY,
    totalGamesPlayed INTEGER DEFAULT 0,
    totalGamesWon INTEGER DEFAULT 0,
    totalMoves INTEGER DEFAULT 0
);

-- Initialize GlobalStats with a single row
INSERT INTO GlobalStats (totalGamesPlayed, totalGamesWon, totalMoves) VALUES (0, 0, 0);

-- psql -U postgres -d cowsandbulls -f db/globalStats-schema.sql