// app/(protected)/children/page.tsx
import Link from "next/link";
import { serverClient } from "@/lib/supabase/server-client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Baby, Calendar, FileText, Plus, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

type ChildRow = {
  id: string;
  full_name: string;
  dob: string | null;
  created_at: string;
  sessions30?: number;
};

async function getData() {
  const supabase = await serverClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null as any, children: [] as ChildRow[] };

  // Children (scoped to user)
  const { data: children } = await supabase
    .from("children")
    .select("id, full_name, dob, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Last 30 days sessions per child (from view)
  const sinceISO = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: counts } = await supabase
    .from("session_aggregates")
    .select("child_id, sessions30:count(session_id)")
    .eq("user_id", user.id)
    .gte("created_at", sinceISO);

  const countMap = new Map<string, number>(
    (counts ?? []).map((c: any) => [c.child_id as string, Number(c.sessions30) || 0])
  );

  const rows: ChildRow[] = (children ?? []).map((c) => ({
    ...c,
    sessions30: countMap.get(c.id) ?? 0,
  }));

  return { user, children: rows };
}

export default async function ChildrenPage() {
  const { user, children } = await getData();
  if (!user) return <div className="p-6">Please sign in.</div>;

  // Server Action: create child then redirect to Progress page
  async function createChild(formData: FormData) {
    "use server";
    const supabase = await serverClient();
    const full_name = (formData.get("full_name") as string)?.trim();
    const dob = (formData.get("dob") as string | null) || null;
    const notes = (formData.get("notes") as string | null) ?? null;
    if (!full_name) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("children")
      .insert({ user_id: user.id, full_name, dob, notes })
      .select("id")
      .single();

    if (error) {
      console.error("create child error:", error);
      revalidatePath("/children");
      return;
    }

    revalidatePath("/children");
    redirect(`/children/${data.id}/progress`);
  }

  return (
    <div className="min-h-[85vh] w-full bg-gradient-to-br from-sky-50 via-white to-indigo-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight flex items-center gap-2">
              <Baby className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              Children
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Manage child profiles and track sessions in the last 30 days.
            </p>
          </div>
          <a
            href="#add-child"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-md hover:brightness-105 active:brightness-95"
          >
            <Plus className="h-4 w-4" />
            Add child
          </a>
        </div>

        {/* Create card */}
        <section
          id="add-child"
          className="relative rounded-3xl border border-black/5 dark:border-white/10 bg-white/75 dark:bg-zinc-900/60 shadow-xl backdrop-blur"
        >
          <div className="absolute inset-x-0 -top-px h-1 rounded-t-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          <div className="p-6 sm:p-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Add child
            </h2>

            <form action={createChild} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
              <LabeledInput label="Full name" name="full_name" required placeholder="e.g., Aarav Singh" />
              <LabeledInput label="Date of birth" name="dob" type="date" />
              <div className="lg:col-span-2">
                <LabeledInput
                  label="Notes"
                  name="notes"
                  placeholder="Any baseline notes…"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <button className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:brightness-105 active:brightness-95">
                  <Plus className="h-4 w-4" />
                  Create
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* List card */}
        <section className="rounded-3xl border border-black/5 dark:border-white/10 bg-white/75 dark:bg-zinc-900/60 shadow-sm backdrop-blur overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-200/60 dark:border-zinc-800/60">
            <h3 className="text-base font-semibold">All children</h3>
          </div>

          {children.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b bg-zinc-50/70 dark:bg-zinc-900/40 border-zinc-200/60 dark:border-zinc-800/60">
                    <Th>Name</Th>
                    <Th>DOB</Th>
                    <Th>Created</Th>
                    <Th>Sessions (30d)</Th>
                    <Th className="text-right pr-6">Action</Th>
                  </tr>
                </thead>
                <tbody>
                  {children.map((c) => (
                    <tr key={c.id} className="border-b border-zinc-200/60 dark:border-zinc-800/60 hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40">
                      <Td className="font-medium">{c.full_name}</Td>
                      <Td className="whitespace-nowrap">
                        {c.dob ?? <span className="text-zinc-400">—</span>}
                      </Td>
                      <Td className="whitespace-nowrap">
                        {new Date(c.created_at).toLocaleDateString()}
                      </Td>
                      <Td>
                        <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[12px] font-medium border-zinc-200 dark:border-zinc-800">
                          {c.sessions30 ?? 0}
                        </span>
                      </Td>
                      <Td className="text-right pr-6">
                        <Link
                          className="inline-flex items-center gap-1 underline underline-offset-4"
                          href={`/children/${c.id}/progress`}
                        >
                          View progress
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* ---------- Tiny UI helpers (no extra deps) ---------- */

function LabeledInput(props: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  const { label, className = "", ...rest } = props;
  return (
    <label className="block space-y-1.5">
      {label && <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{label}</span>}
      <div
        className={[
          "group relative flex items-center gap-2 rounded-xl border bg-white/80 dark:bg-zinc-900/60",
          "border-zinc-200 dark:border-zinc-800",
          "focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-200/50 dark:focus-within:ring-indigo-500/20",
          "px-3 py-2.5 transition-shadow",
          className,
        ].join(" ")}
      >
        {rest.type === "date" ? <Calendar className="h-4 w-4 text-zinc-500" /> : <Baby className="h-4 w-4 text-zinc-500" />}
        <input
          {...rest}
          className="peer w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
        />
      </div>
    </label>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={["py-2.5 px-3 text-[13px] font-semibold text-zinc-700 dark:text-zinc-200", className].join(" ")}>
      {children}
    </th>
  );
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={["py-3 px-3 align-middle text-zinc-800 dark:text-zinc-200", className].join(" ")}>{children}</td>;
}

function EmptyState() {
  return (
    <div className="px-6 py-12 text-center">
      <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
        <Baby className="h-6 w-6" />
      </div>
      <h4 className="text-base font-semibold">No children yet</h4>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Add your first child to start tracking sessions and progress.
      </p>
      <a
        href="#add-child"
        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white/80 px-4 py-2 text-sm font-medium shadow-sm hover:bg-white active:scale-[0.99] dark:border-zinc-800 dark:bg-zinc-900/60"
      >
        <Plus className="h-4 w-4" />
        Add child
      </a>
    </div>
  );
}
