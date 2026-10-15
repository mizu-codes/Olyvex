import axios from "axios";
import { api } from "../../api/client";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormValues } from "./authSchemas";

import logo from "@/assets/olyvex-logo.png";
import { MagicCard } from "@/components/ui/magic-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";

import { Spinner } from "@/components/ui/spinner";

function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const reduceMotion = useReducedMotion();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    mode: "onTouched",
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await api.post<{ message: string }>("/api/auth/register", {
        name: values.name,
        email: values.email,
        password: values.password,
      });

      reset();

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
            onSubmit={handleSubmit(onSubmit)}
            noValidate
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
                  type="text"
                  autoComplete="name"
                  placeholder="Your name"
                  {...register("name")}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  className="h-10 border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-600"
                />
                {errors.name && (
                  <p
                    id="name-error"
                    className="text-xs text-rose-400"
                    role="alert"
                  >
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="email" className="text-[13px] text-zinc-200">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className="h-10 border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-600"
                />

                {errors.email && (
                  <p
                    id="email-error"
                    className="text-xs text-rose-400"
                    role="alert"
                  >
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="password" className="text-[13px] text-zinc-200">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    {...register("password")}
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={
                      errors.password ? "password-error" : undefined
                    }
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
                {errors.password && (
                  <p
                    id="password-error"
                    className="text-xs text-rose-400"
                    role="alert"
                  >
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Spinner className="size-4" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
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
