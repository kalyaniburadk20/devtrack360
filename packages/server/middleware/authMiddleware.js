const { verifyToken } = require('../utils/authUtils');

/**
 * Middleware to authenticate requests using JWT.
 * Attaches the decoded user payload to req.user if token is valid.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

  if (token == null) {
    return res.status(401).json({ message: 'Authentication token required.' });
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }

  req.user = decoded; // Attach user information to the request
  next(); // Proceed to the next middleware/route handler
}

module.exports = { authenticateToken };
