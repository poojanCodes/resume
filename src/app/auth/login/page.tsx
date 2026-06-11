"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight } from "lucide-react";

import api from "@/lib/api";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

/**
 * LoginPage — Phase 2 upgrade.
 *
 * What's new vs the original:
 * 1. Uses our shared Input/Button/Alert components — no raw HTML mess
 * 2. show/hide password toggle (the Eye icon in the Input's rightSlot)
 * 3. Per-field inline validation errors (not just one global error string)
 * 4. Stores user info in localStorage after success — so useAuth() works
 * 5. Uses centralized api (withCredentials:true) — cookie is auto-sent
 * 6. Redirects to dashboard if already logged in
 *
 * Lesson: Notice the "field errors" pattern:
 *   const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
 * This is a common pattern where each key is a field name and the value is
 * the error message. Individual inputs read their own slice of this object.
 */

interface FieldErrors {
  email?:    string;
  password?: string;
}

export default function LoginPage() {
  const router = useRouter();

  // Form values
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors,  setFieldErrors]  = useState<FieldErrors>({});
  const [globalError,  setGlobalError]  = useState<string | null>(null);
  const [success,      setSuccess]      = useState(false);
  const [loading,      setLoading]      = useState(false);

  // If already logged in → skip to dashboard
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) router.replace("/dashboard");
  }, [router]);

  // ── Validation ──────────────────────────────────────────
  const validate = (): boolean => {
    const errors: FieldErrors = {};

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

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Submit ───────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);

    if (!validate()) return;

    try {
      setLoading(true);
      const res = await api.post("/api/auth/login", { email, password });

      if (res.data.success) {
        // Store user info for useAuth() hook to read
        // The actual JWT is in the HTTP-only cookie — we only store display data here
        const userData = res.data.data || res.data.user || {};
        localStorage.setItem(
          "user",
          JSON.stringify({
            name:  userData.username || userData.name || email.split("@")[0],
            email: userData.email || email,
            id:    userData._id || userData.id || "",
          })
        );

        setSuccess(true);
        setTimeout(() => router.push("/dashboard"), 1200);
      } else {
        setGlobalError(res.data.message || "Invalid email or password.");
      }
    } catch (err: any) {
      setGlobalError(
        err.response?.data?.message ||
          "Authentication failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  // Clear field error on change
  const handleEmailChange = (v: string) => {
    setEmail(v);
    if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
  };
  const handlePasswordChange = (v: string) => {
    setPassword(v);
    if (fieldErrors.password)
      setFieldErrors((p) => ({ ...p, password: undefined }));
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/8 rounded-full blur-[120px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/8 rounded-full blur-[120px]" />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Card */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">

          {/* Logo + Header */}
          <div className="text-center mb-8">
            <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 items-center justify-center shadow-lg shadow-blue-500/25 mb-4">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Welcome Back
            </h1>
            <p className="text-slate-400 text-sm mt-1.5">
              Sign in to continue building your resume
            </p>
          </div>

          {/* Alerts */}
          {globalError && (
            <Alert type="error" message={globalError} className="mb-5" />
          )}
          {success && (
            <Alert
              type="success"
              message="Login successful! Redirecting to your dashboard..."
              className="mb-5"
            />
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              icon={<Mail className="h-4 w-4" />}
              error={fieldErrors.email}
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              icon={<Lock className="h-4 w-4" />}
              error={fieldErrors.password}
              required
              autoComplete="current-password"
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

            <Button
              type="submit"
              loading={loading}
              fullWidth
              size="lg"
              className="mt-6"
              iconRight={!loading ? <ArrowRight className="h-4 w-4" /> : undefined}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center mt-6 text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              Create one free
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
