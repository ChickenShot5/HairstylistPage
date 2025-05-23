const express = require("express");
const router = express.Router();
const db = require("../db/database");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

// Get all appointments
router.get("/", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing token" });
  }

  const token = auth.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const appointments = db
      .prepare("SELECT * FROM appointments ORDER BY date, time")
      .all();
    res.json(appointments);
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
});

// Book a new appointment
router.post("/", (req, res) => {
  const io = req.app.get("socketio");
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
  const { name, email, date, time } = req.body;

  const existing = db
    .prepare("SELECT * FROM appointments WHERE date = ? AND time = ?")
    .get(date, time);
  if (existing) {
    return res.status(409).json({ message: "Time slot already booked" });
  }

  db.prepare(
    "INSERT INTO appointments (user_id, name, email, date, time) VALUES (?, ?, ?, ?, ?)"
  ).run(userId, name, email, date, time);

  res.status(201).json({ message: "Appointment booked!" });
});

// Get my appointments
router.get("/my-appointments", (req, res) => {
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
  const appointments = db
    .prepare("SELECT * FROM appointments WHERE user_id = ? ORDER BY date, time")
    .all(userId);

  res.json(appointments);
});

// Delete appointment (admin only, or user if authorized)
router.delete("/:id", (req, res) => {
  const io = req.app.get("socketio");
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
  const appointmentId = req.params.id;

  const appointment = db
    .prepare("SELECT * FROM appointments WHERE id = ?")
    .get(appointmentId);

  if (!appointment) {
    return res.status(404).json({ message: "Appointment not found" });
  }

  if (!isAdmin && appointment.user_id !== userId) {
    return res
      .status(403)
      .json({ message: "Unauthorized to delete this appointment" });
  }

  db.prepare("DELETE FROM appointments WHERE id = ?").run(appointmentId);

  // 🔔 Real-time alert to user if admin canceled it
  if (isAdmin) {
    io.emit("cancel_approved", { appointmentId });
  }

  res.json({ message: "Appointment cancelled" });
});

// Request cancellation (user only)
router.post("/:id/request-cancel", (req, res) => {
  const io = req.app.get("socketio");
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing token" });
  }

  const token = auth.split(" ")[1];
  const decoded = jwt.verify(token, JWT_SECRET);

  const appointmentId = req.params.id;

  const appointment = db
    .prepare("SELECT * FROM appointments WHERE id = ?")
    .get(appointmentId);
  if (!appointment || appointment.user_id !== decoded.userId) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  db.prepare("UPDATE appointments SET cancel_requested = 1 WHERE id = ?").run(
    appointmentId
  );

  db.prepare("INSERT INTO notifications (user_id, message) VALUES (?, ?)").run(
    null,
    `User ${appointment.name} requested to cancel appointment on ${appointment.date} at ${appointment.time}`
  );

  io.emit("cancel_request", {
    appointmentId,
    userName: appointment.name,
    date: appointment.date,
    time: appointment.time,
  });

  res.json({ message: "Cancellation request sent to admin" });
});

// Deny cancellation
router.post("/:id/deny-cancel", (req, res) => {
  const io = req.app.get("socketio");
  const id = req.params.id;
  db.prepare("UPDATE appointments SET cancel_requested = 0 WHERE id = ?").run(
    id
  );

  io.emit("cancel_refused", { appointmentId: id });

  res.json({ message: "Request denied" });
});

module.exports = router;
