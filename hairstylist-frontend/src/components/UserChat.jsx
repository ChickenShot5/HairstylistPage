import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket";
import Navbar from "../components/Navbar";

export default function UserChat() {
  const userIdRaw = localStorage.getItem("userId");
  const userId = userIdRaw ? parseInt(userIdRaw, 10) : null;
  const token = localStorage.getItem("userToken");
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef(null);

  const ADMIN_ID = 1;

  useEffect(() => {
    if (!userId || !token) {
      navigate("/login-user");
      return;
    }

    fetch("http://localhost:4000/messages", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setMessages)
      .catch(console.error);
  }, [userId, token, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleIncoming = (msg) => {
      if (msg.sender_id === userId || msg.recipient_id === userId) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("chat message", handleIncoming);
    return () => socket.off("chat message", handleIncoming);
  }, [userId]);

  const sendMessage = () => {
    const trimmed = chatInput.trim();
    if (!trimmed || !userId) return;

    const messageData = {
      sender_id: userId,
      recipient_id: ADMIN_ID,
      message: trimmed,
    };

    socket.emit("chat message", messageData);

    fetch("http://localhost:4000/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(messageData),
    }).catch(console.error);

    setChatInput("");
  };

  return (
    <>
      <Navbar isAdmin={false} />
      <section>
        <h2>Chat with Admin</h2>
        <div
          style={{
            border: "1px solid #ccc",
            padding: "1rem",
            height: "300px",
            overflowY: "auto",
            marginBottom: "1rem",
            background: "#f9f9f9",
          }}
        >
          {messages.map((msg, i) => (
            <p
              key={`${msg.timestamp || i}`}
              style={{ color: msg.sender_id === userId ? "black" : "green" }}
            >
              <strong>{msg.sender_id === userId ? "You" : "Admin"}:</strong>{" "}
              {msg.message}
            </p>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Type a message..."
          style={{
            padding: "0.5rem",
            width: "70%",
            marginRight: "0.5rem",
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </section>
    </>
  );
}
