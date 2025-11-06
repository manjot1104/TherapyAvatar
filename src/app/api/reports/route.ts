import { NextResponse } from "next/server";
import { serverClient } from "@/lib/supabase/server-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const supabase = await serverClient();

    // 1) Auth
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized (no user)" }, { status: 401 });
    }

    // 2) Parse form
    const form = await req.formData();
    const file = form.get("file") as File | null;
    let providedSessionId = (form.get("session_id") as string | null) ?? undefined;
    const title = (form.get("title") as string | null) ?? "Session Summary & Report";
    if (!file) return NextResponse.json({ error: "Missing file" }, { status: 400 });

    // 3) Ensure we have a real session row
    let sessionId = providedSessionId;
    if (sessionId) {
      const { data: existing, error: existErr } = await supabase
        .from("sessions")
        .select("id, user_id")
        .eq("id", sessionId)
        .single();
      if (existErr || !existing || existing.user_id !== user.id) {
        sessionId = undefined; // fall back to create
      }
    }
    if (!sessionId) {
      const { data: sessionRow, error: sessionErr } = await supabase
        .from("sessions")
        .insert({ user_id: user.id, title, ended_at: new Date().toISOString() })
        .select("id")
        .single();
      if (sessionErr) {
        return NextResponse.json({ error: `Create session failed: ${sessionErr.message}` }, { status: 500 });
      }
      sessionId = sessionRow!.id;
    }

    // 4) Upload to Storage
    const arrayBuffer = await file.arrayBuffer();
    const path = `${user.id}/${sessionId}.pdf`;

    const { error: uploadErr } = await supabase.storage
      .from("reports")
      .upload(path, arrayBuffer, { contentType: "application/pdf", upsert: true });

    if (uploadErr) {
      return NextResponse.json({ error: `Upload failed: ${uploadErr.message}` }, { status: 500 });
    }

    // 5) Insert metadata
    const size_bytes = file.size ?? null;
    const { error: repErr } = await supabase
      .from("session_reports")
      .insert({ session_id: sessionId, user_id: user.id, storage_path: path, title, size_bytes });

    if (repErr) {
      return NextResponse.json({ error: `DB insert failed: ${repErr.message}` }, { status: 500 });
    }

    // 6) Signed URL for convenience
    const { data: signed, error: signErr } = await supabase.storage.from("reports").createSignedUrl(path, 3600);
    if (signErr) {
      // Not critical; return without URL
      return NextResponse.json({ ok: true, session_id: sessionId, path }, { status: 200 });
    }

    return NextResponse.json({ ok: true, session_id: sessionId, path, url: signed?.signedUrl ?? null }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: `Server error: ${e?.message || "unknown"}` }, { status: 500 });
  }
}
