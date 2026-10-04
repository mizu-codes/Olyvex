import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hook";
import { login, logout } from "./authSlice";
import { Link, useNavigate } from "react-router"

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

  const navigate = useNavigate()

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const user = useAppSelector((state) => state.auth.user);
  const status = useAppSelector((state) => state.auth.status);

  const token = useAppSelector((state) => state.auth.token);

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data: LoginResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      dispatch(
        login({
          user: data.user,
          token: data.token,
        }),
      );

      navigate("/dashboard", { replace: true })

      console.log("Login successful");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGetMe = async () => {
  if (!token) {
    return
  }

  const response = await fetch(
    "http://localhost:5000/api/auth/me",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  const data = await response.json()

  console.log(data)
}

const handleLogout = async () => {
  try {
    await fetch("http://localhost:5000/api/auth/logout", {
      method: "POST",
      credentials: "include",
    })
  } finally {
    dispatch(logout())
    navigate("/login")
  }
}

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
  Don't have an account?{" "}
  <Link to="/register">Create an account</Link>
</p>

      <button
  type="button"
  onClick={handleGetMe}
  disabled={status !== "authenticated"}
>
  Get My Profile
</button>

      {status==='authenticated' && user && (
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
