import { api } from "../../api/client";
import axios from "axios";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hook";
import { login, logout } from "./authSlice";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import logo from "@/assets/olyvex-logo.png";
import { MagicCard } from "@/components/ui/magic-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";

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
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [invalidField, setInvalidField] = useState<"email" | "password" | null>(
    null,
  );

  const user = useAppSelector((state) => state.auth.user);
  const status = useAppSelector((state) => state.auth.status);

  const reduceMotion = useReducedMotion();

  const showValidationError = (
    field: "email" | "password",
    message: string,
  ) => {
    setInvalidField(field);
    toast.error("Check your details", message);
  };

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    setInvalidField(null);

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      showValidationError("email", "Email is required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      showValidationError("email", "Please enter a valid email address");
      return;
    }

    if (!password) {
      showValidationError("password", "Password is required");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post<LoginResponse>("/api/auth/login", {
        email: trimmedEmail,
        password,
      });

      const data = response.data;

      dispatch(
        login({
          user: data.user,
          token: data.token,
        }),
      );

      toast.success("Welcome back", `Signed in as ${data.user.name}.`);

      navigate("/", { replace: true });

      console.log("Login successful");
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Something went wrong")
        : "Something went wrong";

      toast.error("Login failed", message);
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
    <main className="flex min-h-dvh flex-col items-center justify-center gap-5 overflow-x-hidden bg-[#09090B] px-4 py-6 sm:gap-6 sm:px-6 sm:py-10">
      <motion.img
        src={logo}
        alt="Olyvex"
        width={1200}
        height={402}
        className="h-auto w-36 select-none sm:w-40 lg:w-44"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        draggable={false}
      />

      <motion.div
        className="w-full max-w-sm"
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05, ease: "easeOut" }}
      >
        <MagicCard>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5 p-6 sm:p-7"
          >
            <div className="flex flex-col gap-1.5">
              <h1 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
                Login
              </h1>
              <p className="text-xs text-zinc-500">
                Enter your email and password to continue.
              </p>
            </div>

            <div className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email" className="text-[13px] text-zinc-200">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-invalid={invalidField === "email"}
                  className="h-10 border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-600"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="password" className="text-[13px] text-zinc-200">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Your password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    aria-invalid={invalidField === "password"}
                    className="h-10 border-zinc-800 bg-zinc-950 pr-10 text-white placeholder:text-zinc-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-md text-zinc-500 transition-colors hover:text-zinc-200 focus-visible:text-zinc-200 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" aria-hidden="true" />
                    ) : (
                      <Eye className="size-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Logging in..." : "Log in"}
            </Button>

            <p className="text-center text-xs text-zinc-400">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="rounded-sm font-medium text-white underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none"
              >
                Create an account
              </Link>
            </p>

            {status === "authenticated" && user && (
              <div className="flex flex-col gap-3 border-t border-zinc-800 pt-5 text-xs text-zinc-400">
                <div>
                  <p>
                    Logged in as{" "}
                    <span className="font-medium text-white">{user.name}</span>
                  </p>
                  <p className="break-all">{user.email}</p>
                  <p>Role: {user.role}</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full"
                >
                  Log out
                </Button>
              </div>
            )}
          </form>
        </MagicCard>
      </motion.div>
    </main>
  );
}

export default Login;
