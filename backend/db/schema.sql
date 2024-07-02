-- Users Table
CREATE TABLE IF NOT EXISTS Users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Games Table
CREATE TABLE IF NOT EXISTS Games (
    game_id SERIAL PRIMARY KEY,
    game_type VARCHAR(10) CHECK (game_type IN ('single', 'multi')) NOT NULL,
    status VARCHAR(10) CHECK (status IN ('active', 'completed', 'abandoned','waiting')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    winner_id INTEGER REFERENCES Users(user_id)
);

-- SinglePlayerGames Table
CREATE TABLE IF NOT EXISTS SinglePlayerGames (
    single_game_id SERIAL PRIMARY KEY,
    game_id INTEGER REFERENCES Games(game_id),
    user_id INTEGER REFERENCES Users(user_id),
    secret_number VARCHAR(4) NOT NULL,
    attempts INTEGER DEFAULT 0,
    time_taken INTEGER -- in seconds
);

-- MultiPlayerGames Table
CREATE TABLE IF NOT EXISTS MultiPlayerGames (
    multi_game_id SERIAL PRIMARY KEY,
    game_id INTEGER REFERENCES Games(game_id),
    player1_id INTEGER REFERENCES Users(user_id),
    player2_id INTEGER REFERENCES Users(user_id),
    player1_secret VARCHAR(4),
    player2_secret VARCHAR(4),
    current_turn INTEGER REFERENCES Users(user_id),
    invite_code VARCHAR(10) UNIQUE,
    game_outcome VARCHAR(20) CHECK (game_outcome IN ('player1_win', 'player2_win', 'tie', 'abandoned'))
);

-- Moves Table
CREATE TABLE IF NOT EXISTS Moves (
    move_id SERIAL PRIMARY KEY,
    game_id INTEGER REFERENCES Games(game_id),
    user_id INTEGER REFERENCES Users(user_id),
    move_number INTEGER NOT NULL,
    guess VARCHAR(4) NOT NULL,
    cows INTEGER,
    bulls INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- GameInvites Table
CREATE TABLE IF NOT EXISTS GameInvites (
    invite_id SERIAL PRIMARY KEY,
    multi_game_id INTEGER REFERENCES MultiPlayerGames(multi_game_id),
    inviter_id INTEGER REFERENCES Users(user_id),
    invitee_id INTEGER REFERENCES Users(user_id),
    invite_code VARCHAR(10) UNIQUE,
    status VARCHAR(10) CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for frequently accessed columns
CREATE INDEX IF NOT EXISTS idx_games_status ON Games(status);
CREATE INDEX IF NOT EXISTS idx_moves_game_id ON Moves(game_id);
CREATE INDEX IF NOT EXISTS idx_game_invites_invite_code ON GameInvites(invite_code);

-- additional code to change or edit schema after these commands don't forget to edit the schema