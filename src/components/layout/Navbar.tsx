"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, LogOut, LayoutDashboard } from "lucide-react";
import api from "@/lib/api";

/**
 * Navbar — shared top navigation for authenticated pages (Dashboard, Resume Editor).
 *
 * Props:
 * - userName: shown as "Welcome, {name}"
 * - showDashboardLink: show a back-to-dashboard link (for editor pages)
 */

interface NavbarProps {
  userName?:          string;
  showDashboardLink?: boolean;
}

export default function Navbar({
  userName = "User",
  showDashboardLink = false,
}: NavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      // Even if logout API fails, clear client state and redirect
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
      }
      router.push("/auth/login");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-shadow">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-base bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent hidden sm:inline">
            AI Resume Builder
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {showDashboardLink && (
            <Link
              href="/dashboard"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Dashboard
            </Link>
          )}

          <span className="text-sm text-slate-400 hidden md:block">
            Welcome,{" "}
            <span className="text-blue-400 font-semibold">{userName}</span>
          </span>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
