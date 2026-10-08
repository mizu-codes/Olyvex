import { Navigate, Outlet } from "react-router";
import { useAppSelector } from "../../app/hook";
import { Spinner } from "@/components/ui/spinner";

function AdminRoute() {
  const status = useAppSelector((state) => state.adminAuth.status);

  const user = useAppSelector((state) => state.adminAuth.user);

  if (status === "checking") {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/admin/login" replace />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;
