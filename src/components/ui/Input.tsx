import React from "react";

/**
 * Input component — labelled text input with optional icon, error state,
 * and helper text.
 *
 * Lesson: Inputs need consistent padding, focus rings, and error styles.
 * Wrapping them in a component means you never forget the focus outline
 * or the error border — it's baked in.
 */

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?:    string;
  error?:    string;
  hint?:     string;
  icon?:     React.ReactNode;
  /** Put content on the right side (e.g. show/hide password button) */
  rightSlot?: React.ReactNode;
}

export default function Input({
  label,
  error,
  hint,
  icon,
  rightSlot,
  id,
  className = "",
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-slate-400 tracking-wide"
        >
          {label}
          {props.required && (
            <span className="text-blue-400 ml-0.5">*</span>
          )}
        </label>
      )}

      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={[
            "w-full bg-slate-900/60 border rounded-xl py-2.5 text-sm text-slate-200 placeholder-slate-600",
            "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/60 transition-all duration-200",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            icon ? "pl-10" : "pl-4",
            rightSlot ? "pr-12" : "pr-4",
            error
              ? "border-red-500/50 focus:border-red-500/60 focus:ring-red-500/30"
              : "border-slate-700/80 hover:border-slate-600",
            className,
          ].join(" ")}
          {...props}
        />
        {rightSlot && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightSlot}
          </span>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-400 mt-0.5 flex items-center gap-1">
          <span className="inline-block h-1 w-1 rounded-full bg-red-400 shrink-0" />
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-slate-500 mt-0.5">{hint}</p>
      )}
    </div>
  );
}
