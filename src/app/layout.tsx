import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

/**
 * Root Layout — wraps every page in the app.
 *
 * Lesson: Next.js App Router uses layouts for shared structure.
 * This file is the outermost wrapper — it's the only place we load fonts
 * and set global metadata. Every page automatically inherits this.
 *
 * We switched from Geist to Inter because Inter is the industry standard
 * for SaaS and productivity apps — it's what Notion, Linear, and Vercel use.
 */

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Resume Builder — Create Job-Winning Resumes with Gemini AI",
  description:
    "Build ATS-optimized, professional resumes in minutes using AI. Generate summaries, skills, and experience descriptions tailored to your dream role.",
  keywords: ["resume builder", "AI resume", "ATS resume", "Gemini AI", "career"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}
