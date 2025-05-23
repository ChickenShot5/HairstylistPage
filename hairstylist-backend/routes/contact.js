const express = require("express");
const router = express.Router();
const db = require("../db/database");

router.post("/", (req, res) => {
  const { name, email, message } = req.body;

  const stmt = db.prepare(
    "INSERT INTO messages (name, email, message) VALUES (?, ?, ?)"
  );
  stmt.run(name, email, message);

  res.status(201).json({ message: "Message received" });
});

module.exports = router;
