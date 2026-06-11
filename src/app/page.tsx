import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, FileText, Zap, Award } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-x-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Navigation */}
      <header className="border-b border-slate-900/60 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20">
              R
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              AI Resume Builder
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-sm font-semibold text-slate-400 hover:text-slate-200 transition"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-xl text-sm font-semibold transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center flex flex-col items-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6 animate-pulse">
          <Sparkles className="h-3.5 w-3.5" /> Powered by Gemini 1.5 Flash
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-none text-white max-w-3xl">
          Create a Job-Winning Resume in Minutes with{" "}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            AI Assistant
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg text-slate-400 max-w-xl leading-relaxed">
          Unlock your dream career. Generate tailored professional summaries, optimize skills, format experience, and check your ATS compatibility instantly.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md">
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all duration-200"
          >
            Build My Resume
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/auth/register"
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-8 py-4 rounded-2xl font-bold transition"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-900">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-12">
          Engineered for Modern Job Seekers
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md flex flex-col gap-4">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-lg text-slate-200">AI-Powered Generation</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Auto-generate custom skills list, experience descriptions, and summaries customized to your dream target role.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md flex flex-col gap-4">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-lg text-slate-200">ATS Analyzer Tool</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Analyze your resume text directly against Applicant Tracking Systems to secure high scores and pass automatic recruiter filters.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md flex flex-col gap-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-lg text-slate-200">Clean PDF Exports</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Apply a clean typography layout designed for print margins. Save as a standard single-page A4 resume PDF with one click.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 mt-auto py-8 bg-slate-950/60">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-slate-800 flex items-center justify-center font-bold text-[10px] text-white">
              R
            </div>
            <span>© {new Date().getFullYear()} AI Resume Builder. All rights reserved.</span>
          </div>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span>&middot;</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span>&middot;</span>
            <span className="hover:text-slate-400 cursor-pointer">Mentor System</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
