const pool = require('../config/db');

const getUserDetails = async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await pool.query(
      'SELECT user_id, username, created_at, last_login FROM Users WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userDetails = result.rows[0];
    res.json(userDetails);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getTotalUsers = async (req, res) => {
    try {
      const result = await pool.query('SELECT COUNT(*) FROM users');
      const totalUsers = parseInt(result.rows[0].count);
      res.json({ totalUsers });
    } catch (error) {
      console.error('Error fetching total users:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { getUserDetails , getTotalUsers };