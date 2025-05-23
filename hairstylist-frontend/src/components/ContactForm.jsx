import { useState } from "react";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [response, setResponse] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch("http://localhost:4000/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then((res) => {
        if (res.ok) {
          setResponse("Thank you for your message!");
        } else {
          setResponse("Something went wrong.");
        }
      })
      .catch((err) => {
        console.error("Error sending message:", err);
        setResponse("Something went wrong.");
      });
  };

  return (
    <section>
      <h2>Contact Me</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Your name"
          onChange={handleChange}
          required
        />
        <input
          name="email"
          placeholder="Your email"
          onChange={handleChange}
          required
        />
        <textarea
          name="message"
          placeholder="Your message"
          onChange={handleChange}
          required
        />
        <button type="submit">Send</button>
      </form>
      <p>{response}</p>
    </section>
  );
}
