"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Layers,
  FileText,
  Eye,
  CheckCircle2,
} from "lucide-react";
import Navbar from "./Navbar";

/**
 * ResumeEditorShell — the layout wrapper for all resume editing steps.
 *
 * It renders:
 * 1. The shared Navbar at the top
 * 2. A left sidebar with the step-by-step progress navigator
 * 3. The main content area (children = the current step's form)
 *
 * Lesson: This is the "shell" pattern. Instead of repeating the sidebar
 * on every step page, we put it here and pass the page content as children.
 * It keeps each step page focused on ONLY its form logic.
 */

interface ResumeEditorShellProps {
  children:   React.ReactNode;
  resumeId:   string;
  userName?:  string;
}

interface StepConfig {
  label:    string;
  path:     string;
  icon:     React.ElementType;
  shortLabel: string;
}

export const RESUME_STEPS: StepConfig[] = [
  { label: "Personal Info",    shortLabel: "Personal",    path: "personal-info",    icon: User },
  { label: "Work Experience",  shortLabel: "Experience",  path: "work-experience",  icon: Briefcase },
  { label: "Education",        shortLabel: "Education",   path: "education",         icon: GraduationCap },
  { label: "Projects",         shortLabel: "Projects",    path: "projects",          icon: FolderGit2 },
  { label: "Skills",           shortLabel: "Skills",      path: "skills",            icon: Layers },
  { label: "Summary",          shortLabel: "Summary",     path: "summary",           icon: FileText },
  { label: "Preview",          shortLabel: "Preview",     path: "preview",           icon: Eye },
];

export default function ResumeEditorShell({
  children,
  resumeId,
  userName,
}: ResumeEditorShellProps) {
  const pathname = usePathname();

  // Determine the current step index
  const currentStepIndex = RESUME_STEPS.findIndex((step) =>
    pathname.endsWith(`/${step.path}`)
  );

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar userName={userName} showDashboardLink />

      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 py-6 gap-6">
        {/* ── Sidebar Steps Navigator ── */}
        <aside className="w-56 shrink-0 hidden lg:block">
          <div className="sticky top-24 bg-slate-900/40 border border-slate-800/60 rounded-2xl p-4 backdrop-blur-md">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-1">
              Build Steps
            </p>
            <nav className="flex flex-col gap-1">
              {RESUME_STEPS.map((step, index) => {
                const Icon = step.icon;
                const href = `/resume/${resumeId}/${step.path}`;
                const isActive    = index === currentStepIndex;
                const isCompleted = index < currentStepIndex;

                return (
                  <Link
                    key={step.path}
                    href={href}
                    className={[
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                      isActive
                        ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-blue-300 border border-blue-500/20"
                        : isCompleted
                        ? "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                        : "text-slate-600 hover:bg-slate-800/30 hover:text-slate-400",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "h-6 w-6 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                        isActive
                          ? "bg-blue-500/20 text-blue-400"
                          : isCompleted
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-slate-800 text-slate-600",
                      ].join(" ")}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <Icon className="h-3.5 w-3.5" />
                      )}
                    </span>
                    <span className="truncate text-xs">{step.label}</span>
                    {isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Step counter */}
            <div className="mt-5 pt-4 border-t border-slate-800/60">
              <div className="flex justify-between text-[10px] text-slate-500 mb-2">
                <span>Progress</span>
                <span>
                  {Math.max(0, currentStepIndex)} / {RESUME_STEPS.length - 1}
                </span>
              </div>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                  style={{
                    width: `${(Math.max(0, currentStepIndex) / (RESUME_STEPS.length - 1)) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </aside>

        {/* ── Mobile Step Pills (visible on small screens) ── */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 px-4 py-2 flex gap-1 overflow-x-auto no-scrollbar">
          {RESUME_STEPS.map((step, index) => {
            const Icon = step.icon;
            const href = `/resume/${resumeId}/${step.path}`;
            const isActive    = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;

            return (
              <Link
                key={step.path}
                href={href}
                className={[
                  "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl shrink-0 text-[10px] font-medium transition-colors",
                  isActive
                    ? "text-blue-400 bg-blue-500/10"
                    : isCompleted
                    ? "text-emerald-400"
                    : "text-slate-600",
                ].join(" ")}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
                {step.shortLabel}
              </Link>
            );
          })}
        </div>

        {/* ── Main Content Area ── */}
        <main className="flex-1 min-w-0 pb-20 lg:pb-0 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
