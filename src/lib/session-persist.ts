"use client";
import { createClient } from "@/lib/supabase/browser-client";

export async function persistTurn(
  sessionId: string,
  t: { speaker: "child"|"therapist"|"assistant"|"parent"; text: string; emotion?: string; attention?: number }
) {
  const supabase = createClient();
  const uid = (await supabase.auth.getUser()).data.user?.id;
  if (!uid || !sessionId) return;
  await supabase.from("session_turns").insert({
    session_id: sessionId,
    user_id: uid,
    speaker: t.speaker,
    text: t.text,
    emotion: t.emotion ?? null,
    attention: typeof t.attention === "number" ? t.attention : null,
  });
}

export async function persistMastery(
  sessionId: string,
  skill: string,
  status: "attempted"|"success"
) {
  const supabase = createClient();
  const uid = (await supabase.auth.getUser()).data.user?.id;
  if (!uid || !sessionId) return;
  await supabase.from("mastery_events").insert({
    session_id: sessionId, user_id: uid, skill, status
  });
}

export async function persistAggregates(
  sessionId: string,
  agg: {
    child_id?: string | null;
    total_turns: number; duration_min: number | null;
    words_total: number; avg_attention: number | null;
    turns_child: number; turns_therapist: number; turns_assistant: number; turns_parent: number;
  }
) {
  const supabase = createClient();
  const uid = (await supabase.auth.getUser()).data.user?.id;
  if (!uid || !sessionId) return;
  await supabase.from("session_aggregates").upsert({
    session_id: sessionId,
    user_id: uid,
    child_id: agg.child_id ?? null,
    total_turns: agg.total_turns,
    duration_min: agg.duration_min,
    words_total: agg.words_total,
    avg_attention: agg.avg_attention,
    turns_child: agg.turns_child,
    turns_therapist: agg.turns_therapist,
    turns_assistant: agg.turns_assistant,
    turns_parent: agg.turns_parent,
  });
}
