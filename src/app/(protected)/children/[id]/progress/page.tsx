// app/(protected)/children/[id]/progress/page.tsx
import { serverClient } from "@/lib/supabase/server-client";
import Link from "next/link";
import {
  ArrowLeft,
  Baby,
  CalendarDays,
  Clock,
  Activity,
  CheckCircle2,
  XCircle,
  Star,
  ListChecks,
} from "lucide-react";
import { SCENARIOS } from "@/data/scenarios";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

type Attempt = {
  session_id: string | null;
  created_at: string;
  scenario_key: keyof typeof SCENARIOS | string;
  block_index: number;
  question_index: number;
  option_index: number;
  is_correct: boolean;
};

type BlockAttempt = {
  session_id: string | null;
  created_at: string;
  scenario_key: string;
  block_index: number;
  stars_earned: number;
  answers_correct: number;
  passed: boolean;
};

export default async function ChildProgressPage({ params }: Params) {
  const supabase = await serverClient();

  // ---- Auth ----
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return <div className="p-6">Please sign in.</div>;

  const childId = params.id;

  // ---- Load child (RLS scoped) ----
  const { data: child } = await supabase
    .from("children")
    .select("id, full_name, dob, created_at")
    .eq("id", childId)
    .maybeSingle();

  if (!child) {
    return (
      <div className="min-h-[70vh] grid place-items-center p-6">
        <div className="text-center">
          <p className="text-lg font-semibold">Child not found</p>
          <Link
            className="mt-2 inline-flex items-center gap-2 underline underline-offset-4"
            href="/children"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Children
          </Link>
        </div>
      </div>
    );
  }

  // ---- Fetch attempts, block summaries, and points ----
  // Attempts (per question) — include NULL child_id as Ad-hoc
  const { data: attemptsRaw } = await supabase
    .from("scenario_question_attempts")
    .select(
      "session_id, created_at, scenario_key, block_index, question_index, option_index, is_correct"
    )
    .eq("owner_id", user.id)
    .or(`child_id.eq.${childId},child_id.is.null`)
    .order("created_at", { ascending: false });

  const attempts: Attempt[] = (attemptsRaw as Attempt[]) ?? [];

  // Block attempts (stars) — include NULL child_id as Ad-hoc
  const { data: blockAttemptsRaw } = await supabase
    .from("scenario_block_attempts")
    .select(
      "session_id, created_at, scenario_key, block_index, stars_earned, answers_correct, passed"
    )
    .eq("owner_id", user.id)
    .or(`child_id.eq.${childId},child_id.is.null`)
    .order("created_at", { ascending: false });

  const blockAttempts: BlockAttempt[] = (blockAttemptsRaw as BlockAttempt[]) ?? [];

  // Points (sum across scenarios) — stick to this child only
  const { data: progressRows } = await supabase
    .from("scenario_progress")
    .select("total_points")
    .eq("owner_id", user.id)
    .eq("child_id", childId);

  const totalPoints =
    progressRows?.reduce((sum, r: any) => sum + (r.total_points ?? 0), 0) ?? 0;

  // Sessions list (optional: if you store a sessions table)
  const { data: sessions } = await supabase
    .from("sessions")
    .select("id, created_at")
    .eq("child_id", childId)
    .order("created_at", { ascending: false })
    .limit(50);

  // Build a session meta map from sessions table
  const sessionMeta = new Map<string, { id: string; created_at: string | null }>();
  sessions?.forEach((s) => sessionMeta.set(s.id, { id: s.id, created_at: s.created_at }));

  // Add any session_ids from attempts that aren't in sessions table
  attempts.forEach((a) => {
    const sid = a.session_id && a.session_id.trim() !== "" ? a.session_id : null;
    if (sid && !sessionMeta.has(sid)) {
      sessionMeta.set(sid, { id: sid, created_at: null });
    }
  });

  // Group attempts by session_id (null/blank => "ADHOC")
  const grouped = new Map<string, Attempt[]>();
  for (const a of attempts) {
    const key =
      a.session_id && a.session_id.trim() !== "" ? a.session_id : "ADHOC";
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(a);
  }

  // Group block attempts (stars) by session
  const blockBySession = new Map<
    string,
    { totalStars: number; totalCorrect: number; blocks: BlockAttempt[] }
  >();
  for (const b of blockAttempts) {
    const key =
      b.session_id && b.session_id.trim() !== "" ? b.session_id : "ADHOC";
    if (!blockBySession.has(key)) {
      blockBySession.set(key, { totalStars: 0, totalCorrect: 0, blocks: [] });
    }
    const agg = blockBySession.get(key)!;
    agg.totalStars += b.stars_earned ?? 0;
    agg.totalCorrect += b.answers_correct ?? 0;
    agg.blocks.push(b);
  }

  // Build ordered session keys (latest first)
  // 1) Use sessions table order if present
  let orderedSessionKeys: string[] = [];
  if (sessions && sessions.length) {
    sessions.forEach((s) => {
      if (grouped.has(s.id)) orderedSessionKeys.push(s.id);
    });
  }
  // 2) Add any other session_ids present in attempts but not in sessions table
  const otherKeys = Array.from(grouped.keys()).filter(
    (k) => k !== "ADHOC" && !orderedSessionKeys.includes(k)
  );
  orderedSessionKeys = [...orderedSessionKeys, ...otherKeys];
  // 3) Finally push ADHOC bucket if it exists
  if (grouped.has("ADHOC")) orderedSessionKeys.push("ADHOC");

  // Overall totals (answered/correct) for header
  const overallAnswered = attempts.length;
  const overallCorrect = attempts.filter((a) => a.is_correct).length;

  return (
    <div className="min-h-[85vh] w-full bg-gradient-to-br from-sky-50 via-white to-indigo-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
              <Baby className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                {child.full_name}
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Full progress summary
              </p>
            </div>
          </div>

          <Link
            href="/children"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white/80 px-3 py-2 text-sm font-medium shadow-sm hover:bg-white active:scale-[0.99] dark:border-zinc-800 dark:bg-zinc-900/60"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>

        {/* Child meta + quick stats */}
        <section className="relative rounded-3xl border border-black/5 dark:border-white/10 bg-white/75 dark:bg-zinc-900/60 shadow-xl backdrop-blur">
          <div className="absolute inset-x-0 -top-px h-1 rounded-t-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          <div className="p-6 sm:p-8 space-y-6">
            {/* Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <MetaItem
                icon={<CalendarDays className="h-4 w-4" />}
                label="Date of birth"
                value={child.dob ?? "—"}
              />
              <MetaItem
                icon={<Clock className="h-4 w-4" />}
                label="Created"
                value={new Date(child.created_at).toLocaleString()}
              />
              <MetaItem
                icon={<ListChecks className="h-4 w-4" />}
                label="Total answered"
                value={String(overallAnswered)}
              />
              <MetaItem
                icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                label="Total correct"
                value={String(overallCorrect)}
              />
            </div>

            {/* Stats pills */}
            <div className="flex flex-wrap gap-3">
              <StatPill label="Total points (stars)" value={String(totalPoints)} />
              <StatPill
                label="Sessions listed"
                value={String(orderedSessionKeys.filter((k) => k !== "ADHOC").length)}
              />
              {grouped.has("ADHOC") && (
                <StatPill label="Ad-hoc attempts" value={String(grouped.get("ADHOC")!.length)} />
              )}
            </div>
          </div>
        </section>

        {/* Sessions breakdown */}
        <section className="rounded-3xl border border-black/5 dark:border-white/10 bg-white/75 dark:bg-zinc-900/60 shadow-sm backdrop-blur">
          <div className="px-6 py-4 border-b border-zinc-200/60 dark:border-zinc-800/60">
            <h2 className="text-lg font-semibold">Session-wise details</h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Every question with chosen answer, correct answer, and result.
            </p>
          </div>

          {orderedSessionKeys.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                <Activity className="h-6 w-6" />
              </div>
              <h4 className="text-base font-semibold">No attempts yet</h4>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Play a session to see detailed progress here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
              {orderedSessionKeys.map((sid) => (
                <SessionCard
                  key={sid}
                  sessionId={sid === "ADHOC" ? null : sid}
                  createdAt={sid === "ADHOC" ? null : sessionMeta.get(sid)?.created_at ?? null}
                  attempts={grouped.get(sid) ?? []}
                  blockAgg={blockBySession.get(sid) ?? { totalStars: 0, totalCorrect: 0, blocks: [] }}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* ============== Components & helpers ============== */

function SessionCard({
  sessionId,
  createdAt,
  attempts,
  blockAgg,
}: {
  sessionId: string | null;
  createdAt: string | null;
  attempts: Attempt[];
  blockAgg: { totalStars: number; totalCorrect: number; blocks: BlockAttempt[] };
}) {
  const answered = attempts.length;
  const correct = attempts.filter((a) => a.is_correct).length;

  return (
    <div className="px-6 py-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 grid place-items-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 text-[11px] font-medium">
            {sessionId ? sessionId.slice(0, 4) : "—"}
          </div>
          <div className="text-sm">
            <div className="font-semibold">
              {sessionId ? `Session ${sessionId.slice(0, 8)}…` : "Ad-hoc attempts"}
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              {createdAt ? new Date(createdAt).toLocaleString() : "Time not available"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Pill icon={<ListChecks className="h-3.5 w-3.5" />} label="Answered" value={String(answered)} />
          <Pill
            icon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
            label="Correct"
            value={String(correct)}
          />
          <Pill icon={<Star className="h-3.5 w-3.5 text-amber-500" />} label="Stars" value={String(blockAgg.totalStars)} />
        </div>
      </div>

      {/* Attempts table */}
      <div className="overflow-x-auto rounded-xl border border-zinc-200/60 dark:border-zinc-800/60">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50/60 dark:bg-zinc-900/40 text-zinc-600 dark:text-zinc-400">
            <tr>
              <Th>Time</Th>
              <Th>Scenario</Th>
              <Th>Block</Th>
              <Th>Q#</Th>
              <Th>Question</Th>
              <Th>Your Answer</Th>
              <Th>Correct Answer</Th>
              <Th>Result</Th>
            </tr>
          </thead>
        <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60 bg-white/70 dark:bg-zinc-950/40">
            {attempts.map((a, i) => {
              const meta = resolveQMeta(a);
              return (
                <tr key={i} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/30">
                  <Td>{new Date(a.created_at).toLocaleTimeString()}</Td>
                  <Td className="font-medium">{meta.scenarioTitle}</Td>
                  <Td>{a.block_index + 1}</Td>
                  <Td>{a.question_index + 1}</Td>
                  <Td className="max-w-[340px]">
                    <span className="line-clamp-2">{meta.prompt}</span>
                  </Td>
                  <Td className="max-w-[260px]">
                    <span className="line-clamp-2">{meta.chosenOption}</span>
                  </Td>
                  <Td className="max-w-[260px]">
                    <span className="line-clamp-2">{meta.correctOption}</span>
                  </Td>
                  <Td>
                    {a.is_correct ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/70 text-emerald-800 px-2 py-0.5 text-xs dark:bg-emerald-900/30 dark:text-emerald-200">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Correct
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100/70 text-rose-800 px-2 py-0.5 text-xs dark:bg-rose-900/30 dark:text-rose-200">
                        <XCircle className="h-3.5 w-3.5" />
                        Incorrect
                      </span>
                    )}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Per-session block summary (optional) */}
      {blockAgg.blocks.length > 0 && (
        <div className="mt-3 text-xs text-zinc-600 dark:text-zinc-400">
          <span className="font-medium">Block summary:</span>{" "}
          {blockAgg.blocks
            .slice()
            .sort((a, b) => a.block_index - b.block_index)
            .map(
              (b) =>
                `B${b.block_index + 1}: ${b.stars_earned}⭐ (${b.answers_correct}/3 ${
                  b.passed ? "pass" : "fail"
                })`
            )
            .join(" • ")}
        </div>
      )}
    </div>
  );
}

/* ---------- Tiny UI helpers ---------- */

function MetaItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white/70 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
      <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="mt-1 text-sm font-medium break-all">{value}</div>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/70 px-3 py-1.5 text-xs font-medium shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
      <span className="text-zinc-600 dark:text-zinc-400">{label}:</span>
      <span className="text-zinc-900 dark:text-zinc-100">{value}</span>
    </div>
  );
}

function Pill({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white/70 px-2.5 py-1 text-[11px] font-medium shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
      {icon}
      <span className="text-zinc-600 dark:text-zinc-400">{label}:</span>
      <span className="text-zinc-900 dark:text-zinc-100">{value}</span>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-2 text-left text-[11px] uppercase tracking-wide font-semibold">
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-3 py-2 align-top ${className}`}>{children}</td>;
}

/* ---------- Scenario resolver ---------- */

function resolveQMeta(a: Attempt): {
  scenarioTitle: string;
  prompt: string;
  chosenOption: string;
  correctOption: string;
} {
  const key = a.scenario_key as keyof typeof SCENARIOS;
  const sc = (SCENARIOS as any)[key];

  if (!sc) {
    return {
      scenarioTitle: String(a.scenario_key),
      prompt: `Q${a.question_index + 1}`,
      chosenOption: `Option #${a.option_index + 1}`,
      correctOption: "—",
    };
  }

  const scenarioTitle = sc.title ?? String(a.scenario_key);
  const block = sc.blocks?.[a.block_index];
  const q = block?.questions?.[a.question_index];
  const chosenOption = q?.options?.[a.option_index] ?? `Option #${a.option_index + 1}`;
  const correctOption =
    q?.options?.[q?.correctIndex ?? -1] ?? (q ? "—" : "Unknown");
  const prompt = q?.prompt ?? `Q${a.question_index + 1}`;

  return { scenarioTitle, prompt, chosenOption, correctOption };
}
