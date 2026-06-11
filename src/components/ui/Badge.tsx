import React from "react";

/**
 * Badge component — for skill tags, status indicators, labels.
 */

type BadgeVariant = "default" | "blue" | "indigo" | "emerald" | "amber" | "red";

interface BadgeProps {
  children:    React.ReactNode;
  variant?:    BadgeVariant;
  onRemove?:   () => void;
  className?:  string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-slate-800 border-slate-700 text-slate-300",
  blue:    "bg-blue-500/10 border-blue-500/20 text-blue-300",
  indigo:  "bg-indigo-500/10 border-indigo-500/20 text-indigo-300",
  emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
  amber:   "bg-amber-500/10 border-amber-500/20 text-amber-300",
  red:     "bg-red-500/10 border-red-500/20 text-red-300",
};

export default function Badge({
  children,
  variant = "default",
  onRemove,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border",
        variantClasses[variant],
        className,
      ].join(" ")}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 hover:opacity-70 transition-opacity cursor-pointer text-current"
          aria-label="Remove"
        >
          ×
        </button>
      )}
    </span>
  );
}
