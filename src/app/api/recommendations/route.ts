// app/api/recommendations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const child_id = req.nextUrl.searchParams.get("child_id")!;
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const [{ data: skills }, { data: profs }, { data: coverage }] = await Promise.all([
    supabase.from("skills").select("id, name, prerequisites, difficulty, domain"),
    supabase.from("child_skill_profiles").select("*").eq("child_id", child_id),
    supabase.from("recent_coverage").select("*").eq("child_id", child_id)
  ]);

  const profMap = new Map((profs ?? []).map(p => [p.skill_id, p]));
  const coveredMap = new Map((coverage ?? []).map(c => [c.skill_id, new Date(c.covered_at)]));

  const cooldownDays = 2; // do not repeat inside 2 days
  const now = new Date();

  const candidates = (skills ?? []).map(s => {
    const p = profMap.get(s.id);
    const mastery = p?.mastery ?? 0;
    const obs = p?.obs_count ?? 0;
    const pre = (s.prerequisites ?? []).every(id => {
      const q = profMap.get(id); return q && q.mastery >= 0.8 && q.obs_count >= 3;
    });

    let tag = "learning"; let rank = 0.6;
    if (!pre) { tag = "blocked"; rank = mastery + 0.1; }
    else if (mastery >= 0.8) { tag = "reviewing"; rank = 0.2; }
    else if (mastery >= 0.6) { tag = "ready"; rank = 0.9; }

    // cooldown penalty
    const last = coveredMap.get(s.id);
    if (last && (now.getTime() - last.getTime()) < cooldownDays * 86400000) {
      rank -= 0.3; // push down if too recent
    }

    return { ...s, mastery, obs, pre, tag, rank };
  });

  const sorted = candidates
    .filter(c => c.pre || c.tag === "blocked")
    .sort((a,b) => b.rank - a.rank)
    .slice(0, 5);

  // attach easiest activity per skill
  const acts = await Promise.all(sorted.map(async s => {
    const { data: a } = await supabase
      .from("activities").select("id, title").contains("targets", [s.id]).order("difficulty").limit(1);
    return { skill_id: s.id, skill_name: s.name, mastery: s.mastery, tag: s.tag, activity: a?.[0] ?? null };
  }));

  return NextResponse.json({ child_id, next_up: acts });
}
