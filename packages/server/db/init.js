const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // Load .env from parent dir

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function initializeDatabase() {
  console.log('Initializing database...');
  try {
    const client = await pool.connect();
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql')).toString();
    await client.query(schemaSql);
    console.log('Database schema created successfully.');
    client.release();
  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    pool.end(); // Close the pool after initialization
  }
}

initializeDatabase();
