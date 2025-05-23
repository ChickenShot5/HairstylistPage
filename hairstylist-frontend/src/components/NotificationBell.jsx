import { useEffect, useState } from "react";

export default function NotificationBell({ token }) {
  const [notifications, setNotifications] = useState([]);
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:4000/notifications", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setNotifications)
      .catch((err) => console.error("Notification fetch error:", err));
  }, [token]);

  const markAsRead = (id) => {
    fetch(`http://localhost:4000/notifications/${id}/read`, {
      method: "PATCH",
    })
      .then(() => {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
        );
      })
      .catch(console.error);
  };

  const markAllAsRead = () => {
    Promise.all(
      notifications
        .filter((n) => !n.is_read)
        .map((n) =>
          fetch(`http://localhost:4000/notifications/${n.id}/read`, {
            method: "PATCH",
          })
        )
    ).then(() => {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    });
  };

  const hasUnread = Array.isArray(notifications)
    ? notifications.some((n) => !n.is_read)
    : false;

  const deleteNotification = (id) => {
    fetch(`http://localhost:4000/notifications/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      })
      .catch(console.error);
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button onClick={() => setShowList((prev) => !prev)}>
        🔔
        {hasUnread && (
          <span
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              background: "red",
              color: "white",
              borderRadius: "50%",
              width: "16px",
              height: "16px",
              fontSize: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {notifications.filter((n) => !n.is_read).length}
          </span>
        )}
      </button>

      {showList && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "2.5rem",
            background: "white",
            border: "1px solid #ccc",
            padding: "0.5rem",
            width: "300px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            zIndex: 10,
          }}
        >
          <button
            onClick={markAllAsRead}
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontSize: "0.9rem",
              cursor: "pointer",
              background: "transparent",
              border: "none",
              color: "#007bff",
              textDecoration: "underline",
            }}
          >
            Mark all as read
          </button>

          <ul style={{ listStyle: "none", paddingLeft: 0 }}>
            {notifications.length === 0 ? (
              <li>No notifications</li>
            ) : (
              <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                {Array.isArray(notifications) && notifications.length > 0 ? (
                  notifications.map((note) => (
                    <li key={note.id} style={{ marginBottom: "0.5rem" }}>
                      <div
                        style={{ fontWeight: note.is_read ? "normal" : "bold" }}
                      >
                        <small>
                          {new Date(note.created_at).toLocaleString()}
                        </small>
                        <br />
                        {note.message}
                      </div>
                      {!note.is_read && (
                        <button
                          onClick={() => markAsRead(note.id)}
                          style={{
                            fontSize: "0.8rem",
                            cursor: "pointer",
                            background: "transparent",
                            border: "none",
                            color: "#007bff",
                            textDecoration: "underline",
                          }}
                        >
                          Mark as read
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(note.id)}
                        style={{
                          fontSize: "0.8rem",
                          marginLeft: "0.5rem",
                          color: "red",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </li>
                  ))
                ) : (
                  <li>No notifications</li>
                )}
              </ul>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
