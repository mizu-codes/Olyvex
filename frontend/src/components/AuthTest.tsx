import { useAppDispatch, useAppSelector } from "../app/hook";
import { login, logout } from "../features/auth/authSlice";

function AuthTest() {
  const dispatch = useAppDispatch();

  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const handleLogin = () => {
    dispatch(
      login({
        user: {
          id: "1",
          name: "Mizhan",
          email: "mizhan@example.com",
          role: "user",
        },
        token: "fake-token-123",
      }),
    );
  };

  return (
    <div>
      <h1>Auth Test</h1>
      <button onClick={handleLogin}>Login</button>
      <button onClick={() => dispatch(logout())}>Logout</button>
      <p>Authenticated: {isAuthenticated ? "Yes" : "No"}</p>
      <p>User: {user?.name ?? "Not logged in"}</p>
    </div>
  );
}

export default AuthTest;
