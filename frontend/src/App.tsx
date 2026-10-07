import { Navigate, Route, Routes } from "react-router";
import Login from "./features/auth/Login";
import Register from "./features/auth/Register";
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import { useEffect } from "react";
import { useAppDispatch } from "./app/hook";
import { restoreSession } from "./features/auth/authSlice";
import { restoreAdminSession } from "./features/admin/adminAuthSlice"
import Profile from "./features/profile/Profile";
import AdminLogin from "./features/admin/AdminLogin";
import AdminUsers from "./features/admin/AdminUsers";
import AdminRoute from "./components/AdminRoute";

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(restoreSession());
    dispatch(restoreAdminSession())
  }, [dispatch]);

  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />

      <Route path="/admin/login" element={<AdminLogin />} />

      <Route element={<AdminRoute />}>
        <Route path="/admin/users" element={<AdminUsers />} />
      </Route>
    </Routes>
  );
}

export default App;