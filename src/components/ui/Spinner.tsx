import React from "react";
import { Loader2 } from "lucide-react";

/**
 * Spinner + full-page loading screen component.
 *
 * Two modes:
 * 1. <Spinner />           — inline spinner icon
 * 2. <Spinner fullPage />  — full screen centered overlay with message
 */

interface SpinnerProps {
  fullPage?: boolean;
  message?:  string;
  size?:     "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-10 w-10",
};

export default function Spinner({
  fullPage = false,
  message = "Loading...",
  size = "md",
}: SpinnerProps) {
  if (fullPage) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-950 gap-4">
        <div className="relative">
          <div className="h-14 w-14 rounded-full border-2 border-slate-800" />
          <Loader2 className="absolute inset-0 m-auto h-8 w-8 animate-spin text-blue-500" />
        </div>
        <p className="text-slate-400 text-sm font-medium animate-pulse">
          {message}
        </p>
      </div>
    );
  }

  return <Loader2 className={`animate-spin text-blue-400 ${sizeClasses[size]}`} />;
}
