"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  Trash2,
  Edit,
  Eye,
  Briefcase,
  Sparkles,
  FileCheck,
  Clock,
} from "lucide-react";

import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/layout/Navbar";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Spinner from "@/components/ui/Spinner";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

/**
 * DashboardPage — the user's home after login.
 *
 * Responsibilities:
 * - Show all the user's resumes
 * - Allow creating a new resume (redirects to /personal-info step)
 * - Allow deleting a resume
 * - Show quick stats
 *
 * Lesson: Notice how this page is now clean and readable. All the
 * repeated button/input/alert HTML is replaced with component calls.
 * This is the power of building a component library first.
 */

interface ResumeItem {
  _id:       string;
  title:     string;
  updatedAt: string;
  skills:    string[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [resumes,    setResumes]    = useState<ResumeItem[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [creating,   setCreating]   = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error,      setError]      = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;

    const fetchResumes = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/api/resumes");
        if (res.data.success) {
          setResumes(res.data.data || []);
        } else {
          setError(res.data.message || "Failed to load resumes.");
        }
      } catch (err: any) {
        if (err.response?.status !== 401) {
          setError("An error occurred while loading your resumes.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchResumes();
  }, [user, authLoading]);

  const handleCreateResume = async () => {
    try {
      setCreating(true);
      setError(null);
      const res = await api.post("/api/resumes/create");
      if (res.data.success && res.data.data) {
        router.push(`/resume/${res.data.data._id}/personal-info`);
      } else {
        setError(res.data.message || "Failed to create resume.");
      }
    } catch {
      setError("Unable to create resume. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteResume = async (resumeId: string) => {
    if (!confirm("Permanently delete this resume? This cannot be undone.")) return;
    try {
      setDeletingId(resumeId);
      const res = await api.delete(`/api/resumes/${resumeId}`);
      if (res.data.success) {
        setResumes((prev) => prev.filter((r) => r._id !== resumeId));
      } else {
        setError(res.data.message || "Failed to delete resume.");
      }
    } catch {
      setError("An error occurred while deleting the resume.");
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading || loading) {
    return <Spinner fullPage message="Entering your workspace..." />;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col relative overflow-x-hidden">
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed top-0 right-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />
      <div className="pointer-events-none fixed bottom-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px]" />

      <Navbar userName={user?.name} />

      <main className="flex-1 max-w-6xl mx-auto px-6 py-10 w-full relative z-10">

        {/* Error alert */}
        {error && (
          <Alert type="error" message={error} className="mb-6" />
        )}

        {/* ── Stats Row ── */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <StatCard
            icon={<FileText className="h-5 w-5" />}
            iconBg="bg-blue-500/10 text-blue-400"
            label="Total Resumes"
            value={resumes.length}
          />
          <StatCard
            icon={<FileCheck className="h-5 w-5" />}
            iconBg="bg-indigo-500/10 text-indigo-400"
            label="With Skills"
            value={resumes.filter((r) => r.skills?.length > 0).length}
          />
          <StatCard
            icon={<Sparkles className="h-5 w-5" />}
            iconBg="bg-purple-500/10 text-purple-400"
            label="AI Features"
            value="Active"
          />
        </section>

        {/* ── Header + New Resume Button ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-100">My Resumes</h2>
            <p className="text-slate-500 text-xs mt-0.5">
              Manage and optimize your professional documents
            </p>
          </div>
          <Button
            onClick={handleCreateResume}
            loading={creating}
            icon={<Plus className="h-4 w-4" />}
            size="md"
          >
            New Resume
          </Button>
        </div>

        {/* ── Resume Grid ── */}
        {resumes.length === 0 ? (
          <EmptyState onCreate={handleCreateResume} creating={creating} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in">
            {resumes.map((resume) => (
              <ResumeCard
                key={resume._id}
                resume={resume}
                onEdit={() =>
                  router.push(`/resume/${resume._id}/personal-info`)
                }
                onPreview={() =>
                  router.push(`/resume/${resume._id}/preview`)
                }
                onDelete={() => handleDeleteResume(resume._id)}
                isDeleting={deletingId === resume._id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Sub-components (co-located for simplicity)
───────────────────────────────────────────── */

function StatCard({
  icon,
  iconBg,
  label,
  value,
}: {
  icon:   React.ReactNode;
  iconBg: string;
  label:  string;
  value:  number | string;
}) {
  return (
    <Card className="flex items-center gap-4">
      <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">
          {label}
        </p>
        <h3 className="text-2xl font-bold text-slate-100 mt-0.5">{value}</h3>
      </div>
    </Card>
  );
}

function ResumeCard({
  resume,
  onEdit,
  onPreview,
  onDelete,
  isDeleting,
}: {
  resume:     ResumeItem;
  onEdit:     () => void;
  onPreview:  () => void;
  onDelete:   () => void;
  isDeleting: boolean;
}) {
  return (
    <Card className="flex flex-col justify-between h-[175px] group hover:border-slate-700 transition-all duration-200">
      {/* Top */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-bold text-slate-200 group-hover:text-blue-400 transition text-sm truncate">
            {resume.title || "Untitled Resume"}
          </h4>
          <span className="text-[9px] text-slate-600 bg-slate-950 px-1.5 py-0.5 rounded font-mono shrink-0">
            #{resume._id.slice(-4)}
          </span>
        </div>

        <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {new Date(resume.updatedAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>

        {resume.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2.5">
            {resume.skills.slice(0, 3).map((skill, i) => (
              <Badge key={i} variant="default">
                {skill}
              </Badge>
            ))}
            {resume.skills.length > 3 && (
              <span className="text-[9px] text-slate-600 self-center">
                +{resume.skills.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-slate-800/60 pt-3 mt-3">
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            title="Edit"
            className="p-1.5 rounded-lg bg-slate-950 hover:bg-blue-500/10 text-blue-400 hover:text-blue-300 border border-slate-800 hover:border-blue-500/30 transition cursor-pointer"
          >
            <Edit className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onPreview}
            title="Preview"
            className="p-1.5 rounded-lg bg-slate-950 hover:bg-emerald-500/10 text-emerald-400 hover:text-emerald-300 border border-slate-800 hover:border-emerald-500/30 transition cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
        </div>
        <Button
          variant="danger"
          size="sm"
          loading={isDeleting}
          onClick={onDelete}
          icon={<Trash2 className="h-3.5 w-3.5" />}
        >
          {!isDeleting && ""}
        </Button>
      </div>
    </Card>
  );
}

function EmptyState({
  onCreate,
  creating,
}: {
  onCreate: () => void;
  creating: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 border border-dashed border-slate-800 rounded-3xl bg-slate-900/10">
      <div className="h-16 w-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-5 shadow-xl shadow-black/40">
        <Briefcase className="h-7 w-7" />
      </div>
      <h3 className="font-bold text-slate-200 text-lg">No Resumes Yet</h3>
      <p className="text-slate-500 text-sm mt-2 mb-7 max-w-sm text-center leading-relaxed">
        Start building your first AI-powered resume. The wizard will guide you
        through every section step by step.
      </p>
      <Button
        onClick={onCreate}
        loading={creating}
        icon={<Plus className="h-4 w-4" />}
        size="lg"
      >
        Create Your First Resume
      </Button>
    </div>
  );
}
