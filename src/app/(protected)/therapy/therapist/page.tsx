// src/app/(protected)/therapy/therapist/page.tsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TherapistPanel from "@/components/TherapistPanel";
import { useSession } from "@/components/SessionSummary";
import { persistMastery, persistTurn } from "@/lib/session-persist";
import { speakInBrowser } from "@/lib/speak";

export default function TherapistPage() {
  const { addTurn, meta } = useSession();

  return (
    <section className="grid">
      <Card className="bg-card/90 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-primary">🎛️ Therapist Control</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <TherapistPanel
            disabled={false}
            currentSkill={"greet"}
            onPause={() => { try { window.speechSynthesis?.cancel(); } catch {} }}
            onRepeat={async () => {}}
            onSimplify={() => {}}
            onNext={() => {}}
            onCalm={() => {}}
            onMarkAttempt={(skill) => {
              if (/^[0-9a-f-]{36}$/i.test(meta.sessionId))
                persistMastery(meta.sessionId, skill, "attempted").catch(()=>{});
            }}
            onMarkSuccess={(skill) => {
              if (/^[0-9a-f-]{36}$/i.test(meta.sessionId))
                persistMastery(meta.sessionId, skill, "success").catch(()=>{});
            }}
            onAsk={async (q) => {
              addTurn({ speaker: "therapist", text: q });
              if (/^[0-9a-f-]{36}$/i.test(meta.sessionId)) persistTurn(meta.sessionId, { speaker: "therapist", text: q }).catch(()=>{});
              try { await speakInBrowser(q, { rate: 0.95 }); } catch {}
            }}
          />
        </CardContent>
      </Card>
    </section>
  );
}
