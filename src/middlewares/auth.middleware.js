const jwt = require("jsonwebtoken");
const config = require("../config/env");

const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token || !token.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Access denied. No token provided." });
  }

  try {
    // Remove "Bearer " prefix
    const tokenWithoutBearer = token.replace("Bearer ", "");
    
    // Verify JWT token
    const verified = jwt.verify(tokenWithoutBearer, config.SECRET_KEY);
    req.user = verified;

    // Check session for userId
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No session available" });
    }

    req.userId = userId; // Attach userId from session to the request
    next();
  } catch (error) {
    console.error("JWT verification error:", error);
    res.status(403).json({ success: false, message: "Invalid token." });
  }
};

module.exports = authenticateToken;
