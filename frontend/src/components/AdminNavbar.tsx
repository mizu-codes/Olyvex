import { Link, useNavigate } from "react-router"
import { useAppDispatch } from "../app/hook"
import { logoutAdmin } from "../features/admin/adminAuthSlice"

function AdminNavbar() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/admin/logout", {
        method: "POST",
        credentials: "include",
      })
    } finally {
      dispatch(logoutAdmin())
      navigate("/admin/login", { replace: true })
    }
  }

  return (
    <nav>
      <Link to="/admin/users">
        Olyvex Admin
      </Link>

      <br /><br /><button onClick={handleLogout}>
        Logout
      </button>
    </nav>
  )
}

export default AdminNavbar