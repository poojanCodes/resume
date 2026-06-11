import React from "react";
import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";

/**
 * Alert component — for error, success, warning, and info messages.
 *
 * Lesson: Alerts need consistent structure (icon + message). By building
 * this once, we can show user feedback anywhere in the app with a single
 * prop change: <Alert type="error" message="..." />
 */

type AlertType = "error" | "success" | "warning" | "info";

interface AlertProps {
  type:      AlertType;
  message:   string;
  className?: string;
}

const alertConfig: Record<AlertType, {
  icon: React.ElementType;
  classes: string;
}> = {
  error: {
    icon: AlertCircle,
    classes: "bg-red-500/10 border-red-500/20 text-red-400",
  },
  success: {
    icon: CheckCircle,
    classes: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  },
  warning: {
    icon: AlertTriangle,
    classes: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  },
  info: {
    icon: Info,
    classes: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  },
};

export default function Alert({ type, message, className = "" }: AlertProps) {
  const { icon: Icon, classes } = alertConfig[type];

  return (
    <div
      className={[
        "flex items-start gap-3 rounded-xl border p-4 text-sm animate-fade-in",
        classes,
        className,
      ].join(" ")}
      role="alert"
    >
      <Icon className="h-4 w-4 shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}
