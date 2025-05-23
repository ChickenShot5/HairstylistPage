import { useState, useEffect } from "react";
import socket from "../socket";

export default function AdminChat() {
  const adminToken = localStorage.getItem("token");
  const [allMessages, setAllMessages] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [chatInput, setChatInput] = useState("");

  // Fetch all messages once
  useEffect(() => {
    fetch("http://localhost:4000/messages", {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
      .then((res) => res.json())
      .then(setAllMessages)
      .catch(console.error);
  }, [adminToken]);

  // Handle incoming Socket.IO messages
  useEffect(() => {
    socket.on("chat message", (msg) => {
      setAllMessages((prev) => [...prev, msg]);
    });

    return () => socket.off("chat message");
  }, []);

  // Extract unique user IDs (all non-admin users who messaged)
  const userIds = Array.from(
    new Set(
      allMessages
        .filter((msg) => msg.sender_id !== 1) // assume admin has ID 1
        .map((msg) => (msg.sender_id === 1 ? msg.recipient_id : msg.sender_id))
    )
  );

  const getConversationWith = (userId) =>
    allMessages.filter(
      (msg) =>
        msg.sender_id === userId || msg.recipient_id === userId
    );

  const sendMessage = () => {
    if (!chatInput || !selectedUserId) return;

    const messageData = {
      sender_id: 1, // assume admin is ID 1
      recipient_id: selectedUserId,
      message: chatInput,
    };

    socket.emit("chat message", messageData);
    setChatInput("");
  };

  return (
    <section style={{ display: "flex", gap: "2rem" }}>
      {/* Sidebar with user list */}
      <aside style={{ width: "200px", borderRight: "1px solid #ccc" }}>
        <h3>Conversations</h3>
        <ul>
          {userIds.map((uid) => (
            <li key={uid}>
              <button onClick={() => setSelectedUserId(uid)}>
                User #{uid}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Chat window */}
      <div style={{ flex: 1 }}>
        {selectedUserId ? (
          <>
            <h3>Chat with User #{selectedUserId}</h3>
            <div
              style={{
                height: "300px",
                overflowY: "scroll",
                border: "1px solid #ddd",
                padding: "0.5rem",
                marginBottom: "1rem",
              }}
            >
              {getConversationWith(selectedUserId).map((msg) => (
                <p key={msg.id}>
                  <strong>
                    {msg.sender_id === 1 ? "Admin" : `User #${msg.sender_id}`}:
                  </strong>{" "}
                  {msg.message}
                </p>
              ))}
            </div>

            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type a message..."
            />
            <button onClick={sendMessage}>Send</button>
          </>
        ) : (
          <p>Select a user to chat with</p>
        )}
      </div>
    </section>
  );
}
