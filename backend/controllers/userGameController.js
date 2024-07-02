const db = require('../config/db');

const generateSecretNumber = () => {
    const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    let secret = '';
    
    // Ensure the first digit is not '0'
    const firstDigitIndex = Math.floor(Math.random() * (digits.length - 1)) + 1;
    secret += digits[firstDigitIndex];
    digits.splice(firstDigitIndex, 1);
    
    // Generate the rest of the digits
    for (let i = 0; i < 3; i++) {
      const index = Math.floor(Math.random() * digits.length);
      secret += digits[index];
      digits.splice(index, 1);
    }
    return secret;
};
  
  const evaluateGuess = (secret, guess) => {
    let bulls = 0;
    let cows = 0;
    for (let i = 0; i < 4; i++) {
      if (secret[i] === guess[i]) {
        bulls++;
      } else if (secret.includes(guess[i])) {
        cows++;
      }
    }
    return { bulls, cows };
};


const getActiveGame = async (req, res) => {
    const userId = req.user.userId;
    try {
        const result = await db.query(
            'SELECT g.game_id, spg.secret_number FROM Games g JOIN SinglePlayerGames spg ON g.game_id = spg.game_id WHERE spg.user_id = $1 AND g.status = $2 LIMIT 1',
            [userId, 'active']
        );
        // console.log(result);
        res.json(result.rows[0] || null);
    } catch (error) {
        console.error('Error fetching active game:', error);
        res.status(500).json({ error: 'Failed to fetch active game' });
    }
};

const startNewGame = async (req, res) => {
    const userId = req.user.userId;
    const secretNumber = generateSecretNumber();
    console.log('secretNumber:', secretNumber);
    console.log('userId:', userId);
    try {
        await db.query('BEGIN');

        // Set any existing active game to abandoned
        await db.query(
            'UPDATE Games SET status = $1 WHERE game_id IN (SELECT game_id FROM SinglePlayerGames WHERE user_id = $2 AND status = $3)',
            ['abandoned', userId, 'active']
        );

        // Create new game
        const gameResult = await db.query(
            'INSERT INTO Games (game_type, status, created_at) VALUES ($1, $2, $3) RETURNING game_id',
            ['single', 'active', new Date()]
        );
        const gameId = gameResult.rows[0].game_id;

        await db.query(
            'INSERT INTO SinglePlayerGames (game_id, user_id, secret_number) VALUES ($1, $2, $3)',
            [gameId, userId, secretNumber]
        );

        await db.query('COMMIT');

        res.json({ gameId, secretNumber });
    } catch (error) {
        await db.query('ROLLBACK');
        console.error('Error starting new game:', error);
        res.status(500).json({ error: 'Failed to start a new game' });
    }
};

const makeGuess = async (req, res) => {
    const { gameId, guess } = req.body;
    const userId = req.user.userId;
    const MAX_GUESSES = 10;

    try {
        // Start a transaction
        await db.query('BEGIN');

        // Fetch game details
        const gameResult = await db.query(
            'SELECT g.status, spg.secret_number FROM Games g JOIN SinglePlayerGames spg ON g.game_id = spg.game_id WHERE g.game_id = $1 AND spg.user_id = $2',
            [gameId, userId]
        );

        if (gameResult.rows.length === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({ error: 'Game not found' });
        }

        const { status, secret_number } = gameResult.rows[0];

        if (status !== 'active') {
            await db.query('ROLLBACK');
            return res.status(400).json({ error: 'Game is not active' });
        }

        const result = evaluateGuess(secret_number, guess);

        // Get the current move number
        const moveNumberResult = await db.query(
            'SELECT COALESCE(MAX(move_number), 0) + 1 as next_move_number FROM Moves WHERE game_id = $1',
            [gameId]
        );
        const moveNumber = moveNumberResult.rows[0].next_move_number;

        // Insert the move with the correct move number
        await db.query(
            'INSERT INTO Moves (game_id, user_id, move_number, guess, cows, bulls) VALUES ($1, $2, $3, $4, $5, $6)',
            [gameId, userId, moveNumber, guess, result.cows, result.bulls]
        );

        // Get the total number of moves for this game
        const movesCountResult = await db.query(
            'SELECT COUNT(*) FROM Moves WHERE game_id = $1',
            [gameId]
        );
        const moveCount = parseInt(movesCountResult.rows[0].count);

        let gameStatus = 'active';
        let winner_id = null;

        if (result.bulls === 4) {
            // Win condition
            gameStatus = 'completed';
            winner_id = userId;
        } else if (moveCount >= MAX_GUESSES) {
            // Loss condition
            gameStatus = 'completed';
        }

        if (gameStatus === 'completed') {
            await db.query(
                'UPDATE Games SET status = $1, completed_at = $2, winner_id = $3 WHERE game_id = $4',
                [gameStatus, new Date(), winner_id, gameId]
            );
        }

        // Commit the transaction
        await db.query('COMMIT');

        res.json({ 
            ...result, 
            gameId, 
            guess, 
            moveNumber,
            isGameOver: gameStatus === 'completed',
            isWin: winner_id !== null
        });
    } catch (error) {
        await db.query('ROLLBACK');
        console.error('Error making guess:', error);
        res.status(500).json({ error: 'Failed to process guess' });
    }
};

const getGameState = async (req, res) => {
    const gameId = req.params.id;
    const userId = req.user.userId;

    try {
        const gameResult = await db.query(
            'SELECT g.*, spg.secret_number FROM Games g JOIN SinglePlayerGames spg ON g.game_id = spg.game_id WHERE g.game_id = $1 AND spg.user_id = $2',
            [gameId, userId]
        );

        if (gameResult.rows.length === 0) {
            return res.status(404).json({ error: 'Game not found' });
        }

        const movesResult = await db.query(
            'SELECT move_number, guess, cows, bulls FROM Moves WHERE game_id = $1 ORDER BY move_number ASC',
            [gameId]
        );

        res.json({
            ...gameResult.rows[0],
            moves: movesResult.rows
        });
    } catch (error) {
        console.error('Error getting game state:', error);
        res.status(500).json({ error: 'Failed to retrieve game state' });
    }
};

const getUserStats = async (req, res) => {
    const userId = req.user.userId;

    try {
        const result = await db.query(`
            WITH user_games AS (
                SELECT 
                    g.game_id,
                    g.status,
                    g.winner_id,
                    COALESCE(m.move_count, 0) as move_count
                FROM 
                    Games g
                JOIN 
                    SinglePlayerGames spg ON g.game_id = spg.game_id
                LEFT JOIN (
                    SELECT game_id, COUNT(*) as move_count
                    FROM Moves
                    GROUP BY game_id
                ) m ON g.game_id = m.game_id
                WHERE 
                    spg.user_id = $1 AND g.status = 'completed'
            )
            SELECT 
                COUNT(*) as total_games,
                SUM(CASE WHEN winner_id IS NOT NULL THEN 1 ELSE 0 END) as games_won,
                SUM(CASE WHEN winner_id IS NULL THEN 1 ELSE 0 END) as games_lost,
                ROUND(AVG(move_count), 2) as avg_moves,
                MIN(CASE WHEN winner_id IS NOT NULL THEN move_count ELSE NULL END) as best_game,
                ROUND(SUM(CASE WHEN winner_id IS NOT NULL THEN 1 ELSE 0 END)::numeric / COUNT(*)::numeric * 100, 2) as win_percentage
            FROM 
                user_games
        `, [userId]);

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ error: 'Failed to fetch user stats' });
    }
};

module.exports = { startNewGame, makeGuess, getGameState, getActiveGame, getUserStats };