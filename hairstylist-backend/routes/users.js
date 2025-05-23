const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db/database");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Signup route
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  // Check if email is already registered
  const existing = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (existing)
    return res.status(409).json({ message: "Email already registered" });

  const hash = await bcrypt.hash(password, 10);
  db.prepare(
    "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)"
  ).run(name, email, hash);

  res.status(201).json({ message: "User registered" });
});

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ userId: user.id, role: "user" }, JWT_SECRET, {
    expiresIn: "2h",
  });
  res.json({
    token,
    id: user.id,
    name: user.name,
  });
});

module.exports = router;
