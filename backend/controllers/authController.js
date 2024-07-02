const pool = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    const hashedPassword = await hashPassword(password);
    const result = await pool.query(
      'INSERT INTO Users (username, password_hash) VALUES ($1, $2) RETURNING user_id, username',
      [username, hashedPassword]
    );
    const user = result.rows[0];
    const token = jwt.sign({ userId: user.user_id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ user: { id: user.user_id, username: user.username }, token });
  } catch (error) {
    if (error.code === '23505') { // unique_violation error code
        return res.status(409).json({ error: 'Username already exists' });
    }
    res.status(500).json({ error: 'Error registering user' });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM Users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = result.rows[0];
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user.user_id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    await pool.query('UPDATE Users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1', [user.user_id]);
    res.json({ user: { id: user.user_id, username: user.username }, token });
  } catch (error) {
    res.status(500).json({ error: 'Error logging in' });
  }
};

module.exports = { register, login };