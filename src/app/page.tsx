// src/app/page.tsx — Site-wide scenic background + Avatar-side Answer Clouds + Auto-questions
"use client";

import React, { useEffect, useMemo, useRef, useState, Suspense } from "react";
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

// ✅ Auto-asking predefined questions
import PredefinedQuestionsAuto, {
  PredefinedQuestionsAutoHandle,
} from "@/components/PredefinedQuestionsAuto";

// Session Summary (Provider + hook) + CSR-only visual widget (avoid hydration issues)
import { SessionProvider, useSession } from "@/components/SessionSummary";
const SessionSummaryCSR = dynamic(
  () => import("@/components/SessionSummary").then((m) => m.default),
  { ssr: false }
);

// 3D avatar (disable SSR)
const AvatarCanvas = dynamic(() => import("@/components/AvatarCanvas"), {
  ssr: false,
  loading: () => <div className="h-[520px] grid place-items-center text-muted-foreground">Loading avatar…</div>,
});

// Emotion & gaze tracker (disable SSR)
const EmotionTracker = dynamic(() => import("@/components/EmotionTracker"), {
  ssr: false,
  loading: () => <div className="text-sm text-muted-foreground">Starting camera…</div>,
});

// ---------------- Types ----------------
type MasteryStatus = "attempted" | "success";
type MasteryEvent = {
  id: string;
  ts: number;
  skill: string;
  status: MasteryStatus;
  rater: "manual";
};

// ---------- Provider wrapper ----------
export default function HomePage() {
  return (
    <SessionProvider
      initialMeta={{
        sessionId: "SSN-000123",
        sessionDateISO: "2025-10-23T06:00:00.000Z",
        clientName: "Ridhaan",
        therapistName: "Dr. Priyanka Kalra",
        sessionTitle: "Session Summary & Report",
      }}
    >
      <PageBody />
    </SessionProvider>
  );
}

/* ==================== Answer Cloud Helpers ==================== */

function suggestOptions(q: string): string[] {
  const t = q.toLowerCase();
  if (/(how are you|how do you feel|feeling|mood)/i.test(t)) {
    return ["Good 😊", "Okay 🙂", "Bad 😕", "I need help 🆘"];
  }
  if (/^(can|shall|should|do|did|are|is|will|would|could|may)\b/i.test(t) || /\?\s*$/.test(t)) {
    return ["Yes 👍", "No 👎"];
  }
  if (/(do you want|would you like|pick|choose|prefer)/i.test(t)) {
    return ["This one 👉", "That one 👈"];
  }
  if (/(how does this make you feel|what emotion)/i.test(t)) {
    return ["Happy 😀", "Sad 😔", "Angry 😠", "Scared 😨"];
  }
  return ["I know ✅", "I don't know 🤔"];
}

function splitSides(options: string[]) {
  const left: string[] = [];
  const right: string[] = [];
  options.forEach((opt, i) => (i % 2 === 0 ? left.push(opt) : right.push(opt)));
  return { left, right };
}

function CloudPill({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group relative px-4 py-2 rounded-2xl bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white border border-white/60 dark:border-slate-700 shadow-lg hover:scale-[1.03] transition-transform"
    >
      <span className="absolute -left-2 bottom-1 w-3 h-3 rounded-full bg-white/90 dark:bg-slate-900/90 border border-white/60 dark:border-slate-700" />
      <span className="absolute -left-4 bottom-3 w-2.5 h-2.5 rounded-full bg-white/90 dark:bg-slate-900/90 border border-white/60 dark:border-slate-700" />
      <span className="absolute -right-2 top-1 w-2.5 h-2.5 rounded-full bg-white/90 dark:bg-slate-900/90 border border-white/60 dark:border-slate-700" />
      <span className="font-medium">{text}</span>
    </button>
  );
}

function AnswerClouds({
  question,
  visible,
  onPick,
}: {
  question: string;
  visible: boolean;
  onPick: (answer: string) => void;
}) {
  const options = useMemo(() => suggestOptions(question), [question]);
  const { left, right } = useMemo(() => splitSides(options), [options]);
  if (!visible || options.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20" aria-hidden>
      {/* left column */}
      <div className="absolute inset-y-0 left-2 sm:left-4 md:left-6 flex flex-col justify-center gap-3 pointer-events-auto">
        {left.map((opt, idx) => (
          <div key={`L-${idx}`} className="animate-[float1_5s_ease-in-out_infinite]" style={{ animationDelay: `${idx * 0.18}s` }}>
            <CloudPill text={opt} onClick={() => onPick(opt)} />
          </div>
        ))}
      </div>

      {/* right column */}
      <div className="absolute inset-y-0 right-2 sm:right-4 md:right-6 flex flex-col justify-center items-end gap-3 pointer-events-auto">
        {right.map((opt, idx) => (
          <div key={`R-${idx}`} className="animate-[float2_5.4s_ease-in-out_infinite]" style={{ animationDelay: `${idx * 0.18}s` }}>
            <CloudPill text={opt} onClick={() => onPick(opt)} />
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes float1 { 0% { transform: translateY(0px); } 50% { transform: translateY(-6px); } 100% { transform: translateY(0px); } }
        @keyframes float2 { 0% { transform: translateY(0px); } 50% { transform: translateY(7px); } 100% { transform: translateY(0px); } }
      `}</style>
    </div>
  );
}

/* ==================== Page Body ==================== */

function PageBody() {
  const session = useSession();

  const [processing, setProcessing] = useState(false);
  const [mode, setMode] = useState<"normal" | "calm">("normal");
  const [moduleName, setModuleName] = useState<"greeting" | "emotion" | "routine">("greeting");
  const [currentSkill, setCurrentSkill] = useState<string>("greet");
  const [lastAssistant, setLastAssistant] = useState<string>("");
  const [calmLock, setCalmLock] = useState(false);
  const [log, setLog] = useState<MasteryEvent[]>([]);
  const metrics = useGazeWS();

  // ✅ Predefined Questions ref (to advance when answered)
  const qaRef = useRef<PredefinedQuestionsAutoHandle>(null);

  // show clouds when we detect a question from assistant
  const [showClouds, setShowClouds] = useState(false);
  const lastQRef = useRef<string>("");

  // hotkeys
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

  // Detect “question-like” assistant turns and show clouds
  useEffect(() => {
    const q = lastAssistant?.trim();
    if (!q) { setShowClouds(false); return; }
    const seemsQuestion =
      /\?\s*$/.test(q) ||
      /(how|what|why|who|when|where|which|would|could|should|do you|are you|can you)\b/i.test(q);

    if (seemsQuestion && q !== lastQRef.current) {
      lastQRef.current = q;
      setShowClouds(true);
    }
  }, [lastAssistant]);

  // handlers
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
    setMode("calm");
    setCalmLock(true);
    try { window.speechSynthesis?.cancel(); } catch {}
    try { await speakInBrowser("I am here with you. Let's breathe: in two, out two.", { rate: 0.85 }); } catch {}
    driveCalmBreathing(8000);
    setTimeout(() => setCalmLock(false), 9000);
  };

  const addMastery = (skill: string, status: MasteryStatus) => {
    const e: MasteryEvent = {
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? (crypto as any).randomUUID() : Math.random().toString(36).slice(2),
      ts: Date.now(),
      skill,
      status,
      rater: "manual",
    };
    setLog((prev) => [e, ...prev].slice(0, 30));
  };

  // When a cloud is chosen -> log + speak + advance next Q
  const handlePick = async (answer: string) => {
    setShowClouds(false);
    session.addTurn({ speaker: "child", text: answer, attention: metrics?.attention ?? undefined });
    try { await speakInBrowser(answer, { rate: 0.98 }); } catch {}
    qaRef.current?.childAnswered(); // ✅ move to next predefined question
  };

  // (Optional) separate handler for TherapistPanel.onAsk to avoid inline any
  const handleAsk = async (q: string): Promise<void> => {
    session.addTurn({ speaker: "therapist", text: q });
    try { await speakInBrowser(q, { rate: 0.95 }); } catch {}
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* 🔵 SITE-WIDE BACKGROUND (fixed behind everything) */}
      <div className="fixed inset-0 -z-10">
        <Image src="/site-bg.png" alt="site-bg" fill priority className="object-cover" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/0 via-black/0 to-black/10 dark:from-black/10 dark:via-black/15 dark:to-black/40" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-4 border-b border-border bg-card/80 backdrop-blur-sm flex flex-wrap items-center justify-between gap-3 shadow-sm">
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

        {/* Shortcuts helper */}
        <TooltipProvider>
          <div className="hidden md:flex gap-2 text-xs text-muted-foreground">
            {["P: Pause", "R: Repeat", "S: Simplify", "N: Next", "C: Calm"].map((t) => (
              <Tooltip key={t}>
                <TooltipTrigger asChild>
                  <Badge variant="outline">{t.split(":")[0]}</Badge>
                </TooltipTrigger>
                <TooltipContent>{t.split(":")[1].trim()}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </header>

      {/* Main Layout */}
      <div className="relative z-10 mx-auto max-w-7xl p-4 md:p-6 grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* 👦 Child Area */}
        <section className="space-y-6">
          {/* Avatar card with scenic BG + AnswerClouds overlay */}
          <Card className="bg-card/90 border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between w-full">
                <span className="text-primary flex items-center gap-2">
                  <Sun className="w-4 h-4" /> Avatar
                </span>
                <Badge className="bg-amber-400 text-slate-900 dark:text-black">Kid Mode</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative rounded-2xl overflow-hidden ring-1 ring-border">
                {/* avatar-area background */}
                <Image src="/bg.png" alt="" fill priority className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/10 dark:from-black/10 dark:via-black/15 dark:to-black/40" />

                {/* ✅ Auto-questions */}
                <PredefinedQuestionsAuto
                  ref={qaRef}
                  setLastAssistant={setLastAssistant}
                  startOnMount={true}
                  rate={0.95}
                  lang="en-IN"
                />

                {/* Answer clouds overlay (shows when assistant asks a question) */}
                <AnswerClouds
                  question={lastAssistant}
                  visible={!!lastAssistant && !processing && !calmLock && showClouds}
                  onPick={handlePick}
                />

                {/* Avatar canvas */}
                <div className="relative z-10" style={{ width: "100%", height: 660 }}>
                  <Suspense fallback={<div className="h-full grid place-items-center text-muted-foreground">Loading avatar…</div>}>
                    <AvatarCanvas modelUrl="https://models.readyplayer.me/68f9edd6a9529d2d623bdb8b.glb?morphTargets=ARKit" />
                  </Suspense>
                </div>

                {/* Emotion camera small tile */}
                <div className="absolute top-4 left-4 drop-shadow-md z-20">
                  <div className="scale-75 origin-top-left">
                    <Suspense fallback={null}>
                      <EmotionTracker />
                    </Suspense>
                  </div>
                </div>

                {/* Mic bubble */}
                <div className="absolute inset-x-0 z-20 pointer-events-none" style={{ bottom: "4%" }}>
                  <div className="flex justify-center">
                    <div className="pointer-events-auto">
                      <AudioRecorder
                        onUserTranscript={(t) => {
                          session.addTurn({
                            speaker: "child",
                            text: t,
                            attention: metrics?.attention ?? undefined,
                          });
                          setShowClouds(false);
                          qaRef.current?.childAnswered(); // ✅ voice answer advances
                        }}
                        onAssistant={(reply) => {
                          setLastAssistant(reply);
                          session.addTurn({ speaker: "assistant", text: reply });
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

          {/* Mastery + Achievements */}
          <Tabs defaultValue="log" className="w-full">
            <TabsList className="bg-card/80 backdrop-blur border border-border">
              <TabsTrigger value="log">Recent Mastery</TabsTrigger>
            </TabsList>
            <TabsContent value="log">
              <Card className="bg-card/90 border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-primary flex items-center gap-2">
                    <Trophy className="w-4 h-4" /> 🏅 Recent Mastery
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {log.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No entries yet.</p>
                  ) : (
                    <ul className="space-y-1 max-h-44 overflow-auto pr-1">
                      {log.map((e) => (
                        <li key={e.id} className="text-sm text-foreground flex items-center justify-between">
                          <span>{new Date(e.ts).toLocaleTimeString()} • {e.skill}</span>
                          <span className={e.status === "success" ? "text-emerald-500 font-medium" : "text-foreground"}>{e.status}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-3 flex gap-2 text-xs text-muted-foreground">
                    <Button variant="outline" onClick={() => addMastery(currentSkill, "attempted")}>
                      Mark Attempt
                    </Button>
                    <Button onClick={() => addMastery(currentSkill, "success")}>Mark Success</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        {/* 🧑‍⚕️ Therapist Column */}
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
                onMarkAttempt={(skill) => addMastery(skill, "attempted")}
                onMarkSuccess={(skill) => addMastery(skill, "success")}
                onAsk={handleAsk}
              />
            </CardContent>
          </Card>

          <Card className="bg-card/90 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-primary flex items-center gap-2">
                <Activity className="w-4 h-4" /> 💡 Engagement Meter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EngagementGauge attentionScore={metrics?.engagementScore ?? metrics?.attention ?? 0} />
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                Blink: {metrics?.blink?.toFixed(2) ?? "—"} • Attention: {metrics?.attention?.toFixed(2) ?? "—"}
              </p>
            </CardContent>
          </Card>
        </aside>

        {/* 📝 Centered Session Summary (spans both columns, centered) */}
        <div className="lg:col-span-2 justify-self-center w-full max-w-4xl">
          <Card className="bg-card/90 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-primary flex items-center gap-2">
                <Stars className="w-4 h-4" /> 📝 Session Summary & Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SessionSummaryCSR />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* High-contrast footer text */}
      <footer className="relative z-10 px-6 pb-8 text-center text-xs text-slate-800 dark:text-white">
        Designed for calm, clarity, and play ✨
      </footer>
    </main>
  );
}
