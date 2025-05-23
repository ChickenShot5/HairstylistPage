import { Link } from "react-router-dom";

export default function Navbar() {
  const userName = localStorage.getItem("userName");

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>
        <Link to="/" style={styles.link}>💇‍♀️ Violeta's Hair Studio</Link>
      </div>
      <div style={styles.menu}>
        {userName ? (
          <>
            <span style={styles.welcome}>Welcome, {userName}</span>
            <Link to="/dashboard" style={styles.link}>Dashboard</Link>
          </>
        ) : (
          <>
            <Link to="/signup" style={styles.link}>Sign Up</Link>
            <Link to="/login-user" style={styles.link}>Log In</Link>
          </>
        )}
        <Link to="/contact" style={styles.link}>Contact</Link>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    background: "#ffe0e6",
    padding: "1rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #ccc",
  },
  brand: {
    fontWeight: "bold",
    fontSize: "1.2rem",
  },
  menu: {
    display: "flex",
    gap: "1rem",
  },
  link: {
    textDecoration: "none",
    color: "#d6336c",
    fontWeight: "bold",
  },
  welcome: {
    fontWeight: "normal",
    marginRight: "1rem",
  },
};
