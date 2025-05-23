import { useState } from "react";
import { Link } from "react-router-dom";

export default function Scheduler() {
  const token = localStorage.getItem("userToken");
  const userName = localStorage.getItem("userName") || "";
  const userEmail = localStorage.getItem("userEmail") || "";

  const [form, setForm] = useState({
    name: userName,
    email: userEmail,
    date: "",
    time: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch("http://localhost:4000/appointments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    })
      .then((res) => {
        if (res.status === 409) {
          setMessage("That time slot is already booked.");
        } else if (res.ok) {
          setMessage("Appointment booked!");
          // Reset only date and time
          setForm((prev) => ({ ...prev, date: "", time: "" }));
        } else {
          setMessage("Something went wrong.");
        }
      })
      .catch((err) => {
        console.error("Error submitting appointment:", err);
        setMessage("Something went wrong.");
      });
  };

  if (!token) {
    return (
      <section>
        <h2>Book an Appointment</h2>
        <p>
          Please <Link to="/login-user">log in</Link> or{" "}
          <Link to="/signup">sign up</Link> to book an appointment.
        </p>
      </section>
    );
  }

  return (
    <section>
      <h2>Book an Appointment</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          value={form.name}
          readOnly
          style={{ background: "#f8f8f8" }}
        />
        <input
          name="email"
          value={form.email}
          readOnly
          style={{ background: "#f8f8f8" }}
        />
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
        />
        <input
          type="time"
          name="time"
          value={form.time}
          onChange={handleChange}
          required
        />
        <button type="submit">Book</button>
      </form>
      <p>{message}</p>
    </section>
  );
}
