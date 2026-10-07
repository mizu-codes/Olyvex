import { Navigate, Outlet } from "react-router";
import { useAppSelector } from "../../app/hook";

function PublicRoute() {
  const status = useAppSelector((state) => state.auth.status);

  if (status === "checking") {
    return <p>Checking session...</p>;
  }

  if (status === "authenticated") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default PublicRoute;
