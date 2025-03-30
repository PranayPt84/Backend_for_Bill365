const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const SECRET_KEY = process.env.SECRET_KEY || "your_secret_key";

exports.signup = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING userid, name, email",
      [username, email, hashedPassword]
    );

    res.status(201).json({ success: true, message: "User registered successfully", user: result.rows[0] });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ success: false, message: "Error registering user", error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user.rows[0].userid }, SECRET_KEY, { expiresIn: "1h" });

    // Store userId in session
    req.session.userId = user.rows[0].userid;

    res.json({ success: true, message: "Login successful", token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Error logging in" });
  }
};
