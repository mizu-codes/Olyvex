import axios from "axios";
import { api } from "../../api/client";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import logo from "@/assets/olyvex-logo.png";
import { MagicCard } from "@/components/ui/magic-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [invalidField, setInvalidField] = useState<
    "name" | "email" | "password" | null
  >(null);

  const reduceMotion = useReducedMotion();

  const showValidationError = (
    field: "name" | "email" | "password",
    message: string,
  ) => {
    setInvalidField(field);
    toast.error("Check your details", message);
  };

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    setInvalidField(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      showValidationError("name", "Name is required");
      return;
    }

    if (trimmedName.length < 2) {
      showValidationError("name", "Name must be at least 2 characters");
      return;
    }

    if (trimmedName.length > 50) {
      showValidationError("name", "Name must be 50 characters or less");
      return;
    }

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

    if (password.length < 8) {
      showValidationError("password", "Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      await api.post<{ message: string }>("/api/auth/register", {
        name,
        email,
        password,
      });

      setName("");
      setEmail("");
      setPassword("");

      toast.success(
        "Account created",
        "Your account was created successfully.",
      );

      navigate("/login", { replace: true });
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Something went wrong")
        : "Something went wrong";

      toast.error("Registration failed", message);
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
        <MagicCard>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5 p-6 sm:p-7"
          >
            <div className="flex flex-col gap-1.5">
              <h1 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
                Signup
              </h1>
              <p className="text-xs text-zinc-500">
                Enter your details to get started.
              </p>
            </div>

            <div className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name" className="text-[13px] text-zinc-200">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Your name"
                  required
                  minLength={2}
                  maxLength={50}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  aria-invalid={invalidField === "name"}
                  className="h-10 border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-600"
                />
              </div>

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
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    value={password}
                    required
                    minLength={8}
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
              {loading ? "Creating account..." : "Create account"}
            </Button>

            <p className="text-center text-xs text-zinc-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="rounded-sm font-medium text-white underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none"
              >
                Log in
              </Link>
            </p>
          </form>
        </MagicCard>
      </motion.div>
    </main>
  );
}

export default Register;
