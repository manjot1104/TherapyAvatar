import { serverClient } from "@/lib/supabase/server-client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function getData() {
  const supabase = await serverClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, children: [] };

  // children + last 30d sessions count
  const { data: children } = await supabase
    .from("children")
    .select("id, full_name, dob, created_at")
    .order("created_at", { ascending: false });

  // sessions per child (last 30d)
  const { data: counts } = await supabase
    .from("session_aggregates")
    .select("child_id, count:session_id")
    .gte("created_at", new Date(Date.now() - 30*24*60*60*1000).toISOString())
    .group("child_id");

  const countMap = new Map((counts ?? []).map(c => [c.child_id, (c as any).count]));
  return { user, children: (children ?? []).map(c => ({ ...c, sessions30: countMap.get(c.id) ?? 0 })) };
}

export default async function ChildrenPage() {
  const { user, children } = await getData();
  if (!user) return <div className="p-6">Please sign in.</div>;

  async function createChild(formData: FormData) {
    "use server";
    const supabase = await serverClient();
    const full_name = (formData.get("full_name") as string)?.trim();
    const dob = formData.get("dob") as string | null;
    const notes = (formData.get("notes") as string | null) ?? null;
    if (!full_name) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("children")
      .insert({ user_id: user.id, full_name, dob: dob || null, notes })
      .select("id")
      .single();

    if (!error && data?.id) {
      revalidatePath("/(protected)/children");
      redirect(`/(protected)/children/${data.id}/progress`);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Children</h1>
      </header>

      {/* Add child */}
      <div className="rounded-2xl border p-4">
        <h2 className="text-lg font-semibold mb-3">Add child</h2>
        <form action={createChild} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="text-xs text-slate-500">Full name</label>
            <input name="full_name" required className="w-full border rounded-lg p-2" />
          </div>
          <div>
            <label className="text-xs text-slate-500">Date of birth</label>
            <input name="dob" type="date" className="w-full border rounded-lg p-2" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-slate-500">Notes</label>
            <input name="notes" className="w-full border rounded-lg p-2" placeholder="Any baseline notes…" />
          </div>
          <button className="border rounded-lg px-4 py-2">Create</button>
        </form>
      </div>

      {/* List */}
      <div className="rounded-2xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b bg-slate-50">
              <th className="py-2 px-3">Name</th>
              <th className="py-2 px-3">DOB</th>
              <th className="py-2 px-3">Created</th>
              <th className="py-2 px-3">Sessions (30d)</th>
              <th className="py-2 px-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {children.map((c) => (
              <tr key={c.id} className="border-b">
                <td className="py-2 px-3">{c.full_name}</td>
                <td className="py-2 px-3 whitespace-nowrap">{c.dob ?? "—"}</td>
                <td className="py-2 px-3 whitespace-nowrap">{new Date(c.created_at).toLocaleDateString()}</td>
                <td className="py-2 px-3">{(c as any).sessions30}</td>
                <td className="py-2 px-3">
                  <a className="underline" href={`/(protected)/children/${c.id}/progress`}>View progress</a>
                </td>
              </tr>
            ))}
            {children.length === 0 && (
              <tr><td className="py-3 px-3 text-slate-600" colSpan={5}>No children yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
