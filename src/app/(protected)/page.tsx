// app/(protected)/page.tsx
import Link from "next/link";
import { serverClient } from "@/lib/supabase/server-client";

export default async function DashboardPage() {
  const supabase = await serverClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex gap-3">
          <Link href="/therapy" className="text-sm border rounded px-3 py-2">Open Therapy Avatar</Link>
          <Link href="/profile" className="text-sm border rounded px-3 py-2">Edit Profile</Link>
        </div>
      </div>

      <div className="rounded-2xl border p-5 space-y-3">
        <p className="text-slate-700">
          Welcome{user?.email ? `, ${user.email}` : ""}! You’re signed in.
        </p>
        <ul className="list-disc pl-6 text-slate-700">
          <li>Start a session in <Link href="/therapy" className="underline">Therapy Avatar</Link>.</li>
          <li>Update your <Link href="/profile" className="underline">profile</Link>.</li>
          <li>Use the header’s Sign out button to securely exit.</li>
        </ul>
      </div>
    </div>
  );
}
