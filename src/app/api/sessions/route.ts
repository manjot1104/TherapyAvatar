// app/api/sessions/route.ts
import { NextResponse } from "next/server";
import { serverClient } from "@/lib/supabase/server-client";

type TurnDTO = {
  idx: number;
  ts: string;          // ISO
  speaker: string;
  text: string;
  emotion?: string | null;
  attention?: number | null;
};

type GameRunDTO = {
  game_key: string;
  rounds_played: number;
  rounds_correct: number;
  accuracy?: number | null;
  duration_ms?: number | null;
  extra?: any;
};

export async function POST(req: Request) {
  try {
    const supabase = await serverClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const {
      child_id,
      session_meta,
      turns,
      games,
      started_at,
      ended_at,
    } = body as {
      child_id: string;
      session_meta?: any;
      turns: TurnDTO[];
      games?: GameRunDTO[];
      started_at?: string | null;
      ended_at?: string | null;
    };

    if (!child_id || !Array.isArray(turns)) {
      return NextResponse.json({ error: "child_id and turns required" }, { status: 400 });
    }

    const total_turns = turns.length;
    const total_words = turns.reduce((sum, t) => sum + (t.text?.trim()?.split(/\s+/).length || 0), 0);
    const attVals = turns.map(t => (typeof t.attention === "number" ? t.attention : null)).filter((x): x is number => x != null);
    const avg_attention = attVals.length ? attVals.reduce((a, b) => a + b, 0) / attVals.length : null;

    const played = (games ?? []).reduce((s, g) => s + (g.rounds_played || 0), 0);
    const correct = (games ?? []).reduce((s, g) => s + (g.rounds_correct || 0), 0);
    const accuracy = played ? correct / played : null;
    const score = correct;

    // 1) session
    const { data: sessionRow, error: sesErr } = await supabase
      .from("sessions")
      .insert({
        child_id,
        user_id: user.id,
        started_at: started_at || new Date().toISOString(),
        ended_at: ended_at || new Date().toISOString(),
        total_turns,
        total_words,
        avg_attention,
        accuracy,
        score,
        meta: session_meta || null,
      })
      .select("id")
      .single();
    if (sesErr) return NextResponse.json({ error: sesErr.message }, { status: 400 });

    const session_id = sessionRow!.id as string;

    // 2) turns
    if (turns.length) {
      const rows = turns.map((t) => ({
        session_id,
        idx: t.idx,
        ts: t.ts,
        speaker: t.speaker,
        text: t.text,
        emotion: t.emotion ?? null,
        attention: typeof t.attention === "number" ? t.attention : null,
      }));
      const { error: tErr } = await supabase.from("session_turns").insert(rows);
      if (tErr) return NextResponse.json({ error: tErr.message }, { status: 400 });
    }

    // 3) games
    if (games?.length) {
      const rows = games.map((g) => ({
        session_id,
        game_key: g.game_key,
        rounds_played: g.rounds_played,
        rounds_correct: g.rounds_correct,
        accuracy:
          typeof g.accuracy === "number"
            ? g.accuracy
            : g.rounds_played
            ? g.rounds_correct / g.rounds_played
            : null,
        duration_ms: g.duration_ms ?? null,
        extra: g.extra ?? null,
      }));
      const { error: gErr } = await supabase.from("game_runs").insert(rows);
      if (gErr) return NextResponse.json({ error: gErr.message }, { status: 400 });
    }

    return NextResponse.json({ session_id }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
