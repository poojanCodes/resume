import React from "react";

/**
 * Textarea component — same design language as Input, but for multi-line text.
 * Used for descriptions, summaries, etc.
 */

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?:  string;
  error?:  string;
  hint?:   string;
}

export default function Textarea({
  label,
  error,
  hint,
  id,
  className = "",
  rows = 4,
  ...props
}: TextareaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={textareaId}
          className="text-xs font-semibold text-slate-400 tracking-wide"
        >
          {label}
          {props.required && (
            <span className="text-blue-400 ml-0.5">*</span>
          )}
        </label>
      )}

      <textarea
        id={textareaId}
        rows={rows}
        className={[
          "w-full bg-slate-900/60 border rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600",
          "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/60 transition-all duration-200",
          "disabled:opacity-50 disabled:cursor-not-allowed resize-none",
          error
            ? "border-red-500/50 focus:border-red-500/60 focus:ring-red-500/30"
            : "border-slate-700/80 hover:border-slate-600",
          className,
        ].join(" ")}
        {...props}
      />

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
