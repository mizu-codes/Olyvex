import { Navigate, Outlet } from "react-router";
import { useAppSelector } from "../../app/hook";
import { Spinner } from "@/components/ui/spinner";

function ProtectedRoute() {
  const status = useAppSelector((state) => state.auth.status);

  if (status === "checking") {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
