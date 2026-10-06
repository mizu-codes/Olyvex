import { useState } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch } from "../../app/hook";
import { loginAdmin } from "./adminAuthSlice";
import { api } from "../../api/client";
import axios from "axios";

interface AdminLoginResponse {
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "admin";
    profileImage?: string | null;
  };
}

function AdminLogin() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await api.post<AdminLoginResponse>("/api/admin/login", {
        email,
        password,
      });

      const data = response.data;

      if (data.user.role !== "admin") {
        setError("Admin access required");
        return;
      }

      dispatch(
        loginAdmin({
          user: data.user,
          token: data.token,
        }),
      );

      navigate("/admin/users", { replace: true });
    } catch (error) {
      console.error("Admin login failed:", error);

      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ??
            "Something went wrong. Please try again.",
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1>Admin Login</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Admin email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Admin Login"}
        </button>
      </form>
    </>
  );
}

export default AdminLogin;
