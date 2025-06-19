const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key'; // Use a strong secret in .env!

/**
 * Hashes a plain-text password.
 * @param {string} password The password to hash.
 * @returns {Promise<string>} The hashed password.
 */
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compares a plain-text password with a hashed password.
 * @param {string} password The plain-text password.
 * @param {string} hashedPassword The hashed password.
 * @returns {Promise<boolean>} True if passwords match, false otherwise.
 */
async function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generates a JWT token for a user.
 * @param {object} user The user object (e.g., { id: 1, username: 'test' }).
 * @returns {string} The JWT token.
 */
function generateToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
}

/**
 * Verifies a JWT token.
 * @param {string} token The JWT token to verify.
 * @returns {object|null} The decoded token payload if valid, null otherwise.
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
};
