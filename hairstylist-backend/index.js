require("dotenv").config();
require("./scheduler");
const express = require("express");
const cors = require("cors");
const db = require("./db/database");

const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // frontend origin
    credentials: true,
  },
});
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json());

app.set("socketio", io);

// Routes
app.use("/appointments", require("./routes/appointments"));
app.use("/contact", require("./routes/contact"));
app.use("/users", require("./routes/users"));
app.use("/notifications", require("./routes/notifications"));
app.use("/messages", require("./routes/messages"));
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

io.on("connection", (socket) => {
  console.log("User connected to Socket.IO");

  socket.on("chat message", (msgData) => {
    console.log("Received socket message from user:", msgData);

    const { sender_id, recipient_id, message } = msgData;
    if (!sender_id || !recipient_id || !message) return;

    // Save to DB
    db.prepare(
      `INSERT INTO chat_messages (sender_id, recipient_id, message) VALUES (?, ?, ?)`
    ).run(sender_id, recipient_id, message);

    // Emit to everyone (can later filter by recipient only)
    io.emit("chat message", {
      sender_id,
      recipient_id,
      message,
      timestamp: new Date().toISOString(),
    });

    console.log("Message broadcast via io.emit()");
  });

  socket.on("disconnect", () => {
    console.log("User disconnected from Socket.IO");
  });
});
