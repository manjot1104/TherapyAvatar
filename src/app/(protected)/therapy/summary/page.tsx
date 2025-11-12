// src/app/(protected)/therapy/summary/page.tsx
"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession } from "@/components/SessionSummary";
import { persistAggregates } from "@/lib/session-persist";

const SessionSummaryCSR = dynamic(() => import("@/components/SessionSummary").then(m => m.default), { ssr: false });

export default function SummaryPage() {
  const { savePDFToCloud, saving, aggregates, meta } = useSession();

  const handleEndSession = async () => {
    try {
      if (!/^[0-9a-f-]{36}$/i.test(meta.sessionId)) { alert("Session not initialized yet."); return; }
      const res: any = await savePDFToCloud();
      if (res?.url) window.open(res.url, "_blank");
      if (res?.session_id) {
        await persistAggregates(res.session_id, {
          child_id: null,
          total_turns: aggregates.totalTurns,
          duration_min: aggregates.durationMin,
          words_total: aggregates.wordsTotal,
          avg_attention: aggregates.avgAttention,
          turns_child: aggregates.turnsBySpeaker.child ?? 0,
          turns_therapist: aggregates.turnsBySpeaker.therapist ?? 0,
          turns_assistant: aggregates.turnsBySpeaker.assistant ?? 0,
          turns_parent: aggregates.turnsBySpeaker.parent ?? 0,
        });
      }
      alert("Session saved ✅");
    } catch (e: any) {
      alert(e?.message || "Failed to save session");
    }
  };

  return (
    <section className="grid gap-6">
      <Card className="bg-card/90 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-primary">📝 Session Summary & Report</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading summary…</div>}>
            <SessionSummaryCSR />
          </Suspense>

          <div className="mt-4">
            <Button onClick={handleEndSession} disabled={saving}>
              {saving ? "Saving…" : "End Session & Save"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
