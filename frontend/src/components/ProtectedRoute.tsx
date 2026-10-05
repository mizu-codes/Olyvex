import { Navigate, Outlet } from "react-router"
import { useAppSelector } from "../app/hook"

function ProtectedRoute() {
  const status = useAppSelector((state) => state.auth.status)

  if (status === "checking") {
    return <p>Checking session...</p>
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute