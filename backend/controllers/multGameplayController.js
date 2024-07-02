const db = require('../config/db');

const setSecretNumber = async (req, res) => {
    const userId = req.user.userId;
    const gameId = req.params.id;
    const { secretNumber } = req.body;

    try {
        const result = await db.query(
            `UPDATE MultiPlayerGames
            SET player1_secret = CASE WHEN player1_id = $1 THEN $2 ELSE player1_secret END,
                player2_secret = CASE WHEN player2_id = $1 THEN $2 ELSE player2_secret END
            WHERE game_id = $3 AND (player1_id = $1 OR player2_id = $1)
            RETURNING *`,
            [userId, secretNumber, gameId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Game not found or you\'re not a player in this game' });
        }

        console.log('testing:', result.rows[0].player1_id, gameId);

        // Check if both players have set their secret numbers
        if (result.rows[0].player1_secret && result.rows[0].player2_secret) {
            await db.query(
                `UPDATE Games SET status = 'active' WHERE game_id = $1`,
                [gameId]
            );
            await db.query(
                `UPDATE MultiPlayerGames SET current_turn = $1 WHERE game_id = $2`,
                [result.rows[0].player1_id, gameId]
            );
            // // Notify all players in the game that it's starting
            // req.app.get('io').to(gameId).emit('gameStarted', { gameId });
        }

        res.json({ message: 'Secret number set successfully' });
    } catch (error) {
        console.error('Error setting secret number:', error);
        res.status(500).json({ error: 'Failed to set secret number' });
    }
};

const getGameDetails = async (req, res) => {
    const userId = req.user.userId;
    const gameId = req.params.id;

    try {
        const result = await db.query(
            `SELECT g.*, m.player1_id, m.player2_id, m.current_turn, 
            m.player1_secret IS NOT NULL as player1_secret_set, 
            m.player2_secret IS NOT NULL as player2_secret_set,
            u1.username as player1_name, u2.username as player2_name
            FROM Games g
            JOIN MultiPlayerGames m ON g.game_id = m.game_id
            JOIN Users u1 ON m.player1_id = u1.user_id
            LEFT JOIN Users u2 ON m.player2_id = u2.user_id
            WHERE g.game_id = $1 AND (m.player1_id = $2 OR m.player2_id = $2)`,
            [gameId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Game not found' });
        }

        const gameDetails = result.rows[0];
        
        const response = {
            gameId: gameDetails.game_id,
            status: gameDetails.status,
            currentTurn: gameDetails.current_turn,
            player1: {
                id: gameDetails.player1_id,
                name: gameDetails.player1_name,
                secretSet: gameDetails.player1_secret_set
            },
            player2: {
                id: gameDetails.player2_id,
                name: gameDetails.player2_name,
                secretSet: gameDetails.player2_secret_set
            },
            currentUser: userId === gameDetails.player1_id ? 'player1' : 'player2'
        };

        res.json(response);
    } catch (error) {
        console.error('Error fetching game details:', error);
        res.status(500).json({ error: 'Failed to fetch game details' });
    }
};

module.exports = {
    getGameDetails,
    setSecretNumber
};