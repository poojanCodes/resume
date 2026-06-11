import React from "react";

/**
 * Card component — consistent container for all panels, form sections, etc.
 *
 * Lesson: The "glass" effect (blur + transparent dark background + subtle border)
 * is what gives our app its modern look. By centralizing it here, every card in
 * the app looks identical with zero effort.
 */

interface CardProps {
  children:  React.ReactNode;
  className?: string;
  /** Apply the glassmorphism effect */
  glass?: boolean;
  /** Padding presets */
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingClasses = {
  none: "",
  sm:   "p-4",
  md:   "p-6",
  lg:   "p-8",
};

export default function Card({
  children,
  className = "",
  glass = true,
  padding = "md",
}: CardProps) {
  return (
    <div
      className={[
        "rounded-2xl border",
        glass
          ? "bg-slate-900/40 border-slate-800/80 backdrop-blur-md shadow-xl"
          : "bg-slate-900 border-slate-800 shadow-lg",
        paddingClasses[padding],
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
