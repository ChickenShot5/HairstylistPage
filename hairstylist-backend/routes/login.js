const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
const JWT_SECRET = process.env.JWT_SECRET;

router.post("/", async (req, res) => {
  const { password } = req.body;

  if (!password) return res.status(400).json({ message: "Password required" });

  const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  if (!isValid) return res.status(401).json({ message: "Invalid password" });

  const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "1h" });

  res.json({ token });
});

module.exports = router;
