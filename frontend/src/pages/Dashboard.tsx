import { logout } from "../features/auth/authSlice"
import { useAppDispatch } from "../app/hook"
import { useNavigate } from "react-router"
import { api } from "../api/client"

function Dashboard() {

    const dispatch=useAppDispatch()
    const navigate=useNavigate()

const handleLogout = async () => {
  try {
    await api.post("/api/auth/logout")
  } finally {
    dispatch(logout())
    navigate("/login")
  }
}

  return (
<div>
    <h2>Welcome to Dashboard!!!!!!!!!!!!!!!!</h2>
   <button type="button" onClick={handleLogout}>
      Logout
    </button>
    </div>
  )

  
}

export default Dashboard