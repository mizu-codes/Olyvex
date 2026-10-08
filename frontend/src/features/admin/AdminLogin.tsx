import { useState } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch } from "../../app/hook";
import { loginAdmin } from "./adminAuthSlice";
import { api } from "../../api/client";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import logo from "@/assets/olyvex-logo.png";
import { AdminCard } from "@/components/ui/admin-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";

import { Spinner } from "@/components/ui/spinner";

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
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const reduceMotion = useReducedMotion();

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await api.post<AdminLoginResponse>("/api/admin/login", {
        email,
        password,
      });

      const data = response.data;

      if (data.user.role !== "admin") {
        toast.error("Access denied", "Admin access required");
        return;
      }

      dispatch(
        loginAdmin({
          user: data.user,
          token: data.token,
        }),
      );

      toast.success(
        "Welcome back",
        "Signed in to the admin area successfully.",
      );

      navigate("/admin/users", { replace: true });
    } catch (error) {
      console.error("Admin login failed:", error);

      if (axios.isAxiosError(error)) {
        toast.error(
          "Login failed",
          error.response?.data?.message ??
            "Something went wrong. Please try again.",
        );
      } else {
        toast.error("Login failed", "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
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
        <AdminCard>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5 p-6 sm:p-7"
          >
            <div className="flex flex-col gap-1.5">
              <h1 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
                Admin
              </h1>
              <p className="text-xs text-zinc-500">
                Sign in to access the admin area.
              </p>
            </div>

            <div className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="admin-email"
                  className="text-[13px] text-zinc-200"
                >
                  Email
                </Label>
                <Input
                  id="admin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-600"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="admin-password"
                  className="text-[13px] text-zinc-200"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="admin-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              {loading ? (
                <>
                  <Spinner className="size-4" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </AdminCard>
      </motion.div>
    </main>
  );
}

export default AdminLogin;
