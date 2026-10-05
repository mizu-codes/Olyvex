import { Navigate, Outlet } from "react-router"
import { useAppSelector } from "../app/hook"

function AdminRoute() {
  const status = useAppSelector(
    (state) => state.adminAuth.status
  )

  const user = useAppSelector(
    (state) => state.adminAuth.user
  )

  if (status === "checking") {
    return <p>Checking admin session...</p>
  }

  if (status === "unauthenticated") {
    return <Navigate to="/admin/login" replace />
  }

  if (user?.role !== "admin") {
    return <Navigate to="/admin/login" replace />
  }

  return <Outlet />
}

export default AdminRoute