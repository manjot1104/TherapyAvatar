// app/(protected)/page.tsx
import Link from "next/link";
import { serverClient } from "@/lib/supabase/server-client";
import {
  ArrowRight,
  Brain,
  User,
  Activity,
  Sparkles,
  Users,
  CalendarClock,
} from "lucide-react";

export default async function DashboardPage() {
  const supabase = await serverClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Guard (shouldn’t happen if route is protected)
  if (!user) {
    return (
      <div className="min-h-[85vh] grid place-items-center">
        <Link
          href="/sign-in"
          className="rounded-xl bg-indigo-600 px-4 py-2 text-white"
        >
          Sign in
        </Link>
      </div>
    );
  }

  // ------- Quick server stats -------
  const { count: childrenCount } = await supabase
    .from("children")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { count: sessionCount } = await supabase
    .from("sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { data: lastSessionRow } = await supabase
    .from("sessions")
    .select("created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const lastSessionText = lastSessionRow
    ? new Date(lastSessionRow.created_at).toLocaleString()
    : "—";

  return (
    <div className="min-h-[85vh] w-full bg-gradient-to-br from-sky-50 via-white to-indigo-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              Dashboard
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Welcome, <span className="font-medium">{user.email}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/therapy"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white/80 px-4 py-2 text-sm font-medium shadow-sm hover:bg-white active:scale-[0.99] dark:border-zinc-800 dark:bg-zinc-900/60"
            >
              <Brain className="h-4 w-4" />
              Open Therapy
              <ArrowRight className="h-4 w-4" />
            </Link>

            {/* NEW: Manage Children CTA */}
            <Link
              href="/children"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white/80 px-4 py-2 text-sm font-medium shadow-sm hover:bg-white active:scale-[0.99] dark:border-zinc-800 dark:bg-zinc-900/60"
            >
              <Users className="h-4 w-4" />
              Manage Children
            </Link>

            <Link
              href="/profile"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white/80 px-4 py-2 text-sm font-medium shadow-sm hover:bg-white active:scale-[0.99] dark:border-zinc-800 dark:bg-zinc-900/60"
            >
              <User className="h-4 w-4" />
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Hero / CTA Card */}
        <div className="relative rounded-3xl border border-black/5 dark:border-white/10 bg-white/75 dark:bg-zinc-900/60 shadow-xl backdrop-blur">
          <div className="absolute inset-x-0 -top-px h-1 rounded-t-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          <div className="p-6 sm:p-8 grid sm:grid-cols-3 gap-6">
            <div className="sm:col-span-2">
              <h2 className="text-xl font-semibold">Get started quickly</h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Start a session, manage children, or review progress.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/therapy"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-md hover:brightness-105 active:brightness-95"
                >
                  Launch Therapy
                  <ArrowRight className="h-4 w-4" />
                </Link>

                {/* NEW: Go to children */}
                <Link
                  href="/children"
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white/80 px-4 py-2.5 text-sm font-medium hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/60"
                >
                  Manage Children
                </Link>

                <Link
                  href="/profile"
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white/80 px-4 py-2.5 text-sm font-medium hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/60"
                >
                  Update Profile
                </Link>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-1 gap-3">
              <StatCard
                icon={<Users className="h-4 w-4" />}
                label="Children"
                value={String(childrenCount ?? 0)}
                hint="Manage child profiles"
                href="/children"
              />
              <StatCard
                icon={<Activity className="h-4 w-4" />}
                label="Sessions"
                value={String(sessionCount ?? 0)}
                hint="Start one in Therapy"
                href="/therapy"
              />
              <StatCard
                icon={<CalendarClock className="h-4 w-4" />}
                label="Last session"
                value={lastSessionText}
              />
            </div>
          </div>
        </div>

        {/* Helpful Links / Tips */}
        <div className="grid md:grid-cols-2 gap-6">
          <InfoCard
            title="Tips"
            items={[
              {
                text: (
                  <>
                    Add or select a child in{" "}
                    <Link
                      href="/children"
                      className="underline underline-offset-4"
                    >
                      Children
                    </Link>
                    , then start a session in{" "}
                    <Link href="/therapy" className="underline underline-offset-4">
                      Therapy
                    </Link>
                    .
                  </>
                ),
              },
              {
                text: (
                  <>
                    See per-child progress in{" "}
                    <span className="font-medium">Children → Progress</span>.
                  </>
                ),
              },
              { text: "Use the header’s Sign out button to securely exit." },
            ]}
          />
          <InfoCard
            title="What’s next?"
            items={[
              { icon: <Brain className="h-4 w-4" />, text: "Test avatar expressions & gestures during prompts." },
              { icon: <Users className="h-4 w-4" />, text: "Create child profiles and track session-wise results." },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

/* ---------- Tiny UI pieces ---------- */

function StatCard({
  label,
  value,
  hint,
  href,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  href?: string;
  icon?: React.ReactNode;
}) {
  const Card = (
    <div className="rounded-2xl border border-zinc-200 bg-white/70 p-4 shadow-sm transition-colors hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:bg-zinc-900">
      <div className="flex items-center justify-between">
        <div className="text-xs text-zinc-500">{label}</div>
        {icon && <div className="text-zinc-400">{icon}</div>}
      </div>
      <div className="mt-1 text-lg sm:text-2xl font-semibold tracking-tight">
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-zinc-500">{hint}</div>}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block active:scale-[0.99]">
        {Card}
      </Link>
    );
    }
  return Card;
}

function InfoCard({
  title,
  items,
}: {
  title: string;
  items: { text: React.ReactNode; icon?: React.ReactNode }[];
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white/75 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-900/60">
      <h3 className="text-base font-semibold">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2">
            {it.icon && <span className="mt-0.5 text-zinc-500">{it.icon}</span>}
            <span>{it.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
