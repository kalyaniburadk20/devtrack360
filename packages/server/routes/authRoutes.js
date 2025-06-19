const express = require('express');
const { Pool } = require('pg');
const { hashPassword, comparePassword, generateToken } = require('../utils/authUtils');

const router = express.Router();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Register a new user
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const hashedPassword = await hashPassword(password);
    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
      [username, hashedPassword]
    );
    const user = result.rows[0];
    const token = generateToken(user);
    res.status(201).json({ message: 'User registered successfully.', user: { id: user.id, username: user.username }, token });
    client.release();
  } catch (err) {
    if (err.code === '23505') { // Unique violation error code for duplicate username
      return res.status(409).json({ message: 'Username already exists.' });
    }
    console.error('Error during user registration:', err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await comparePassword(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = generateToken(user);
    res.status(200).json({ message: 'Logged in successfully.', user: { id: user.id, username: user.username }, token });
    client.release();
  } catch (err) {
    console.error('Error during user login:', err);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

module.exports = router;
