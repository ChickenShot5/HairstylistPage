import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket";
import NotificationBell from "../components/NotificationBell";

export default function UserDashboard() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName");
  const userToken = localStorage.getItem("userToken");
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    socket.on("cancel_approved", (data) => {
      setAppointments((prev) =>
        prev.filter((a) => a.id !== data.appointmentId)
      );
      alert("Your appointment was cancelled by the admin.");
    });

    socket.on("cancel_refused", (data) => {
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === data.appointmentId ? { ...a, cancel_requested: 0 } : a
        )
      );
      alert("Your cancellation request was denied by the admin.");
    });

    return () => {
      socket.off("cancel_approved");
      socket.off("cancel_refused");
    };
  }, []);

  useEffect(() => {
    if (!userToken) {
      navigate("/login-user");
      return;
    }

    fetch("http://localhost:4000/appointments/my-appointments", {
      headers: {
        Authorization: `Bearer ${userToken}`, // ✅ must match this format
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(setAppointments)
      .catch((err) => {
        console.error("Error loading appointments:", err);
      });
  }, [userToken, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userName");
    navigate("/login-user");
  };

  const requestCancel = (id) => {
    fetch(`http://localhost:4000/appointments/${id}/request-cancel`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    })
      .then((res) => res.json())
      .then((msg) => alert(msg.message))
      .then(() => {
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, cancel_requested: 1 } : a))
        );
      })
      .catch(console.error);
  };

  return (
    <section>
      {/* Header with chat and notifications */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h2>Hello, {userName}!</h2>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <button
            onClick={() => navigate("/chat")}
            style={{
              background: "#007bff",
              color: "#fff",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            💬 Chat with Admin
          </button>
          <NotificationBell token={userToken} />
        </div>
      </div>

      <h3>Your Appointments</h3>
      {appointments.length === 0 ? (
        <p>No appointments yet.</p>
      ) : (
        <ul>
          {appointments.map((appt) => (
            <li key={appt.id}>
              {appt.date} at {appt.time}{" "}
              {appt.cancel_requested ? (
                <span style={{ color: "orange" }}>
                  ⏳ Cancellation Requested
                </span>
              ) : (
                <button onClick={() => requestCancel(appt.id)}>
                  Request Cancellation
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={handleLogout}
        style={{
          marginTop: "2rem",
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
