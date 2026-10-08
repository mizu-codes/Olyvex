import { Navigate, Outlet } from "react-router";
import { useAppSelector } from "../../app/hook";
import { Spinner } from "@/components/ui/spinner";

function PublicRoute() {
  const status = useAppSelector((state) => state.auth.status);

  if (status === "checking") {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (status === "authenticated") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default PublicRoute;
