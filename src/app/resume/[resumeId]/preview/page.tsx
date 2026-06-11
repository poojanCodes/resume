"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  Sparkles,
  ArrowLeft,
  Download,
  Loader2,
  AlertCircle,
  Check,
  TrendingUp,
  FileCheck,
  ShieldCheck,
  Printer,
  RefreshCw
} from "lucide-react";
import Link from "next/link";

interface ResumeData {
  title?: string;
  summary?: string;
  personalInfo?: {
    fullname?: string;
    email?: string;
    mobile?: string;
    location?: string;
    github?: string;
    linkedIn?: string;
    portfolio?: string;
  };
  skills?: string[];
  education?: Array<{
    institute?: string;
    degree?: string;
    startDate?: string;
    endDate?: string;
  }>;
  workExperience?: Array<{
    company?: string;
    position?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;
  projects?: Array<{
    title?: string;
    description?: string;
    githubUrl?: string;
    liveUrl?: string;
    techStack?: string[];
  }>;
  certification?: string[];
}

interface AtsScoreResult {
  atsScore: number;
  strengths: string[];
  improvements: string[];
}

export default function ResumePreviewPage() {
  const params = useParams();
  const router = useRouter();
  const resumeId = params?.resumeId as string;

  // Data states
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [atsResult, setAtsResult] = useState<AtsScoreResult | null>(null);

  // Status states
  const [loading, setLoading] = useState(true);
  const [checkingAts, setCheckingAts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch resume data
  useEffect(() => {
    if (!resumeId) return;

    const fetchResume = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`/api/resumes/${resumeId}`);
        if (res.data.success && res.data.data) {
          setResume(res.data.data);
        } else {
          setError(res.data.message || "Failed to retrieve resume details.");
        }
      } catch (err: any) {
        console.error("Error fetching resume:", err);
        setError("Unable to connect to the server. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
  }, [resumeId]);

  // Generate plain text version of resume for ATS check
  const getResumePlainText = (data: ResumeData): string => {
    let text = "";

    if (data.personalInfo) {
      text += `NAME: ${data.personalInfo.fullname || ""}\n`;
      text += `CONTACT: ${data.personalInfo.email || ""} | ${data.personalInfo.mobile || ""} | ${data.personalInfo.location || ""}\n`;
      if (data.personalInfo.github) text += `Github: ${data.personalInfo.github}\n`;
      if (data.personalInfo.linkedIn) text += `LinkedIn: ${data.personalInfo.linkedIn}\n`;
      if (data.personalInfo.portfolio) text += `Portfolio: ${data.personalInfo.portfolio}\n`;
    }

    if (data.title) {
      text += `TARGET ROLE: ${data.title}\n`;
    }

    if (data.summary) {
      text += `SUMMARY:\n${data.summary}\n`;
    }

    if (data.skills && data.skills.length > 0) {
      text += `SKILLS: ${data.skills.join(", ")}\n`;
    }

    if (data.workExperience && data.workExperience.length > 0) {
      text += `WORK EXPERIENCE:\n`;
      data.workExperience.forEach((exp) => {
        text += `- ${exp.position} at ${exp.company} (${exp.startDate} - ${exp.endDate})\n`;
        text += `  Description: ${exp.description}\n`;
      });
    }

    if (data.projects && data.projects.length > 0) {
      text += `PROJECTS:\n`;
      data.projects.forEach((proj) => {
        text += `- ${proj.title} | Tech Stack: ${(proj.techStack || []).join(", ")}\n`;
        text += `  Description: ${proj.description}\n`;
      });
    }

    if (data.education && data.education.length > 0) {
      text += `EDUCATION:\n`;
      data.education.forEach((edu) => {
        text += `- ${edu.degree} from ${edu.institute} (${edu.startDate} - ${edu.endDate})\n`;
      });
    }

    if (data.certification && data.certification.length > 0) {
      text += `CERTIFICATIONS & ACHIEVEMENTS: ${data.certification.join(", ")}\n`;
    }

    return text;
  };

  // Run ATS Check via Gemini
  const checkAtsScore = async () => {
    if (!resume) return;

    try {
      setCheckingAts(true);
      setError(null);
      setSuccess(null);

      const resumeText = getResumePlainText(resume);

      const res = await axios.post("/api/ai/ats-score", {
        resumeText,
      });

      if (res.data.success && res.data.data?.scoreData) {
        setAtsResult(res.data.data.scoreData);
        setSuccess("ATS evaluation complete! View suggestions below.");
      } else {
        setError(res.data.message || "Failed to calculate ATS score.");
      }
    } catch (err: any) {
      console.error("ATS score error:", err);
      setError("An error occurred while analyzing the resume ATS compatibility.");
    } finally {
      setCheckingAts(false);
    }
  };

  // Trigger Print Dialog
  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-900 text-white">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        <p className="mt-4 text-slate-400 font-medium">Aggregating resume details...</p>
      </div>
    );
  }

  if (error && !resume) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-900 text-white p-4">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <p className="text-xl font-bold">Error Loading Resume</p>
        <p className="text-slate-400 mt-2 max-w-md text-center">{error}</p>
        <Link
          href="/dashboard"
          className="mt-6 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans print:bg-white print:text-black">
      {/* Header - Hidden in Print */}
      <header className="bg-slate-900/80 border-b border-slate-800 p-4 sticky top-0 z-40 backdrop-blur-md flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href={`/resume/${resumeId}/summary`}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Back to Summary"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-bold text-lg bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              {resume?.personalInfo?.fullname || "Untitled Resume"}
            </h1>
            <p className="text-slate-500 text-xs">Preview & Optimization Stage</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={checkAtsScore}
            disabled={checkingAts}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/10 transition disabled:opacity-50 cursor-pointer"
          >
            {checkingAts ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-indigo-200" />
                Analyze ATS Score
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/10 transition cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            Print / Save PDF
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row print:block">
        {/* Left Side: Resume Document Sheet */}
        <div className="flex-1 p-4 md:p-8 flex justify-center bg-slate-900/30 print:bg-white print:p-0">
          <div
            id="resume-document"
            className="w-full max-w-[800px] bg-white text-slate-900 p-8 md:p-12 shadow-2xl rounded-none border border-slate-200 min-h-[1050px] flex flex-col justify-between font-sans print:shadow-none print:border-none print:p-0 print:my-0"
          >
            <div>
              {/* Personal Details Header */}
              <div className="text-center pb-6 border-b-2 border-slate-900">
                <h2 className="text-3xl font-bold tracking-tight uppercase text-slate-900">
                  {resume?.personalInfo?.fullname || "Full Name"}
                </h2>
                {resume?.title && (
                  <p className="text-lg font-semibold text-blue-800 uppercase tracking-wider mt-1.5">
                    {resume.title}
                  </p>
                )}

                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-3.5 text-sm text-slate-600 font-medium">
                  {resume?.personalInfo?.email && (
                    <span>{resume.personalInfo.email}</span>
                  )}
                  {resume?.personalInfo?.mobile && (
                    <>
                      <span className="text-slate-400">•</span>
                      <span>{resume.personalInfo.mobile}</span>
                    </>
                  )}
                  {resume?.personalInfo?.location && (
                    <>
                      <span className="text-slate-400">•</span>
                      <span>{resume.personalInfo.location}</span>
                    </>
                  )}
                </div>

                {/* Social Links */}
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2 text-xs text-blue-600 font-semibold">
                  {resume?.personalInfo?.github && (
                    <a
                      href={resume.personalInfo.github}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      GitHub
                    </a>
                  )}
                  {resume?.personalInfo?.linkedIn && (
                    <a
                      href={resume.personalInfo.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      LinkedIn
                    </a>
                  )}
                  {resume?.personalInfo?.portfolio && (
                    <a
                      href={resume.personalInfo.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Portfolio
                    </a>
                  )}
                </div>
              </div>

              {/* Summary Section */}
              {resume?.summary && (
                <div className="mt-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1.5 mb-2.5">
                    Professional Summary
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed font-normal">
                    {resume.summary}
                  </p>
                </div>
              )}

              {/* Experience Section */}
              {resume?.workExperience && resume.workExperience.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1.5 mb-3">
                    Work Experience
                  </h3>
                  <div className="space-y-4">
                    {resume.workExperience.map((exp, idx) => (
                      <div key={idx} className="group">
                        <div className="flex justify-between items-start text-sm">
                          <h4 className="font-bold text-slate-800">
                            {exp.position} &middot;{" "}
                            <span className="text-slate-500 font-medium">
                              {exp.company}
                            </span>
                          </h4>
                          <span className="text-xs text-slate-500 font-medium shrink-0 ml-4">
                            {exp.startDate} – {exp.endDate || "Present"}
                          </span>
                        </div>
                        {exp.description && (
                          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed whitespace-pre-line font-normal">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects Section */}
              {resume?.projects && resume.projects.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1.5 mb-3">
                    Projects
                  </h3>
                  <div className="space-y-4">
                    {resume.projects.map((proj, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between items-start text-sm">
                          <h4 className="font-bold text-slate-800">
                            {proj.title}
                            {proj.techStack && proj.techStack.length > 0 && (
                              <span className="text-slate-500 text-xs font-medium ml-2">
                                ({proj.techStack.join(", ")})
                              </span>
                            )}
                          </h4>
                          <div className="flex gap-2.5 text-xs text-blue-600 font-semibold shrink-0 ml-4">
                            {proj.githubUrl && (
                              <a
                                href={proj.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Source
                              </a>
                            )}
                            {proj.liveUrl && (
                              <a
                                href={proj.liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Live Demo
                              </a>
                            )}
                          </div>
                        </div>
                        {proj.description && (
                          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-normal">
                            {proj.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills Section */}
              {resume?.skills && resume.skills.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1.5 mb-2.5">
                    Skills
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {resume.skills.join(", ")}
                  </p>
                </div>
              )}

              {/* Education Section */}
              {resume?.education && resume.education.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1.5 mb-3">
                    Education
                  </h3>
                  <div className="space-y-2.5">
                    {resume.education.map((edu, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-start text-sm"
                      >
                        <div>
                          <h4 className="font-bold text-slate-800">
                            {edu.degree}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium">
                            {edu.institute}
                          </p>
                        </div>
                        <span className="text-xs text-slate-500 font-medium shrink-0 ml-4">
                          {edu.startDate} – {edu.endDate}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications & Achievements Section */}
              {resume?.certification && resume.certification.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1.5 mb-2.5">
                    Certifications & Achievements
                  </h3>
                  <ul className="list-disc list-inside text-xs text-slate-700 space-y-1 font-medium">
                    {resume.certification.map((cert, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {cert}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="text-center text-[10px] text-slate-400 mt-12 border-t border-slate-100 pt-4 print:hidden">
              Page 1 of 1 &middot; Generated with AI Resume Builder
            </div>
          </div>
        </div>

        {/* Right Side: ATS Evaluation Panel - Hidden in Print */}
        <aside className="w-full lg:w-96 bg-slate-900/50 border-l border-slate-800 p-6 flex flex-col gap-6 shrink-0 print:hidden lg:sticky lg:top-[73px] lg:h-[calc(100vh-73px)] overflow-y-auto">
          {/* Main Actions */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 flex flex-col gap-4">
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <Download className="h-4 w-4 text-emerald-400" /> Export Options
            </h3>
            <p className="text-slate-400 text-xs">
              Save your resume as a clean, industry-standard PDF document.
            </p>

            <button
              onClick={handlePrint}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/25 transition cursor-pointer"
            >
              <Printer className="h-4.5 w-4.5" /> Print / Save as PDF
            </button>
          </div>

          {/* ATS Analyzer Section */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-indigo-400" /> ATS compatibility
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/10">
                Gemini AI
              </span>
            </div>

            {!atsResult ? (
              <div className="text-center py-6 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-4">
                <Sparkles className="h-8 w-8 text-indigo-400/60 mb-2.5 animate-pulse" />
                <p className="text-slate-300 font-semibold text-xs">Check ATS Viability</p>
                <p className="text-slate-500 text-[10px] mt-1 mb-4 max-w-[200px]">
                  Analyze keyword density, layout, formatting, and get scoring report.
                </p>
                <button
                  onClick={checkAtsScore}
                  disabled={checkingAts}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 px-4 rounded-xl shadow transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {checkingAts ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" /> Analyze Resume
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4 animate-in fade-in duration-300">
                {/* Gauge chart */}
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 flex items-center justify-center shrink-0">
                    <svg className="absolute h-full w-full transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="#1e293b"
                        strokeWidth="5"
                        fill="transparent"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke={atsResult.atsScore >= 70 ? "#10b981" : "#f59e0b"}
                        strokeWidth="5"
                        fill="transparent"
                        strokeDasharray={175.9}
                        strokeDashoffset={175.9 - (175.9 * atsResult.atsScore) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <span className="text-base font-bold text-slate-100">
                      {atsResult.atsScore}%
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-200 text-xs">ATS Match Score</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {atsResult.atsScore >= 75
                        ? "Excellent rating! Strong keyword optimization."
                        : "Good, but can be improved with target keywords."}
                    </p>
                  </div>
                </div>

                {/* Strengths */}
                {atsResult.strengths && atsResult.strengths.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <h5 className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                      <Check className="h-3 w-3" /> Key Strengths
                    </h5>
                    <ul className="space-y-1">
                      {atsResult.strengths.map((str, i) => (
                        <li
                          key={i}
                          className="text-[11px] text-slate-300 flex items-start gap-1.5 leading-normal"
                        >
                          <span className="text-emerald-500 mt-0.5">•</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Improvements */}
                {atsResult.improvements && atsResult.improvements.length > 0 && (
                  <div className="flex flex-col gap-1.5 border-t border-slate-800 pt-3">
                    <h5 className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" /> Recommended Enhancements
                    </h5>
                    <ul className="space-y-1">
                      {atsResult.improvements.map((imp, i) => (
                        <li
                          key={i}
                          className="text-[11px] text-slate-300 flex items-start gap-1.5 leading-normal"
                        >
                          <span className="text-amber-500 mt-0.5">•</span>
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={checkAtsScore}
                  disabled={checkingAts}
                  className="w-full mt-1 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-[10px] py-1.5 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3" /> Recalculate Score
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Footer Navigation - Hidden in Print */}
      <footer className="bg-slate-900 border-t border-slate-800 p-4 flex justify-between items-center print:hidden">
        <Link
          href={`/resume/${resumeId}/summary`}
          className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-200 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Step 7: Summary
        </Link>
        <div className="text-xs text-slate-500 font-medium">
          Ready to export your resume!
        </div>
      </footer>
    </div>
  );
}
