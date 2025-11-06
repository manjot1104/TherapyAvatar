// app/profile/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser-client";
import { signOutAction } from "@/app/actions/auth"; // ✅ import the server action

type Profile = { full_name: string | null; avatar_url: string | null };

export default function ProfilePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile>({ full_name: "", avatar_url: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }
      setEmail(user.email ?? null);
      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();
      if (data) setProfile(data);
      setLoading(false);
    })();
  }, []);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("profiles").upsert({ id: user.id, ...profile });
    setSaving(false);
  }

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your Profile</h1>

        {/* ✅ pass the server action directly; no inline "use server" */}
        <form action={signOutAction}>
          <button type="submit" className="border rounded-xl px-3 py-2">
            Sign out
          </button>
        </form>
      </div>

      <div className="rounded-2xl border p-4 space-y-3">
        <p className="text-sm text-slate-600">Signed in as <b>{email}</b></p>
        <form onSubmit={onSave} className="space-y-3">
          <input
            className="w-full border rounded-lg p-3"
            placeholder="Full name"
            value={profile.full_name ?? ""}
            onChange={(e)=>setProfile(p=>({...p, full_name: e.target.value}))}
          />
          <input
            className="w-full border rounded-lg p-3"
            placeholder="Avatar URL"
            value={profile.avatar_url ?? ""}
            onChange={(e)=>setProfile(p=>({...p, avatar_url: e.target.value}))}
          />
          <button disabled={saving} className="rounded-xl px-4 py-2 border">
            {saving ? "Saving…" : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}
