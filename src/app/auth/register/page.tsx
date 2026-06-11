"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import api from "@/lib/api";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

/**
 * RegisterPage — Phase 2 upgrade.
 *
 * What's new vs the original:
 * 1. Per-field inline validation (username, email, password length, confirm match)
 * 2. Confirm Password field — a must-have on any register form
 * 3. Show/hide password toggle on both password fields
 * 4. Password strength indicator — live feedback as user types
 * 5. Stores user info in localStorage after success
 * 6. Uses centralized api (withCredentials:true)
 * 7. Redirects to dashboard if already logged in
 *
 * Lesson — Password Strength:
 * We calculate a 0-4 score by checking criteria (length, uppercase, number, symbol).
 * This is a UX best-practice that many apps skip but users appreciate.
 */

interface FieldErrors {
  username?:        string;
  email?:           string;
  password?:        string;
  confirmPassword?: string;
  mobile?:          string;
}

function getPasswordStrength(pw: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (pw.length >= 8)                score++;
  if (/[A-Z]/.test(pw))             score++;
  if (/[0-9]/.test(pw))             score++;
  if (/[^A-Za-z0-9]/.test(pw))      score++;

  const map = [
    { label: "Too short",  color: "bg-red-500" },
    { label: "Weak",       color: "bg-orange-500" },
    { label: "Fair",       color: "bg-amber-500" },
    { label: "Good",       color: "bg-blue-500" },
    { label: "Strong",     color: "bg-emerald-500" },
  ];
  return { score, ...map[score] };
}

export default function RegisterPage() {
  const router = useRouter();

  // Form values
  const [username,        setUsername]        = useState("");
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mobile,          setMobile]          = useState("");

  // UI states
  const [showPassword,        setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors,         setFieldErrors]         = useState<FieldErrors>({});
  const [globalError,         setGlobalError]         = useState<string | null>(null);
  const [success,             setSuccess]             = useState(false);
  const [loading,             setLoading]             = useState(false);

  const pwStrength = password ? getPasswordStrength(password) : null;

  // If already logged in → skip to dashboard
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) router.replace("/dashboard");
  }, [router]);

  // ── Validation ─────────────────────────────────────────
  const validate = (): boolean => {
    const errors: FieldErrors = {};

    if (!username.trim()) {
      errors.username = "Username is required.";
    } else if (username.trim().length < 3) {
      errors.username = "Username must be at least 3 characters.";
    } else if (/\s/.test(username)) {
      errors.username = "Username cannot contain spaces.";
    }

    if (!email.trim()) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (mobile && !/^\+?[\d\s\-()]{7,15}$/.test(mobile)) {
      errors.mobile = "Please enter a valid phone number.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Submit ──────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);

    if (!validate()) return;

    try {
      setLoading(true);
      const res = await api.post("/api/auth/register", {
        username: username.trim(),
        email:    email.trim(),
        password,
        mobile:   mobile || undefined,
      });

      if (res.data.success) {
        // Store user info for useAuth()
        const userData = res.data.data || res.data.user || {};
        localStorage.setItem(
          "user",
          JSON.stringify({
            name:  userData.username || username.trim(),
            email: userData.email    || email.trim(),
            id:    userData._id      || userData.id || "",
          })
        );

        setSuccess(true);
        setTimeout(() => router.push("/dashboard"), 1500);
      } else {
        setGlobalError(res.data.message || "Registration failed. Please try again.");
      }
    } catch (err: any) {
      setGlobalError(
        err.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Clear field error when user edits that field
  const clearError = (field: keyof FieldErrors) =>
    setFieldErrors((p) => ({ ...p, [field]: undefined }));

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-600/8 rounded-full blur-[120px]" />
      <div className="pointer-events-none absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-600/8 rounded-full blur-[120px]" />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Card */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">

          {/* Logo + Header */}
          <div className="text-center mb-8">
            <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 items-center justify-center shadow-lg shadow-blue-500/25 mb-4">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Create Your Account
            </h1>
            <p className="text-slate-400 text-sm mt-1.5">
              Start building AI-powered resumes for free
            </p>
          </div>

          {/* Alerts */}
          {globalError && (
            <Alert type="error" message={globalError} className="mb-5" />
          )}
          {success && (
            <Alert
              type="success"
              message="Account created! Redirecting to your dashboard..."
              className="mb-5"
            />
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Username */}
            <Input
              label="Username"
              type="text"
              placeholder="johndoe"
              value={username}
              onChange={(e) => { setUsername(e.target.value); clearError("username"); }}
              icon={<User className="h-4 w-4" />}
              error={fieldErrors.username}
              required
              autoComplete="username"
            />

            {/* Email */}
            <Input
              label="Email Address"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
              icon={<Mail className="h-4 w-4" />}
              error={fieldErrors.email}
              required
              autoComplete="email"
            />

            {/* Password + Strength Indicator */}
            <div className="space-y-2">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearError("password"); }}
                icon={<Lock className="h-4 w-4" />}
                error={fieldErrors.password}
                required
                autoComplete="new-password"
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
              />

              {/* Password Strength Bar */}
              {pwStrength && password.length > 0 && (
                <div className="space-y-1.5 px-0.5">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={[
                          "h-1 flex-1 rounded-full transition-all duration-300",
                          i < pwStrength.score
                            ? pwStrength.color
                            : "bg-slate-800",
                        ].join(" ")}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Strength:{" "}
                    <span
                      className={
                        pwStrength.score <= 1
                          ? "text-red-400"
                          : pwStrength.score === 2
                          ? "text-amber-400"
                          : pwStrength.score === 3
                          ? "text-blue-400"
                          : "text-emerald-400"
                      }
                    >
                      {pwStrength.label}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <Input
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); clearError("confirmPassword"); }}
              icon={
                confirmPassword && password === confirmPassword ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Lock className="h-4 w-4" />
                )
              }
              error={fieldErrors.confirmPassword}
              required
              autoComplete="new-password"
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((p) => !p)}
                  className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? "Hide" : "Show"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
            />

            {/* Mobile (optional) */}
            <Input
              label="Mobile Number"
              type="tel"
              placeholder="+91 98765 43210 (optional)"
              value={mobile}
              onChange={(e) => { setMobile(e.target.value); clearError("mobile"); }}
              icon={<Phone className="h-4 w-4" />}
              error={fieldErrors.mobile}
              hint="Used for account recovery. Optional."
              autoComplete="tel"
            />

            <Button
              type="submit"
              loading={loading}
              fullWidth
              size="lg"
              className="mt-6"
              iconRight={!loading ? <ArrowRight className="h-4 w-4" /> : undefined}
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center mt-6 text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Back link */}
        <p className="text-center mt-4 text-xs text-slate-600">
          <Link href="/" className="hover:text-slate-400 transition-colors">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
