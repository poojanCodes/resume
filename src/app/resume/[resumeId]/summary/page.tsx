"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Save,
  Loader2,
  AlertCircle,
  FileText,
  Check,
  RefreshCw,
  Wand2
} from "lucide-react";
import Link from "next/link";

export default function ResumeSummaryPage() {
  const params = useParams();
  const router = useRouter();
  const resumeId = params?.resumeId as string;

  // Form states
  const [summary, setSummary] = useState("");
  
  // AI assist states
  const [experienceLevel, setExperienceLevel] = useState("mid");
  const [jobTitle, setJobTitle] = useState("");
  const [skills, setSkills] = useState("");
  
  // Suggestion state
  const [aiSuggestion, setAiSuggestion] = useState("");

  // Loading & status states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [improving, setImproving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load resume data
  useEffect(() => {
    if (!resumeId) return;

    const fetchResumeData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`/api/resumes/${resumeId}`);
        if (res.data.success && res.data.data) {
          const resume = res.data.data;
          setSummary(resume.summary || "");
          setJobTitle(resume.title || "");
          if (resume.skills && Array.isArray(resume.skills)) {
            setSkills(resume.skills.join(", "));
          }
        } else {
          setError(res.data.message || "Failed to load resume details.");
        }
      } catch (err: any) {
        console.error("Error fetching resume data:", err);
        setError("Failed to connect to the server. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchResumeData();
  }, [resumeId]);

  // Word count helper
  const getWordCount = (text: string) => {
    if (!text.trim()) return 0;
    return text.trim().split(/\s+/).length;
  };

  const wordCount = getWordCount(summary);
  const isWordCountOptimal = wordCount >= 50 && wordCount <= 80;

  // Save changes to db
  const handleSave = async (silent = false) => {
    try {
      if (!silent) setSaving(true);
      setError(null);
      if (!silent) setSuccess(null);

      const res = await axios.patch(`/api/resumes/${resumeId}`, {
        summary: summary,
        title: jobTitle, // Keep job title synchronized
      });

      if (res.data.success) {
        if (!silent) {
          setSuccess("Summary saved successfully!");
          setTimeout(() => setSuccess(null), 3000);
        }
        return true;
      } else {
        setError(res.data.message || "Failed to save summary.");
        return false;
      }
    } catch (err: any) {
      console.error("Error saving resume summary:", err);
      setError("An error occurred while saving your summary.");
      return false;
    } finally {
      if (!silent) setSaving(false);
    }
  };

  // Generate summary with AI
  const handleGenerateSummary = async () => {
    if (!jobTitle.trim()) {
      setError("Please provide a job title for the AI to tailor your summary.");
      return;
    }
    if (!skills.trim()) {
      setError("Please add at least a few skills so the AI can build a relevant summary.");
      return;
    }

    try {
      setGenerating(true);
      setError(null);
      setSuccess(null);
      setAiSuggestion("");

      const skillsArray = skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const res = await axios.post("/api/ai/generate-summary", {
        jobTitle,
        skills: skillsArray,
        experienceLevel,
      });

      if (res.data.success && res.data.data?.summary) {
        setAiSuggestion(res.data.data.summary);
        setSuccess("AI generated a customized summary recommendation!");
      } else {
        setError(res.data.message || "AI was unable to generate a summary.");
      }
    } catch (err: any) {
      console.error("AI summary generation error:", err);
      setError("Could not generate summary. Please check your network and try again.");
    } finally {
      setGenerating(false);
    }
  };

  // Improve content with AI
  const handleImproveSummary = async () => {
    if (!summary.trim()) {
      setError("Write a draft first, then click 'Polish with AI' to improve it.");
      return;
    }

    try {
      setImproving(true);
      setError(null);
      setSuccess(null);
      setAiSuggestion("");

      const res = await axios.post("/api/ai/improved-content", {
        content: summary,
      });

      if (res.data.success && res.data.data?.improvedContent) {
        let text = res.data.data.improvedContent;
        // The API returns improvedContent which could be wrapped in a JSON string
        try {
          const parsed = JSON.parse(text);
          if (parsed && parsed.improvedContent) {
            text = parsed.improvedContent;
          }
        } catch (e) {
          // Keep raw string if it's already plain text
        }
        setAiSuggestion(text);
        setSuccess("AI polished and improved your draft!");
      } else {
        setError(res.data.message || "AI was unable to polish the summary.");
      }
    } catch (err: any) {
      console.error("AI polish error:", err);
      setError("Could not polish summary. Please check your network and try again.");
    } finally {
      setImproving(false);
    }
  };

  const applyAiSuggestion = () => {
    if (aiSuggestion) {
      setSummary(aiSuggestion);
      setAiSuggestion("");
      setSuccess("Applied AI suggestion to editor.");
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleNext = async () => {
    const saved = await handleSave(true);
    if (saved) {
      router.push(`/resume/${resumeId}/preview`);
    }
  };

  const steps = [
    { name: "Personal Info", path: "personal-info" },
    { name: "Education", path: "education" },
    { name: "Skills", path: "skills" },
    { name: "Projects", path: "projects" },
    { name: "Experience", path: "experience" },
    { name: "Achievements", path: "achievements" },
    { name: "Summary", path: "summary", active: true },
    { name: "Preview", path: "preview" },
  ];

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-900 text-white">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        <p className="mt-4 text-slate-400 font-medium">Loading your resume data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-955 text-slate-100 flex flex-col md:flex-row font-sans">
      {/* Sidebar - Stepper Navigation */}
      <aside className="w-full md:w-64 bg-slate-900/50 border-r border-slate-800 p-6 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-8">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20">
              R
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              AI Resume Builder
            </span>
          </div>

          <nav className="space-y-1">
            {steps.map((step, idx) => {
              const isActive = step.active;
              const isPast = idx < 6; // Personal Info to Achievements are completed
              return (
                <div
                  key={step.path}
                  onClick={() => {
                    if (isPast || isActive) {
                      router.push(`/resume/${resumeId}/${step.path}`);
                    }
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : isPast
                      ? "text-slate-300 hover:bg-slate-800/50"
                      : "text-slate-600 cursor-not-allowed"
                  }`}
                >
                  <span
                    className={`h-5 w-5 rounded-full flex items-center justify-center text-xs font-semibold ${
                      isActive
                        ? "bg-white text-blue-600"
                        : isPast
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-slate-800 text-slate-500"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span>{step.name}</span>
                </div>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800 text-xs text-slate-500">
          Mentor Dashboard &middot; AI Module
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 max-w-4xl mx-auto p-4 md:p-8 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Professional Summary
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Step 7 of 8: Pitch yourself to recruiters with a compelling introduction.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSave()}
              disabled={saving}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-sm font-semibold transition border border-slate-700 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Progress
            </button>

            <Link
              href={`/resume/${resumeId}/achievements`}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 px-3 py-2 rounded-xl text-sm font-semibold transition border border-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </div>
        </div>

        {/* Dynamic Alerts */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-3 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Error:</span> {error}
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-start gap-3 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <Check className="h-5 w-5 shrink-0 mt-0.5 text-emerald-400" />
            <div>{success}</div>
          </div>
        )}

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Block: Editor */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md">
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-400" />
                  Your Professional Summary
                </label>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium transition ${
                    isWordCountOptimal
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : wordCount > 0
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      : "bg-slate-800 text-slate-500"
                  }`}
                >
                  {wordCount} words {isWordCountOptimal ? "(Optimal)" : "(Aim for 50-80)"}
                </span>
              </div>

              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Ex: Passionate Front-end Developer with 3+ years of experience building responsive web applications using React, TypeScript, and Tailwind CSS. Proven track record of improving performance and writing clean, maintainable code..."
                className="w-full min-h-[240px] bg-slate-950 border border-slate-800 rounded-2xl p-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-base leading-relaxed transition resize-y"
              />

              <div className="mt-4 flex flex-wrap gap-3 justify-between items-center">
                <span className="text-xs text-slate-500">
                  Write your summary or use the AI tools on the right to draft one.
                </span>

                <button
                  onClick={handleImproveSummary}
                  disabled={improving || !summary.trim()}
                  className="flex items-center gap-2 text-xs bg-slate-800/80 hover:bg-slate-700 text-indigo-400 border border-slate-700/80 px-3 py-1.5 rounded-lg font-semibold transition disabled:opacity-50 cursor-pointer"
                >
                  {improving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Wand2 className="h-3.5 w-3.5" />
                  )}
                  Polish with AI
                </button>
              </div>
            </div>
          </div>

          {/* Right Block: AI Assistant */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-gradient-to-b from-indigo-950/20 to-slate-900/40 border border-indigo-500/10 rounded-3xl p-6 shadow-xl backdrop-blur-md flex flex-col gap-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Sparkles className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-200">AI Summary Writer</h3>
                  <p className="text-slate-500 text-xs">Generate optimized descriptions in seconds</p>
                </div>
              </div>

              {/* Job Title input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Target Job Title</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              {/* Skills input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Key Skills (comma separated)</label>
                <textarea
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="React, Next.js, TypeScript, Tailwind, CSS"
                  rows={2}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition resize-none"
                />
              </div>

              {/* Experience Level */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Experience Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {["entry", "mid", "senior"].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setExperienceLevel(level)}
                      className={`py-2 px-1 rounded-xl text-xs font-semibold uppercase tracking-wider border transition cursor-pointer ${
                        experienceLevel === level
                          ? "bg-indigo-600/25 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-600/5"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300 hover:bg-slate-900/50"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateSummary}
                disabled={generating}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/25 transition-all duration-200 disabled:opacity-50 cursor-pointer mt-2"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    Drafting Resume Summary...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-indigo-200" />
                    Generate AI Draft
                  </>
                )}
              </button>
            </div>

            {/* AI Suggestion Box */}
            {aiSuggestion && (
              <div className="bg-emerald-950/10 border border-emerald-500/20 rounded-3xl p-5 shadow-xl animate-in zoom-in-95 duration-200 flex flex-col gap-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI Suggested Summary
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed italic bg-slate-950/40 rounded-xl p-3 border border-slate-900">
                  &ldquo;{aiSuggestion}&rdquo;
                </p>
                <div className="flex gap-2.5 mt-1">
                  <button
                    onClick={applyAiSuggestion}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 px-3 rounded-lg shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="h-3.5 w-3.5" /> Use This Summary
                  </button>
                  <button
                    onClick={() => setAiSuggestion("")}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-300 text-xs font-semibold py-2 px-3 rounded-lg border border-slate-700 transition cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex justify-between items-center mt-12 pt-6 border-t border-slate-800/80">
          <Link
            href={`/resume/${resumeId}/achievements`}
            className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-200 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Step 6: Achievements
          </Link>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/10 hover:shadow-blue-500/25 transition cursor-pointer"
          >
            Save & Continue
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </main>
    </div>
  );
}
