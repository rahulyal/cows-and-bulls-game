const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const getActiveGames = async (req, res) => {
    const userId = req.user.userId;
    try {
        const result = await db.query(
            `SELECT g.game_id, g.status, m.player1_id, m.player2_id, 
            u1.username as player1_name, u2.username as player2_name,
            m.invite_code,
            CASE WHEN m.current_turn = $1 THEN true ELSE false END as is_player_turn
            FROM Games g
            JOIN MultiPlayerGames m ON g.game_id = m.game_id
            JOIN Users u1 ON m.player1_id = u1.user_id
            LEFT JOIN Users u2 ON m.player2_id = u2.user_id
            WHERE (m.player1_id = $1 OR m.player2_id = $1) AND g.status IN ('active', 'waiting')
            ORDER BY g.created_at DESC
            LIMIT 10`,
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching active games:', error);
        res.status(500).json({ error: 'Failed to fetch active games' });
    }
};

const createGame = async (req, res) => {
    const userId = req.user.userId;
    const inviteCode = uuidv4().slice(0, 8);

    try {
        // Check if user has less than 10 active or waiting games
        const activeGamesCount = await db.query(
            `SELECT COUNT(*) FROM Games g
            JOIN MultiPlayerGames m ON g.game_id = m.game_id
            WHERE (m.player1_id = $1 OR m.player2_id = $1) AND g.status IN ('active', 'waiting')`,
            [userId]
        );

        if (activeGamesCount.rows[0].count >= 10) {
            return res.status(400).json({ error: 'You have reached the maximum number of active and waiting games' });
        }

        await db.query('BEGIN');

        const gameResult = await db.query(
            'INSERT INTO Games (game_type, status) VALUES ($1, $2) RETURNING game_id',
            ['multi', 'waiting']
        );
        const gameId = gameResult.rows[0].game_id;

        await db.query(
            'INSERT INTO MultiPlayerGames (game_id, player1_id, invite_code) VALUES ($1, $2, $3)',
            [gameId, userId, inviteCode]
        );

        await db.query('COMMIT');

        res.json({ gameId, inviteCode });
    } catch (error) {
        await db.query('ROLLBACK');
        console.error('Error creating game:', error);
        res.status(500).json({ error: 'Failed to create game' });
    }
};

const joinGame = async (req, res) => {
    const userId = req.user.userId;
    const inviteCode = req.body.inviteCode;

    console.log('User attempting to join game:', userId, 'Invite code:', inviteCode);

    try {
        // Check if user has less than 10 active or waiting games
        const activeGamesCount = await db.query(
            `SELECT COUNT(*) FROM Games g
            JOIN MultiPlayerGames m ON g.game_id = m.game_id
            WHERE (m.player1_id = $1 OR m.player2_id = $1) AND g.status IN ('active', 'waiting')`,
            [userId]
        );

        if (activeGamesCount.rows[0].count >= 10) {
            return res.status(400).json({ error: 'You have reached the maximum number of active and waiting games' });
        }

        const gameResult = await db.query(
            `SELECT m.game_id, m.player1_id, m.player2_id, g.status 
            FROM MultiPlayerGames m
            JOIN Games g ON m.game_id = g.game_id
            WHERE m.invite_code = $1`,
            [inviteCode]
        );

        if (gameResult.rows.length === 0) {
            return res.status(404).json({ error: 'Game not found. Please check your invite code.' });
        }

        const game = gameResult.rows[0];

        if (game.status !== 'waiting') {
            return res.status(400).json({ error: 'This game is no longer accepting players.' });
        }

        if (game.player1_id === userId) {
            return res.status(400).json({ error: 'You cannot join your own game.' });
        }

        if (game.player2_id !== null) {
            return res.status(400).json({ error: 'This game is already full.' });
        }

        await db.query('BEGIN');

        await db.query(
            `UPDATE MultiPlayerGames 
            SET player2_id = $1
            WHERE game_id = $2`,
            [userId, game.game_id]
        );

        await db.query(
            `UPDATE Games
            SET status = 'active'
            WHERE game_id = $1`,
            [game.game_id]
        );

        await db.query('COMMIT');

        console.log('User successfully joined game:', userId, 'Game ID:', game.game_id);
        res.json({ gameId: game.game_id });

    } catch (error) {
        await db.query('ROLLBACK');
        console.error('Error joining game:', error);
        res.status(500).json({ error: 'Failed to join game. Please try again.' });
    }
};

const getStats = async (req, res) => {
    const userId = req.user.userId;

    try {
        const result = await db.query(
            `SELECT 
                COUNT(CASE WHEN g.winner_id = $1 THEN 1 END) as wins,
                COUNT(CASE WHEN g.winner_id IS NOT NULL AND g.winner_id != $1 THEN 1 END) as losses,
                COUNT(CASE WHEN g.status = 'completed' AND g.winner_id IS NULL THEN 1 END) as ties
            FROM Games g
            JOIN MultiPlayerGames m ON g.game_id = m.game_id
            WHERE (m.player1_id = $1 OR m.player2_id = $1) AND g.status = 'completed'`,
            [userId]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};

const abandonGame = async (req, res) => {
    const { gameId } = req.body;
    const userId = req.user.userId;

    try {
        await db.query('BEGIN');

        const gameResult = await db.query(
            `UPDATE Games 
            SET status = 'abandoned' 
            WHERE game_id = $1 
            AND game_id IN (
                SELECT game_id FROM MultiPlayerGames 
                WHERE player1_id = $2 OR player2_id = $2
            )
            RETURNING game_id`,
            [gameId, userId]
        );

        if (gameResult.rows.length === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({ error: 'Game not found or you are not a player in this game' });
        }

        await db.query(
            `UPDATE MultiPlayerGames 
            SET game_outcome = 'abandoned' 
            WHERE game_id = $1`,
            [gameId]
        );

        await db.query('COMMIT');

        res.json({ message: 'Game abandoned successfully' });
    } catch (error) {
        await db.query('ROLLBACK');
        console.error('Error abandoning game:', error);
        res.status(500).json({ error: 'Failed to abandon game' });
    }
};

module.exports = {
    getActiveGames,
    createGame,
    joinGame,
    getStats,
    abandonGame
};