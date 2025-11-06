// app/api/evidence/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { updateMastery, statusFrom } from "@/lib/mastery";

export async function POST(req: NextRequest) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { child_id, skill_id, source, observation, trials, notes } = await req.json();

  const { data: skill } = await supabase.from("skills").select("prerequisites").eq("id", skill_id).single();
  const { data: prof } = await supabase
    .from("child_skill_profiles")
    .select("*").eq("child_id", child_id).eq("skill_id", skill_id).maybeSingle();

  const alphaBy: Record<string, number> = { therapist_probe: 0.4, convo_nlu: 0.35, parent_report: 0.2, auto_signal: 0.6 };
  const newMastery = updateMastery(prof?.mastery ?? 0, observation, alphaBy[source] ?? 0.3);

  // check prerequisites mastered
  const preIds = skill?.prerequisites ?? [];
  let hasAllPre = true;
  if (preIds.length) {
    const { data: pre } = await supabase
      .from("child_skill_profiles")
      .select("skill_id, mastery, obs_count")
      .eq("child_id", child_id)
      .in("skill_id", preIds);
    hasAllPre = (pre?.length ?? 0) === preIds.length && pre!.every(p => p.mastery >= 0.8 && p.obs_count >= 3);
  }
  const newStatus = statusFrom(newMastery, (prof?.obs_count ?? 0) + 1, hasAllPre);

  await supabase.from("evidence_events").insert({
    child_id, skill_id, source, observation, trials, notes
  });

  await supabase.from("child_skill_profiles").upsert({
    child_id, skill_id, mastery: newMastery, last_evidence_at: new Date().toISOString(),
    status: newStatus, obs_count: (prof?.obs_count ?? 0) + 1
  });

  // mark coverage (cooldown)
  await supabase.from("recent_coverage").upsert({ child_id, skill_id, covered_at: new Date().toISOString() });

  return NextResponse.json({ mastery: newMastery, status: newStatus });
}
