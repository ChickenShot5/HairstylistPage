const express = require("express");
const router = express.Router();
const db = require("../db/database");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

router.get("/", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing token" });
  }

  const token = auth.split(" ")[1];
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }

  const userId = decoded.userId;
  const isAdmin = decoded.role === "admin";

  // 🧹 Auto-delete notifications older than 7 days
  db.prepare(
    `
    DELETE FROM notifications 
    WHERE created_at < datetime('now', '-7 days')
  `
  ).run();

  // Fetch remaining notifications
  const notifications = isAdmin
    ? db.prepare("SELECT * FROM notifications ORDER BY created_at DESC").all()
    : db
        .prepare(
          "SELECT * FROM notifications WHERE user_id = ? OR user_id IS NULL ORDER BY created_at DESC"
        )
        .all(userId);

  res.json(notifications);
});

router.post("/", (req, res) => {
  const { user_id, message } = req.body;
  db.prepare("INSERT INTO notifications (user_id, message) VALUES (?, ?)").run(
    user_id || null,
    message
  );

  res.status(201).json({ message: "Notification created" });
});

router.patch("/:id/read", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing token" });
  }

  const token = auth.split(" ")[1];
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }

  const userId = decoded.userId;
  const isAdmin = decoded.role === "admin";
  const id = req.params.id;

  const notification = db
    .prepare("SELECT * FROM notifications WHERE id = ?")
    .get(id);

  if (!notification) {
    return res.status(404).json({ message: "Notification not found" });
  }

  if (
    !isAdmin &&
    notification.user_id !== userId &&
    notification.user_id !== null
  ) {
    return res
      .status(403)
      .json({ message: "Not authorized to read this notification" });
  }

  db.prepare("UPDATE notifications SET is_read = 1 WHERE id = ?").run(id);
  res.json({ message: "Notification marked as read" });
});

router.delete("/:id", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing token" });
  }

  const token = auth.split(" ")[1];
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }

  const userId = decoded.userId;
  const isAdmin = decoded.role === "admin";
  const id = req.params.id;

  const notification = db
    .prepare("SELECT * FROM notifications WHERE id = ?")
    .get(id);

  if (!notification) {
    return res.status(404).json({ message: "Notification not found" });
  }

  if (
    !isAdmin &&
    notification.user_id !== userId &&
    notification.user_id !== null
  ) {
    return res
      .status(403)
      .json({ message: "Not authorized to delete this notification" });
  }

  db.prepare("DELETE FROM notifications WHERE id = ?").run(id);
  res.json({ message: "Notification deleted" });
});

module.exports = router;
