// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { getSimpleCompletion } = require('./llmService');
const authRoutes = require('./routes/authRoutes'); // Import auth routes
const projectRoutes = require('./routes/projectRoutes'); // Import project routes

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

// Optional: Root route for a welcome message
app.get('/', (req, res) => {
  res.status(200).json({
    message: "Welcome to the DevTrack360 API!",
    api_status: "Running",
    documentation: "Access API endpoints via /api path."
  });
});

// Simple root API route
app.get('/api', (req, res) => {
  res.json({ message: "Hello from DevTrack360 Server!" });
});

// Database connection test route
app.get('/api/db-test', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    res.json({ message: "Database connection successful!", time: result.rows[0].now });
    client.release();
  } catch (err) {
    console.error("Database connection error", err);
    res.status(500).json({ error: "Failed to connect to the database." });
  }
});

// LLM test endpoint
app.post('/api/ai/test', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required in the request body.' });
  }

  console.log(`Received AI prompt: "${prompt}"`);
  const aiResponse = await getSimpleCompletion(prompt);

  if (aiResponse) {
    res.json({ prompt: prompt, response: aiResponse });
  } else {
    res.status(500).json({ error: 'Failed to get a response from the AI. Check server logs for details.' });
  }
});

// Use new authentication and project routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
