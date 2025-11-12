// app/profile/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser-client";
import { signOutAction } from "@/app/actions/auth";
import { User as UserIcon, Loader2, LogOut, CheckCircle2 } from "lucide-react";

type Profile = { full_name: string | null };

export default function ProfilePage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile>({ full_name: "" });
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }
      setEmail(user.email ?? null);
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();
      if (data) setProfile(data);
      setLoading(false);
    })();
  }, [supabase]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("profiles").upsert({ id: user.id, full_name: profile.full_name });
    setSaving(false);
    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(null), 2500);
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] grid place-items-center p-6">
        <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-300">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading your profile…</span>
        </div>
      </div>
    );
  }

  const initials = (profile.full_name || email || "?")
    .split(/\s|@/)[0]
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-[85vh] w-full bg-gradient-to-br from-sky-50 via-white to-indigo-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Your Profile</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Signed in as <b>{email}</b>
            </p>
          </div>

          {/* server action sign out */}
          <form action={signOutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white/80 px-4 py-2 text-sm font-medium shadow-sm hover:bg-white active:scale-[0.99] dark:border-zinc-800 dark:bg-zinc-900/60"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>

        {/* Card */}
        <div className="relative rounded-3xl border border-black/5 dark:border-white/10 bg-white/75 dark:bg-zinc-900/60 shadow-xl backdrop-blur">
          <div className="absolute inset-x-0 -top-px h-1 rounded-t-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Initials avatar (no URL) */}
              <div className="shrink-0">
                <div className="h-28 w-28 rounded-2xl overflow-hidden ring-1 ring-zinc-200 dark:ring-zinc-800 bg-zinc-100 dark:bg-zinc-800 grid place-items-center">
                  <span className="text-xl font-semibold text-zinc-700 dark:text-zinc-200">
                    {initials}
                  </span>
                </div>
                <p className="mt-2 text-xs text-zinc-500">
                  Your initials appear in the app header.
                </p>
              </div>

              {/* Form (only Full name) */}
              <div className="flex-1">
                <form onSubmit={onSave} className="space-y-4">
                  <LabeledInput
                    label="Full name"
                    placeholder="Your name"
                    value={profile.full_name ?? ""}
                    onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
                    icon={<UserIcon className="h-4 w-4" />}
                  />

                  <div className="flex items-center gap-3">
                    <PrimaryButton disabled={saving} loading={saving}>
                      {saving ? "Saving…" : "Save changes"}
                    </PrimaryButton>

                    {savedAt && (
                      <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" />
                        Saved
                      </span>
                    )}
                  </div>
                </form>
              </div>
            </div>

            <div className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
              <ul className="list-disc pl-5 space-y-1">
                <li>Your name appears on session notes and leaderboards.</li>
                <li>You can update it anytime.</li>
              </ul>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-zinc-500">
          © {new Date().getFullYear()} Global Child Wellness
        </p>
      </div>
    </div>
  );
}

/* ---------- Tiny UI helpers ---------- */

function LabeledInput({
  label,
  icon,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <label className="block space-y-1.5">
      {label && (
        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{label}</span>
      )}
      <div
        className={[
          "group relative flex items-center gap-2 rounded-xl border bg-white/80 dark:bg-zinc-900/60",
          "border-zinc-200 dark:border-zinc-800",
          "focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-200/50 dark:focus-within:ring-indigo-500/20",
          "px-3 py-2.5 transition-shadow",
          className,
        ].join(" ")}
      >
        {icon && <span className="text-zinc-500">{icon}</span>}
        <input
          {...props}
          className="peer w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
        />
      </div>
    </label>
  );
}

function PrimaryButton({
  children,
  loading,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...props}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium",
        "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:brightness-105 active:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed",
        className,
      ].join(" ")}
      disabled={props.disabled || loading}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
