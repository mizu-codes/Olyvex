import { Navigate, Outlet } from "react-router";
import { useAppSelector } from "../../app/hook";
import { Spinner } from "@/components/ui/spinner";

function AdminPublicRoute() {
  const status = useAppSelector((state) => state.adminAuth.status);
  const user = useAppSelector((state) => state.adminAuth.user);

  if (status === "checking") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#09090B]">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (status === "authenticated" && user?.role === "admin") {
    return <Navigate to="/admin/users" replace />;
  }

  return <Outlet />;
}

export default AdminPublicRoute;
