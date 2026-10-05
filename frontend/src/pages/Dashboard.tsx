import { logout } from "../features/auth/authSlice"
import { useAppDispatch } from "../app/hook"
import { useNavigate } from "react-router"

function Dashboard() {

    const dispatch=useAppDispatch()
    const navigate=useNavigate()

const handleLogout = async () => {
  try {
    await fetch("http://localhost:5000/api/auth/logout", {
      method: "POST",
      credentials: "include",
    })
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