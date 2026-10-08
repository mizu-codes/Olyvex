import { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router";

import ProtectedRoute from "./components/guards/ProtectedRoute";
import PublicRoute from "./components/guards/PublicRoute";
import AdminRoute from "./components/guards/AdminRoute";

import { useAppDispatch } from "./app/hook";
import { restoreSession } from "./features/auth/authSlice";
import { restoreAdminSession } from "./features/admin/adminAuthSlice";

import { Spinner } from "@/components/ui/spinner";

const Login = lazy(() => import("./features/auth/Login"));
const Register = lazy(() => import("./features/auth/Register"));
const Home = lazy(() => import("./pages/Home"));
const Profile = lazy(() => import("./features/profile/Profile"));
const AdminLogin = lazy(() => import("./features/admin/AdminLogin"));
const AdminUsers = lazy(() => import("./features/admin/AdminUsers"));

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(restoreSession());
    dispatch(restoreAdminSession());
  }, [dispatch]);

  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-[#09090B]">
          <Spinner className="size-6" />
        </div>
      }
    >
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />

        <Route element={<AdminRoute />}>
          <Route path="/admin/users" element={<AdminUsers />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
