"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  CheckCircle2,
  FileDown,
  ArrowLeft,
  LayoutDashboard,
  Printer,
  Sparkles,
  Info,
  Loader2,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

export default function ResumeDownloadPage() {
  const params = useParams();
  const router = useRouter();
  const resumeId = params?.resumeId as string;

  const [loading, setLoading] = useState(true);
  const [resumeTitle, setResumeTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!resumeId) return;

    const fetchResumeTitle = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`/api/resumes/${resumeId}`);
        if (res.data.success && res.data.data) {
          setResumeTitle(res.data.data.title || res.data.data.personalInfo?.fullname || "My Resume");
        } else {
          setError(res.data.message || "Failed to load resume details.");
        }
      } catch (err: any) {
        console.error("Error fetching resume title:", err);
        setError("Failed to fetch resume details.");
      } finally {
        setLoading(false);
      }
    };

    fetchResumeTitle();
  }, [resumeId]);

  const handlePrint = () => {
    // Navigate back to preview and open print dialog
    router.push(`/resume/${resumeId}/preview`);
    setTimeout(() => {
      window.print();
    }, 800);
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-900 text-white">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        <p className="mt-4 text-slate-400 font-medium">Preparing download options...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 md:p-8 font-sans">
      <div className="max-w-xl w-full bg-slate-900/40 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-md flex flex-col items-center text-center">
        {/* Success Icon */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse"></div>
          <CheckCircle2 className="h-20 w-20 text-emerald-400 relative z-10" />
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Resume Completed!
        </h1>
        <p className="text-slate-400 text-sm mt-2 max-w-md">
          Congratulations! Your AI-optimized professional resume is ready. Download it now to kickstart your job search.
        </p>

        {resumeTitle && (
          <div className="mt-4 px-4 py-2 bg-slate-950/60 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400">
            Active Profile: <span className="text-blue-400">{resumeTitle}</span>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tips section */}
        <div className="mt-8 w-full bg-slate-950/40 border border-slate-800/60 rounded-2xl p-5 text-left flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Info className="h-4 w-4 text-blue-400" /> Print / PDF Saving Tips:
          </h3>
          <ul className="space-y-2 text-xs text-slate-400 leading-normal">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">•</span>
              <span>Select <strong>"Save as PDF"</strong> as the destination in the print pop-up.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">•</span>
              <span>Set page size to <strong>A4</strong> or <strong>Letter</strong> (depending on your locale).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">•</span>
              <span>Check <strong>"Background graphics"</strong> to preserve colored highlights.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">•</span>
              <span>Set margins to <strong>None</strong> or <strong>Default</strong> for clean border scaling.</span>
            </li>
          </ul>
        </div>

        {/* Primary Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition cursor-pointer"
          >
            <Printer className="h-4.5 w-4.5" />
            Print / Save PDF
          </button>
          
          <Link
            href={`/resume/${resumeId}/preview`}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 py-3.5 rounded-xl font-bold border border-slate-700 transition"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
            Review Preview
          </Link>
        </div>

        {/* Secondary Navigation */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 w-full flex items-center justify-center gap-6 text-sm">
          <Link
            href="/dashboard"
            className="text-slate-400 hover:text-slate-200 transition flex items-center gap-1.5"
          >
            <LayoutDashboard className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <span className="text-slate-800">|</span>
          <button
            onClick={() => router.push(`/resume/${resumeId}/summary`)}
            className="text-slate-400 hover:text-slate-200 transition flex items-center gap-1.5 bg-transparent border-none p-0 cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-indigo-400" />
            Edit Summary
          </button>
        </div>
      </div>
    </div>
  );
}
