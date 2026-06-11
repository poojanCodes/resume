"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  User, Mail, Phone, MapPin,  Globe, ArrowRight,
} from "lucide-react";

import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import ResumeEditorShell from "@/components/layout/ResumeEditorShell";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Spinner from "@/components/ui/Spinner";

/**
 * PersonalInfoPage — Step 1 of the resume editor wizard.
 *
 * Flow:
 * 1. Mount → fetch resume data from GET /api/resumes/:resumeId
 * 2. Populate form with existing personalInfo (if any)
 * 3. User fills fields
 * 4. "Save & Continue" → PUT /api/resumes/:resumeId
 * 5. On success → navigate to next step: /work-experience
 *
 * Lesson — useParams():
 * Next.js App Router gives us `useParams()` to read dynamic route segments.
 * Our route is /resume/[resumeId]/personal-info, so useParams() returns
 * { resumeId: "abc123" }. We use this to build the API URL.
 *
 * Lesson — "Controlled Form":
 * Every input's value is driven by React state. When the user types,
 * state updates. When we "Save", we read from state. This is the standard
 * React pattern for forms.
 */

interface PersonalInfo {
  fullname:  string;
  email:     string;
  mobile:    string;
  location:  string;
  github:    string;
  linkedIn:  string;
  portfolio: string;
}

const INITIAL_STATE: PersonalInfo = {
  fullname:  "",
  email:     "",
  mobile:    "",
  location:  "",
  github:    "",
  linkedIn:  "",
  portfolio: "",
};

export default function PersonalInfoPage() {
  const params   = useParams();
  const router   = useRouter();
  const resumeId = params.resumeId as string;

  const { user, loading: authLoading } = useAuth();

  const [form,    setForm]    = useState<PersonalInfo>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [saved,   setSaved]   = useState(false);

  // ── Load existing resume data ────────────────────────────
  useEffect(() => {
    if (authLoading || !user) return;

    const fetchResume = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/resumes/${resumeId}`);
        if (res.data.success && res.data.data?.personalInfo) {
          // Only overwrite fields that have values — keep INITIAL_STATE defaults
          setForm((prev) => ({ ...prev, ...res.data.data.personalInfo }));
        }
      } catch (err: any) {
        if (err.response?.status !== 401) {
          setError("Could not load resume data. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
  }, [resumeId, user, authLoading]);

  // ── Generic field updater ─────────────────────────────────
  // Lesson: Instead of writing one onChange handler per field,
  // we write ONE handler that takes the field name. This is the
  // "computed property name" pattern in JavaScript.
  const handleChange = (field: keyof PersonalInfo, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (saved) setSaved(false);
  };

  // ── Save & Continue ──────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic required field check
    if (!form.fullname.trim() || !form.email.trim()) {
      setError("Full name and email are required to continue.");
      return;
    }

    try {
      setSaving(true);
      const res = await api.put(`/api/resumes/${resumeId}`, {
        personalInfo: form,
      });

      if (res.data.success) {
        setSaved(true);
        // Navigate to next step
        setTimeout(() => {
          router.push(`/resume/${resumeId}/work-experience`);
        }, 600);
      } else {
        setError(res.data.message || "Failed to save. Please try again.");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return <Spinner fullPage message="Loading your resume..." />;
  }

  return (
    <ResumeEditorShell resumeId={resumeId} userName={user?.name}>
      <div className="max-w-2xl mx-auto">

        {/* Step Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-9 w-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <User className="h-4.5 w-4.5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100">Personal Information</h1>
              <p className="text-slate-500 text-xs mt-0.5">Step 1 of 6 — Tell recruiters who you are</p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && <Alert type="error"   message={error}                        className="mb-5" />}
        {saved  && <Alert type="success" message="Saved! Heading to next step..." className="mb-5" />}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>

          {/* Section: Basic Info */}
          <SectionCard title="Basic Details" subtitle="Your name and contact information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Full Name"
                  type="text"
                  placeholder="John Doe"
                  value={form.fullname}
                  onChange={(e) => handleChange("fullname", e.target.value)}
                  icon={<User className="h-4 w-4" />}
                  required
                />
              </div>
              <Input
                label="Email Address"
                type="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                icon={<Mail className="h-4 w-4" />}
                required
              />
              <Input
                label="Phone Number"
                type="tel"
                placeholder="+91 98765 43210"
                value={form.mobile}
                onChange={(e) => handleChange("mobile", e.target.value)}
                icon={<Phone className="h-4 w-4" />}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Location"
                  type="text"
                  placeholder="Mumbai, India"
                  value={form.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  icon={<MapPin className="h-4 w-4" />}
                  hint="City, State or Country — e.g. Bengaluru, Karnataka"
                />
              </div>
            </div>
          </SectionCard>

          {/* Section: Online Presence */}
          <SectionCard
            title="Online Presence"
            subtitle="Links that let recruiters explore your work"
            className="mt-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="GitHub Profile"
                type="url"
                placeholder="https://github.com/username"
                value={form.github}
                onChange={(e) => handleChange("github", e.target.value)}
                icon={<Github className="h-4 w-4" />}
              />
              <Input
                label="LinkedIn Profile"
                type="url"
                placeholder="https://linkedin.com/in/username"
                value={form.linkedIn}
                onChange={(e) => handleChange("linkedIn", e.target.value)}
                icon={<Linkedin className="h-4 w-4" />}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Portfolio / Website"
                  type="url"
                  placeholder="https://yourportfolio.com"
                  value={form.portfolio}
                  onChange={(e) => handleChange("portfolio", e.target.value)}
                  icon={<Globe className="h-4 w-4" />}
                />
              </div>
            </div>
          </SectionCard>

          {/* Save & Continue */}
          <div className="flex justify-end mt-6">
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

/* ─────────────────────────────────────────────
   SectionCard — groups related form fields
   with a title and subtle card treatment
───────────────────────────────────────────── */
function SectionCard({
  title,
  subtitle,
  children,
  className = "",
}: {
  title:     string;
  subtitle?: string;
  children:  React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "bg-slate-900/40 border border-slate-800/70 rounded-2xl p-6 backdrop-blur-sm",
        className,
      ].join(" ")}
    >
      <div className="mb-4">
        <h2 className="text-sm font-bold text-slate-200">{title}</h2>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}
