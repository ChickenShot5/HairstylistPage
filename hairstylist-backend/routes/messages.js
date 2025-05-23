const express = require("express");
const router = express.Router();
const db = require("../db/database");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

// Get all chat messages between a user and the admin
router.get("/", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.sendStatus(401);
  const token = auth.split(" ")[1];
  let decoded;

  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch {
    return res.sendStatus(401);
  }

  const userId = decoded.userId;
  const isAdmin = decoded.role === "admin";

  const messages = isAdmin
    ? db.prepare("SELECT * FROM chat_messages ORDER BY timestamp ASC").all()
    : db
        .prepare(
          "SELECT * FROM chat_messages WHERE sender_id = ? OR recipient_id = ? ORDER BY timestamp ASC"
        )
        .all(userId, userId);

  res.json(messages);
});

// Save a new chat message
router.post("/", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.sendStatus(401);
  const token = auth.split(" ")[1];
  let decoded;

  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch {
    return res.sendStatus(401);
  }

  const sender_id = decoded.userId;
  const { recipient_id, message } = req.body;

  if (!recipient_id || !message) {
    return res.status(400).json({ message: "Missing recipient or message" });
  }

  db.prepare(
    "INSERT INTO chat_messages (sender_id, recipient_id, message) VALUES (?, ?, ?)"
  ).run(sender_id, recipient_id, message);

  res.status(201).json({ message: "Message sent" });
});

module.exports = router;