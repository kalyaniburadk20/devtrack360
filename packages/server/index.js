// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); // Import the pg Pool

// Create a new PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// --- API Routes ---

// Simple root API route
app.get('/api', (req, res) => {
  res.json({ message: "Hello from DevTrack360 Server!" });
});

// Database connection test route
app.get('/api/db-test', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()'); // Simple query to get the current time from DB
    res.json({ message: "Database connection successful!", time: result.rows[0].now });
    client.release(); // Release the client back to the pool
  } catch (err) {
    console.error("Database connection error", err);
    res.status(500).json({ error: "Failed to connect to the database." });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
