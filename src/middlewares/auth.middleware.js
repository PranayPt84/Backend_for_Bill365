const jwt = require("jsonwebtoken");
const config = require("../config/env"); // Import your environment configuration

// Middleware to authenticate the token
const authenticateToken = (req, res, next) => {
  // Get the token from the Authorization header
  const token = req.header("Authorization");

  // If no token is provided, return a 401 Unauthorized response
  if (!token) {
    return res.status(401).json({ success: false, message: "Access denied. No token provided." });
  }

  // Verify the token
  try {
    // Remove "Bearer " from the token string
    const verified = jwt.verify(token.replace("Bearer ", ""), config.SECRET_KEY);
    req.user = verified; // Attach the verified user information to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    // If token verification fails, return a 403 Forbidden response
    res.status(403).json({ success: false, message: "Invalid token." });
  }
};

module.exports = authenticateToken; // Export the middleware