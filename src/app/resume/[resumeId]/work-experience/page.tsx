"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Briefcase, Plus, Trash2, ArrowRight, Sparkles, ChevronDown, ChevronUp,
  Wand2,
} from "lucide-react";

import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import ResumeEditorShell from "@/components/layout/ResumeEditorShell";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Alert from "@/components/ui/Alert";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";

/**
 * WorkExperiencePage — Step 2 of the resume editor wizard.
 *
 * Key Concepts Taught Here:
 *
 * 1. DYNAMIC LIST PATTERN — Adding/removing entries from an array in state.
 *    Each entry is a WorkExperience object. We store them all in one
 *    `entries` array and use index-based updates.
 *
 * 2. ACCORDION PATTERN — Only one entry is expanded at a time (collapsedState).
 *    This keeps the page clean when you have multiple jobs.
 *
 * 3. AI INTEGRATION — Two AI features:
 *    a) "Generate Description" → POST /api/ai/generate-experience-description
 *       Sends: experienceLevel, jobRole, yearsOfExperience, techStack
 *       Returns: a bullet-point description
 *    b) "Improve" → POST /api/ai/improved-content
 *       Sends: the current description text
 *       Returns: an improved version
 *
 * 4. PER-ENTRY AI STATE — Each entry can independently be "loading AI".
 *    We track this with a `aiLoadingIndex` (which entry's AI is running).
 */

interface WorkEntry {
  company:     string;
  position:    string;
  startDate:   string;
  endDate:     string;
  description: string;
  // UI-only: for the AI modal inputs
  _aiJobTitle?:       string;
  _aiExpLevel?:       string;
  _aiYears?:          string;
  _aiTechStack?:      string;
}

const EMPTY_ENTRY: WorkEntry = {
  company:     "",
  position:    "",
  startDate:   "",
  endDate:     "",
  description: "",
  _aiJobTitle:  "",
  _aiExpLevel:  "mid",
  _aiYears:     "1",
  _aiTechStack: "",
};

const EXP_LEVELS = ["fresher", "junior", "mid", "senior", "lead"];

export default function WorkExperiencePage() {
  const params   = useParams();
  const router   = useRouter();
  const resumeId = params.resumeId as string;

  const { user, loading: authLoading } = useAuth();

  const [entries,        setEntries]        = useState<WorkEntry[]>([{ ...EMPTY_ENTRY }]);
  const [expandedIndex,  setExpandedIndex]  = useState<number>(0);
  const [loading,        setLoading]        = useState(true);
  const [saving,         setSaving]         = useState(false);
  const [error,          setError]          = useState<string | null>(null);
  const [saved,          setSaved]          = useState(false);
  const [aiLoadingIndex, setAiLoadingIndex] = useState<number | null>(null);
  const [aiImproveIdx,   setAiImproveIdx]   = useState<number | null>(null);
  const [showAiPanel,    setShowAiPanel]    = useState<number | null>(null);

  // ── Load existing data ───────────────────────────────────
  useEffect(() => {
    if (authLoading || !user) return;
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/resumes/${resumeId}`);
        if (res.data.success) {
          const work = res.data.data?.workExperience;
          if (work && work.length > 0) {
            setEntries(
              work.map((w: any) => ({
                ...EMPTY_ENTRY,
                ...w,
              }))
            );
          }
        }
      } catch {
        setError("Could not load existing work experience.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [resumeId, user, authLoading]);

  // ── Entry helpers ────────────────────────────────────────
  const updateEntry = (index: number, field: keyof WorkEntry, value: string) => {
    setEntries((prev) =>
      prev.map((e, i) => (i === index ? { ...e, [field]: value } : e))
    );
    if (saved) setSaved(false);
  };

  const addEntry = () => {
    setEntries((prev) => [...prev, { ...EMPTY_ENTRY }]);
    setExpandedIndex(entries.length); // expand the new one
  };

  const removeEntry = (index: number) => {
    if (entries.length === 1) {
      setEntries([{ ...EMPTY_ENTRY }]);
      return;
    }
    setEntries((prev) => prev.filter((_, i) => i !== index));
    setExpandedIndex(Math.max(0, expandedIndex - 1));
  };

  // ── AI: Generate Description ─────────────────────────────
  const handleGenerateDescription = async (index: number) => {
    const entry = entries[index];
    if (!entry._aiJobTitle?.trim() || !entry._aiExpLevel) {
      setError("Please fill in the Job Title and Experience Level for AI generation.");
      return;
    }
    try {
      setAiLoadingIndex(index);
      setError(null);
      const techStack = entry._aiTechStack
        ? entry._aiTechStack.split(",").map((t) => t.trim()).filter(Boolean)
        : [];

      const res = await api.post("/api/ai/generate-experience-description", {
        jobRole:           entry._aiJobTitle,
        experienceLevel:   entry._aiExpLevel,
        yearsOfExperience: Number(entry._aiYears) || 1,
        techStack,
      });

      if (res.data.success && res.data.data) {
        updateEntry(index, "description", res.data.data);
        setShowAiPanel(null);
      } else {
        setError("AI generation failed. Please try again.");
      }
    } catch {
      setError("AI generation failed. Please check your connection.");
    } finally {
      setAiLoadingIndex(null);
    }
  };

  // ── AI: Improve Content ──────────────────────────────────
  const handleImproveContent = async (index: number) => {
    const current = entries[index].description.trim();
    if (!current) {
      setError("Write a description first, then click Improve.");
      return;
    }
    try {
      setAiImproveIdx(index);
      setError(null);
      const res = await api.post("/api/ai/improved-content", { content: current });
      if (res.data.success && res.data.data) {
        updateEntry(index, "description", res.data.data);
      } else {
        setError("AI improvement failed. Please try again.");
      }
    } catch {
      setError("AI improvement failed.");
    } finally {
      setAiImproveIdx(null);
    }
  };

  // ── Save & Continue ──────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Strip UI-only fields before sending to backend
    const workExperience = entries
      .filter((e) => e.company.trim() || e.position.trim())
      .map(({ _aiJobTitle, _aiExpLevel, _aiYears, _aiTechStack, ...rest }) => rest);

    try {
      setSaving(true);
      const res = await api.put(`/api/resumes/${resumeId}`, { workExperience });
      if (res.data.success) {
        setSaved(true);
        setTimeout(() => router.push(`/resume/${resumeId}/education`), 600);
      } else {
        setError(res.data.message || "Failed to save.");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return <Spinner fullPage message="Loading work experience..." />;
  }

  return (
    <ResumeEditorShell resumeId={resumeId} userName={user?.name}>
      <div className="max-w-2xl mx-auto">

        {/* Step Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
              <Briefcase className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100">Work Experience</h1>
              <p className="text-slate-500 text-xs mt-0.5">Step 2 of 6 — Add your professional history</p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            icon={<Plus className="h-3.5 w-3.5" />}
            onClick={addEntry}
            type="button"
          >
            Add Job
          </Button>
        </div>

        {error && <Alert type="error"    message={error}                        className="mb-5" />}
        {saved  && <Alert type="success" message="Saved! Moving to Education..." className="mb-5" />}

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            {entries.map((entry, index) => {
              const isExpanded   = expandedIndex === index;
              const isGenerating = aiLoadingIndex === index;
              const isImproving  = aiImproveIdx   === index;
              const showPanel    = showAiPanel     === index;

              return (
                <div
                  key={index}
                  className="bg-slate-900/40 border border-slate-800/70 rounded-2xl overflow-hidden backdrop-blur-sm"
                >
                  {/* Entry Header / Accordion Toggle */}
                  <div
                    className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-800/20 transition-colors"
                    onClick={() => setExpandedIndex(isExpanded ? -1 : index)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-7 w-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-200 truncate">
                          {entry.position || "New Position"}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {entry.company || "Company Name"}
                          {entry.startDate && ` · ${entry.startDate}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {entries.length > 1 && (
                        <button
                          type="button"
                          onClick={(ev) => { ev.stopPropagation(); removeEntry(index); }}
                          className="p-1 rounded-lg text-red-500/60 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-slate-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-500" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Form Body */}
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-slate-800/50 pt-4 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Company Name"
                          placeholder="Google"
                          value={entry.company}
                          onChange={(e) => updateEntry(index, "company", e.target.value)}
                        />
                        <Input
                          label="Job Title / Position"
                          placeholder="Software Engineer"
                          value={entry.position}
                          onChange={(e) => updateEntry(index, "position", e.target.value)}
                        />
                        <Input
                          label="Start Date"
                          placeholder="Jan 2022"
                          value={entry.startDate}
                          onChange={(e) => updateEntry(index, "startDate", e.target.value)}
                        />
                        <Input
                          label="End Date"
                          placeholder="Dec 2023 or Present"
                          value={entry.endDate}
                          onChange={(e) => updateEntry(index, "endDate", e.target.value)}
                        />
                      </div>

                      {/* Description + AI Actions */}
                      <div>
                        <Textarea
                          label="Description / Responsibilities"
                          placeholder="Describe your key responsibilities, achievements, and impact..."
                          value={entry.description}
                          onChange={(e) => updateEntry(index, "description", e.target.value)}
                          rows={5}
                          hint="Use bullet points. Quantify impact where possible (e.g. 'improved load time by 40%')."
                        />

                        {/* AI Action Buttons */}
                        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => setShowAiPanel(showPanel ? null : index)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 px-3 py-1.5 rounded-lg transition cursor-pointer"
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            Generate with AI
                          </button>

                          <button
                            type="button"
                            onClick={() => handleImproveContent(index)}
                            disabled={isImproving}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/15 border border-purple-500/20 px-3 py-1.5 rounded-lg transition cursor-pointer disabled:opacity-50"
                          >
                            <Wand2 className="h-3.5 w-3.5" />
                            {isImproving ? "Improving..." : "Improve with AI"}
                          </button>
                        </div>

                        {/* AI Generation Panel */}
                        {showPanel && (
                          <div className="mt-4 p-4 bg-indigo-950/40 border border-indigo-500/20 rounded-xl space-y-3 animate-fade-in">
                            <p className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                              <Sparkles className="h-3.5 w-3.5" />
                              AI Description Generator
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <Input
                                label="Your Job Title"
                                placeholder="Software Engineer"
                                value={entry._aiJobTitle || ""}
                                onChange={(e) => updateEntry(index, "_aiJobTitle", e.target.value)}
                              />
                              <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-400">
                                  Experience Level
                                </label>
                                <select
                                  value={entry._aiExpLevel || "mid"}
                                  onChange={(e) => updateEntry(index, "_aiExpLevel", e.target.value)}
                                  className="w-full bg-slate-900/60 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/60 transition capitalize"
                                >
                                  {EXP_LEVELS.map((l) => (
                                    <option key={l} value={l} className="capitalize">
                                      {l.charAt(0).toUpperCase() + l.slice(1)}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <Input
                                label="Years of Experience"
                                type="number"
                                placeholder="2"
                                value={entry._aiYears || ""}
                                onChange={(e) => updateEntry(index, "_aiYears", e.target.value)}
                              />
                              <Input
                                label="Tech Stack"
                                placeholder="React, Node.js, MongoDB"
                                value={entry._aiTechStack || ""}
                                onChange={(e) => updateEntry(index, "_aiTechStack", e.target.value)}
                                hint="Comma-separated technologies"
                              />
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              loading={isGenerating}
                              icon={<Sparkles className="h-3.5 w-3.5" />}
                              onClick={() => handleGenerateDescription(index)}
                            >
                              {isGenerating ? "Generating..." : "Generate Description"}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Skip / Save buttons */}
          <div className="flex items-center justify-between mt-6">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => router.push(`/resume/${resumeId}/education`)}
            >
              Skip for now
            </Button>
            <Button
              type="submit"
              loading={saving}
              size="lg"
              iconRight={!saving ? <ArrowRight className="h-4 w-4" /> : undefined}
            >
              Save & Continue
            </Button>
          </div>
        </form>
      </div>
    </ResumeEditorShell>
  );
}
