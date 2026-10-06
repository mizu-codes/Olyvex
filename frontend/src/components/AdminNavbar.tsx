import { Link, useNavigate } from "react-router";
import { useAppDispatch } from "../app/hook";
import { logoutAdmin } from "../features/admin/adminAuthSlice";
import { api } from "../api/client";

function AdminNavbar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/api/admin/logout");
    } finally {
      dispatch(logoutAdmin());
      navigate("/admin/login", { replace: true });
    }
  };

  return (
    <nav>
      <Link to="/admin/users">Olyvex Admin</Link>

      <br />
      <br />
      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
}

export default AdminNavbar;
