import { useState, useEffect } from "react";
import socket from "../socket";
import NotificationBell from "./NotificationBell";

export default function AdminPanel() {
  const [appointments, setAppointments] = useState([]);
  const adminToken = localStorage.getItem("token");

  useEffect(() => {
    socket.on("cancel_request", (data) => {
      alert(
        `User ${data.userName} requested to cancel appointment on ${data.date} at ${data.time}`
      );
    });

    return () => {
      socket.off("cancel_request");
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:4000/appointments", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          throw new Error("Unauthorized");
        }
        return res.json();
      })
      .then((data) => setAppointments(data))
      .catch((err) => {
        console.error(err);
        setAppointments([]);
      });
  }, []);

  const approveCancel = (id) => {
    const token = localStorage.getItem("token");
    fetch(`http://localhost:4000/appointments/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => setAppointments((prev) => prev.filter((a) => a.id !== id)))
      .catch(console.error);
  };

  const denyCancel = (id, user_id) => {
    const token = localStorage.getItem("token");

    // Notify the user
    fetch("http://localhost:4000/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id,
        message: "Your cancellation request was refused by the admin.",
      }),
    }).then(() => {
      // Update cancel_requested = 0
      fetch(`http://localhost:4000/appointments/${id}/deny-cancel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(() => {
          // Reload the appointment list
          setAppointments((prev) =>
            prev.map((a) => (a.id === id ? { ...a, cancel_requested: 0 } : a))
          );
        })
        .catch(console.error);
    });
  };

  return (
    <section>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Welcome to Your Dashboard</h2>
        <NotificationBell token={adminToken} />
      </div>
      <h2>All Appointments</h2>
      {appointments.length === 0 ? (
        <p>No appointments yet.</p>
      ) : (
        <ul>
          {appointments.map((appt) => (
            <li key={appt.id}>
              <strong>
                {appt.date} at {appt.time}
              </strong>
              <br />
              {appt.name} ({appt.email})<br />
              {appt.cancel_requested ? (
                <>
                  <button onClick={() => approveCancel(appt.id)}>
                    ✅ Approve
                  </button>
                  <button onClick={() => denyCancel(appt.id, appt.user_id)}>
                    ❌ Refuse
                  </button>
                </>
              ) : (
                <em>No cancellation request</em>
              )}
            </li>
          ))}
        </ul>
      )}
      <button
        onClick={() => {
          localStorage.removeItem("token");
          alert("Logged out successfully.");
          window.location.href = "/login";
        }}
        style={{
          marginTop: "1rem",
          background: "#eee",
          border: "none",
          padding: "0.5rem",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </section>
  );
}
