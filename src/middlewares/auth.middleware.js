const jwt = require("jsonwebtoken");
const config = require("../config/env");
const authenticateToken = (req, res, next) => {
 
  const token = req.header("Authorization");


  if (!token) {
    return res.status(401).json({ success: false, message: "Access denied. No token provided." });
  }

   try { 
    const verified = jwt.verify(token.replace("Bearer ", ""), config.SECRET_KEY);
    req.user = verified; 
     const userId = req.session.userId; // Access the user ID from the session
    //  console.log(userId);
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized first login yourself" });
    }
    req.userId = userId;
    next();
  } catch (error) {
    
    res.status(403).json({ success: false, message: "Invalid token." });
  }
};

module.exports = authenticateToken; 



//401 403