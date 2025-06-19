const express = require('express');
const { Pool } = require('pg');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Create a new project (requires authentication)
router.post('/', authenticateToken, async (req, res) => {
  const { name, description } = req.body;
  const createdBy = req.user.id; // User ID from authenticated token

  if (!name) {
    return res.status(400).json({ message: 'Project name is required.' });
  }

  try {
    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO projects (name, description, created_by) VALUES ($1, $2, $3) RETURNING *',
      [name, description, createdBy]
    );
    res.status(201).json({ message: 'Project created successfully.', project: result.rows[0] });
    client.release();
  } catch (err) {
    if (err.code === '23505') { // Unique violation for project name
      return res.status(409).json({ message: 'Project name already exists.' });
    }
    console.error('Error creating project:', err);
    res.status(500).json({ message: 'Server error creating project.' });
  }
});

// Get all projects for the authenticated user (requires authentication)
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.id; // User ID from authenticated token

  try {
    const client = await pool.connect();
    // SELECT p.*, u.username as created_by_username - if you want to include username
    const result = await client.query('SELECT * FROM projects WHERE created_by = $1 ORDER BY created_at DESC', [userId]);
    res.status(200).json({ projects: result.rows });
    client.release();
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ message: 'Server error fetching projects.' });
  }
});

module.exports = router;
