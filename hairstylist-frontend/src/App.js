import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import "./App.css";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import LoginUser from "./pages/LoginUser";
import UserDashboard from "./pages/UserDashboard";
import AdminChat from "./components/AdminChat";
import UserChat from "./components/UserChat";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login-user" element={<LoginUser />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/admin/chat" element={<AdminChat />} />
        <Route path="/chat" element={<UserChat />} />
      </Routes>
    </Router>
  );
}

export default App;
