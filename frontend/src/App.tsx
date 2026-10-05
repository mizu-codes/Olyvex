import { Navigate, Route, Routes } from "react-router";
import Login from "./features/auth/Login";
import Register from "./features/auth/Register"
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import { useEffect } from "react";
import { useAppDispatch } from "./app/hook";
import { restoreSession } from "./features/auth/authSlice";
import Profile from "./features/profile/Profile";

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  return (
    <Routes>
      <Route element={<PublicRoute />}>
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
</Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
