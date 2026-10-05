import { useState } from "react"
import { useNavigate } from "react-router"
import { useAppDispatch } from "../../app/hook"
import { loginAdmin } from "./adminAuthSlice"

interface AdminLoginResponse {
  message: string
  token: string
  user: {
    id: string
    name: string
    email: string
    role: "admin"
    profileImage?: string | null
  }
}

function AdminLogin() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError("")

      const response = await fetch(
        "http://localhost:5000/api/admin/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email,
            password,
          }),
        }
      )

      const data: AdminLoginResponse = await response.json()

      if (!response.ok) {
        setError(data.message)
        return
      }

      if (data.user.role !== "admin") {
        setError("Admin access required")
        return
      }

      dispatch(
        loginAdmin({
          user: data.user,
          token: data.token,
        })
      )

      navigate("/admin/users", { replace: true })
    } catch (error) {
      console.error("Admin login failed:", error)
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h1>Admin Login</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Admin email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Admin Login"}
        </button>
      </form>
      
    </>
  )
}

export default AdminLogin