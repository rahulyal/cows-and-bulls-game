// controllers/globalStatsController.js

const pool = require('../config/db');

const updateGlobalStats = async (req, res) => {
    const { isWon, moves } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        await client.query(`
            UPDATE GlobalStats 
            SET totalGamesPlayed = totalGamesPlayed + 1,
                totalGamesWon = totalGamesWon + $1,
                totalMoves = totalMoves + $2
            WHERE id = 1
        `, [isWon ? 1 : 0, moves]);

        await client.query('COMMIT');
        res.json({ message: 'Global stats updated successfully' });
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Error updating global stats:', e);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        client.release();
    }
};

const getGlobalStats = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM GlobalStats WHERE id = 1');
        const stats = result.rows[0];
        stats.averagemovestowin = stats.totalgameswon > 0 
            ? (stats.totalmoves / stats.totalgameswon).toFixed(2) 
            : null;
        res.json(stats);
    } catch (error) {
        console.error('Error fetching global stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { updateGlobalStats , getGlobalStats };