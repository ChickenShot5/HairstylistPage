import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminPanel from "../components/AdminPanel";

export default function Admin() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <main>
      <AdminPanel />
    </main>
  );
}
