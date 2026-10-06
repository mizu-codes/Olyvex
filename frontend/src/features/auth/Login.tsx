import { api } from "../../api/client";
import axios from "axios";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hook";
import { login, logout } from "./authSlice";
import { Link, useNavigate } from "react-router";

interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "user" | "admin";
  };
}

function Login() {
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const user = useAppSelector((state) => state.auth.user);
  const status = useAppSelector((state) => state.auth.status);

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await api.post<LoginResponse>("/api/auth/login", {
        email,
        password,
      });

      const data = response.data;

      dispatch(
        login({
          user: data.user,
          token: data.token,
        }),
      );

      navigate("/dashboard", { replace: true });

      console.log("Login successful");
    } catch (error) {
  if (axios.isAxiosError(error)) {
    setError(error.response?.data?.message ?? "Something went wrong");
  } else {
    setError("Something went wrong");
  }
} finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
    } finally {
      dispatch(logout());
      navigate("/login");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Login</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />

      <button type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>

      {error && <p>{error}</p>}

      <p>
        Don't have an account? <Link to="/register">Create an account</Link>
      </p>

      {status === "authenticated" && user && (
        <div>
          <p>Logged in as: {user.name}</p>
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>

          <button type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </form>
  );
}

export default Login;
