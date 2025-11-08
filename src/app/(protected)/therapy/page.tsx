// src/app/(protected)/therapy/page.tsx
"use client";

import React, { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sparkles, Sun, Activity, Trophy, Stars } from "lucide-react";

import AudioRecorder from "@/components/AudioRecorder";
import TherapistPanel from "@/components/TherapistPanel";
import { speakInBrowser } from "@/lib/speak";
import EngagementGauge from "@/components/EmotionEngagementGauge";
import useGazeWS from "@/hooks/useGazeWS";

// Session context
import { SessionProvider, useSession } from "@/components/SessionSummary";

// persistence + supabase
import { persistTurn, persistMastery, persistAggregates } from "@/lib/session-persist";
import { createClient } from "@/lib/supabase/browser-client";

// NEW: scenarios
import ScenarioRunner from "@/components/ScenarioRunner";
import { SCENARIOS } from "@/data/scenarios";

const SessionSummaryCSR = dynamic(() => import("@/components/SessionSummary").then((m) => m.default), { ssr: false });
const AvatarCanvas = dynamic(
  () => import("@/components/AvatarCanvas"),
  { ssr: false, loading: () => <div className="h-[520px] grid place-items-center text-muted-foreground">Loading avatar…</div> }
);
const EmotionTracker = dynamic(
  () => import("@/components/EmotionTracker"),
  { ssr: false, loading: () => <div className="text-sm text-muted-foreground">Starting camera…</div> }
);

type MasteryStatus = "attempted" | "success";
type MasteryEvent = { id: string; ts: number; skill: string; status: MasteryStatus; rater: "manual" };

export default function TherapyPage() {
  return (
    <SessionProvider initialMeta={{ sessionId: "SSN-PENDING", sessionTitle: "Session Summary & Report" }}>
      <PageBody />
    </SessionProvider>
  );
}

function PageBody() {
  const { addTurn, meta, setMeta, aggregates, savePDFToCloud, saving } = useSession();
  const [processing, setProcessing] = useState(false);
  const [mode, setMode] = useState<"normal" | "calm">("normal");
  const [moduleName, setModuleName] = useState<"greeting" | "emotion" | "routine">("greeting");
  const [currentSkill, setCurrentSkill] = useState<string>("greet");
  const [lastAssistant, setLastAssistant] = useState<string>("");
  const [calmLock, setCalmLock] = useState(false);
  const [log, setLog] = useState<MasteryEvent[]>([]);
  const metrics = useGazeWS();

  const [activeScenario, setActiveScenario] = useState<keyof typeof SCENARIOS>("greeting_teacher");
  const selectedChildId: string | null = null;

  useEffect(() => {
    (async () => {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return;
      if (!/^[0-9a-f-]{36}$/i.test(meta.sessionId)) {
        const { data, error } = await sb
          .from("sessions")
          .insert({ user_id: user.id, title: meta.sessionTitle || "Therapy Session" })
          .select("id")
          .single();
        if (!error && data?.id) setMeta({ sessionId: data.id });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e as any).isComposing) return;
      const k = e.key.toLowerCase();
      if (k === "p") handlePause();
      if (k === "r") handleRepeat();
      if (k === "s") handleSimplify();
      if (k === "n") handleNext();
      if (k === "c") handleCalm();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [moduleName, currentSkill, mode, lastAssistant]);

  const handlePause = () => { try { window.speechSynthesis?.cancel(); } catch {} };
  const handleRepeat = async () => {
    if (!lastAssistant) return;
    try { window.speechSynthesis?.cancel(); await speakInBrowser(lastAssistant, { rate: 0.9 }); } catch {}
  };
  const handleSimplify = () => {};
  const handleNext = () => {
    const next = moduleName === "greeting" ? "emotion" : moduleName === "emotion" ? "routine" : "greeting";
    setModuleName(next as any);
    setCurrentSkill(next === "greeting" ? "greet" : next === "emotion" ? "label_happy" : "wash_hands");
  };

  function driveCalmBreathing(durationMs = 8000) {
    const A: any = (window as any).__AVATAR__;
    if (!A || typeof A.setWeight !== "function") return;
    const has = A._has?.bind(A) ?? (() => false);
    const WIDE = ["jawOpen", "mouthOpen", "viseme_aa", "mouthAa"].find(has) || "jawOpen";
    const ROUND = ["mouthFunnel", "mouthPucker", "viseme_O", "viseme_U"].find(has) || "mouthFunnel";
    const Aamp = 0.9, Bamp = 0.7, F = 0.25, BASE = 0.08;
    const t0 = performance.now();
    let raf = 0;
    const tick = () => {
      const t = (performance.now() - t0) / 1000;
      const s = Math.sin(t * Math.PI * 2 * F);
      A.setWeight(WIDE, Math.max(0, BASE + Aamp * Math.max(0, s)));
      A.setWeight(ROUND, Math.max(0, BASE + Bamp * Math.max(0, -s)));
      if (performance.now() - t0 < durationMs) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    setTimeout(() => cancelAnimationFrame(raf), durationMs + 200);
  }

  const handleCalm = async () => {
    setMode("calm"); setCalmLock(true);
    try { window.speechSynthesis?.cancel(); } catch {}
    try { await speakInBrowser("I am here with you. Let's breathe: in two, out two.", { rate: 0.85 }); } catch {}
    driveCalmBreathing(8000);
    setTimeout(() => setCalmLock(false), 9000);
  };

  const addMasteryLocal = (skill: string, status: MasteryStatus) => {
    const e: MasteryEvent = {
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? (crypto as any).randomUUID() : Math.random().toString(36).slice(2),
      ts: Date.now(), skill, status, rater: "manual",
    };
    setLog((prev) => [e, ...prev].slice(0, 30));
  };

  const handleEndSession = async () => {
    try {
      if (!/^[0-9a-f-]{36}$/i.test(meta.sessionId)) { alert("Session not initialized yet."); return; }
      const res: any = await savePDFToCloud();
      if (!res?.session_id) throw new Error("Upload failed");

      await persistAggregates(res.session_id, {
        child_id: selectedChildId,
        total_turns: aggregates.totalTurns,
        duration_min: aggregates.durationMin,
        words_total: aggregates.wordsTotal,
        avg_attention: aggregates.avgAttention,
        turns_child: aggregates.turnsBySpeaker.child ?? 0,
        turns_therapist: aggregates.turnsBySpeaker.therapist ?? 0,
        turns_assistant: aggregates.turnsBySpeaker.assistant ?? 0,
        turns_parent: aggregates.turnsBySpeaker.parent ?? 0,
      });

      if (res.url) window.open(res.url, "_blank");
      alert("Session saved ✅");
    } catch (e: any) {
      alert(e?.message || "Failed to save session");
    }
  };

  return (
    <main className="h-screen-fix relative overflow-hidden">
      {/* BG */}
      <div className="fixed inset-0 -z-10 bg-fixed-ios">
        <Image src="/site-bg.png" alt="site-bg" fill priority className="object-cover" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/0 via-black/0 to-black/10 dark:from-black/10 dark:via-black/15 dark:to-black/40" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 md:px-6 py-4 border-b border-border bg-card/80 backdrop-blur-sm flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="inline-grid place-items-center h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-400 text-white shadow">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Therapy Avatar</h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              Mode: <b className="text-foreground">{mode}</b> • Module: <b className="text-foreground">{moduleName}</b> • Skill:{" "}
              <b className="text-foreground">{currentSkill}</b>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <div className="hidden md:flex gap-2 text-xs text-muted-foreground">
              {["P: Pause", "R: Repeat", "S: Simplify", "N: Next", "C: Calm"].map((t) => (
                <Tooltip key={t}>
                  <TooltipTrigger asChild><Badge variant="outline">{t.split(":")[0]}</Badge></TooltipTrigger>
                  <TooltipContent>{t.split(":")[1].trim()}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>

          <Button onClick={handleEndSession} disabled={saving || !/^[0-9a-f-]{36}$/i.test(meta.sessionId)} variant="outline">
            {saving ? "Saving…" : "End Session & Save"}
          </Button>
        </div>
      </header>

      {/* Layout */}
      <div className="relative z-10 mx-auto container pad-y gap-6 grid lg:grid-cols-[1fr_400px]">
        {/* Child Area */}
        <section className="space-y-6">
          <Card className="bg-card/90 border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between w-full">
                <span className="text-primary flex items-center gap-2"><Sun className="w-4 h-4" /> Avatar</span>
                <Badge className="bg-amber-400 text-slate-900 dark:text-black">Kid Mode</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="avatar-stage">
                {/* scenic bg */}
                <Image src="/bg.png" alt="" fill priority className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/10 dark:from-black/10 dark:via-black/15 dark:to-black/40" />

                {/* 🔄 SCENARIO RUNNER */}
                <ScenarioRunner
                  scenarioKey={activeScenario}
                  setLastAssistant={setLastAssistant}
                  selectedChildId={selectedChildId || undefined}
                />

                {/* Avatar canvas */}
                <div className="avatar-canvas relative z-10">
                  <Suspense fallback={<div className="h-full grid place-items-center text-muted-foreground">Loading avatar…</div>}>
                    <AvatarCanvas modelUrl="https://models.readyplayer.me/68f9edd6a9529d2d623bdb8b.glb?morphTargets=ARKit" />
                  </Suspense>
                </div>

                {/* Emotion camera — phone: top-right, md+: top-left */}
                <div className="avatar-overlay overlay-smart drop-shadow-md">
                  <div className="cam-box">
                    <Suspense fallback={null}><EmotionTracker /></Suspense>
                  </div>
                </div>

                {/* Mic bubble */}
                <div className="absolute inset-x-0 z-20 pointer-events-none" style={{ bottom: "4%" }}>
                  <div className="flex justify-center">
                    <div className="pointer-events-auto">
                      <AudioRecorder
                        onUserTranscript={(t) => {
                          addTurn({ speaker: "child", text: t, attention: metrics?.attention ?? undefined });
                          if (/^[0-9a-f-]{36}$/i.test(meta.sessionId)) {
                            persistTurn(meta.sessionId, { speaker: "child", text: t, attention: metrics?.attention ?? undefined }).catch(()=>{});
                          }
                        }}
                        onAssistant={(reply) => {
                          setLastAssistant(reply);
                          addTurn({ speaker: "assistant", text: reply });
                          if (/^[0-9a-f-]{36}$/i.test(meta.sessionId)) {
                            persistTurn(meta.sessionId, { speaker: "assistant", text: reply }).catch(()=>{});
                          }
                        }}
                        onProcessingChange={(v) => setProcessing(v)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* caption under avatar */}
              <div className="mt-4">
                <div className="rounded-xl bg-primary/10 dark:bg-primary/20 text-primary px-3 py-2 text-center border border-border">
                  {lastAssistant || "Let's begin our fun activity!"}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scenario selector */}
          <Card className="bg-card/90 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-primary">🎯 Training Scenarios</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeScenario} onValueChange={(v) => setActiveScenario(v as keyof typeof SCENARIOS)}>
                <TabsList className="flex flex-wrap gap-1">
                  <TabsTrigger value="greeting_teacher">Greeting</TabsTrigger>
                  <TabsTrigger value="ask_help">Ask Help</TabsTrigger>
                  <TabsTrigger value="wait_turn">Wait Turn</TabsTrigger>
                  <TabsTrigger value="share_play">Share Play</TabsTrigger>
                  <TabsTrigger value="calm_down">Calm Down</TabsTrigger>
                </TabsList>
                <TabsContent value={activeScenario}>
                  <div className="text-xs text-muted-foreground mt-2">
                    Active: {SCENARIOS[activeScenario].title}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Mastery + Achievements */}
          <Tabs defaultValue="log" className="w-full">
            <TabsList className="bg-card/80 backdrop-blur border border-border">
              <TabsTrigger value="log">Recent Mastery</TabsTrigger>
            </TabsList>
            <TabsContent value="log">
              <Card className="bg-card/90 border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-primary flex items-center gap-2"><Trophy className="w-4 h-4" /> 🏅 Recent Mastery</CardTitle>
                </CardHeader>
                <CardContent>
                  {log.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No entries yet.</p>
                  ) : (
                    <ul className="space-y-1 max-h-44 overflow-auto pr-1 ios-scroll">
                      {log.map((e) => (
                        <li key={e.id} className="text-sm text-foreground flex items-center justify-between">
                          <span>{new Date(e.ts).toLocaleTimeString()} • {e.skill}</span>
                          <span className={e.status === "success" ? "text-emerald-500 font-medium" : "text-foreground"}>{e.status}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-3 flex gap-2 text-xs text-muted-foreground">
                    <Button
                      variant="outline"
                      onClick={() => {
                        addMasteryLocal(currentSkill, "attempted");
                        if (/^[0-9a-f-]{36}$/i.test(meta.sessionId)) {
                          persistMastery(meta.sessionId, currentSkill, "attempted").catch(()=>{});
                        }
                      }}
                    >
                      Mark Attempt
                    </Button>
                    <Button
                      onClick={() => {
                        addMasteryLocal(currentSkill, "success");
                        if (/^[0-9a-f-]{36}$/i.test(meta.sessionId)) {
                          persistMastery(meta.sessionId, currentSkill, "success").catch(()=>{});
                        }
                      }}
                    >
                      Mark Success
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        {/* Therapist Column */}
        <aside className="space-y-6">
          <Card className="bg-card/90 border-border">
            <CardContent className="p-3">
              <TherapistPanel
                disabled={processing || calmLock}
                currentSkill={currentSkill}
                onPause={handlePause}
                onRepeat={handleRepeat}
                onSimplify={handleSimplify}
                onNext={handleNext}
                onCalm={handleCalm}
                onMarkAttempt={(skill) => {
                  addMasteryLocal(skill, "attempted");
                  if (/^[0-9a-f-]{36}$/i.test(meta.sessionId)) persistMastery(meta.sessionId, skill, "attempted").catch(()=>{});
                }}
                onMarkSuccess={(skill) => {
                  addMasteryLocal(skill, "success");
                  if (/^[0-9a-f-]{36}$/i.test(meta.sessionId)) persistMastery(meta.sessionId, skill, "success").catch(()=>{});
                }}
                onAsk={async (q) => {
                  addTurn({ speaker: "therapist", text: q });
                  if (/^[0-9a-f-]{36}$/i.test(meta.sessionId)) {
                    persistTurn(meta.sessionId, { speaker: "therapist", text: q }).catch(()=>{});
                  }
                  try { await speakInBrowser(q, { rate: 0.95 }); } catch {}
                }}
              />
            </CardContent>
          </Card>

          <Card className="bg-card/90 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-primary flex items-center gap-2"><Activity className="w-4 h-4" /> 💡 Engagement Meter</CardTitle>
            </CardHeader>
            <CardContent>
              <EngagementGauge attentionScore={metrics?.engagementScore ?? metrics?.attention ?? 0} />
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                Blink: {metrics?.blink?.toFixed(2) ?? "—"} • Attention: {metrics?.attention?.toFixed(2) ?? "—"}
              </p>
            </CardContent>
          </Card>
        </aside>

        {/* Summary */}
        <div className="lg:col-span-2 justify-self-center w-full max-w-4xl">
          <Card className="bg-card/90 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-primary flex items-center gap-2"><Stars className="w-4 h-4" /> 📝 Session Summary & Report</CardTitle>
            </CardHeader>
            <CardContent>
              <SessionSummaryCSR />
            </CardContent>
          </Card>
        </div>
      </div>

      <footer className="relative z-10 px-4 md:px-6 pb-8 text-center text-xs text-slate-800 dark:text-white">
        Designed for calm, clarity, and play ✨
      </footer>
    </main>
  );
}
