"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { SCENARIOS } from "@/data/scenarios";
import { speakInBrowser } from "@/lib/speak";
import { createClient } from "@/lib/supabase/browser-client";
import { useSession } from "@/components/SessionSummary";
import { persistTurn, persistMastery } from "@/lib/session-persist";

/* ---------- clouds UI ---------- */
function splitSides(options: string[]) {
  const L: string[] = [], R: string[] = [];
  options.forEach((o, i) => (i % 2 === 0 ? L.push(o) : R.push(o)));
  return { left: L, right: R };
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
function CloudsOverlay({
  options, onPick, visible,
}: { options: string[]; onPick: (txt: string, idx: number) => void; visible: boolean; }) {
  const { left, right } = useMemo(() => splitSides(options), [options]);
  if (!visible || options.length === 0) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-20" aria-hidden>
      <div className="absolute inset-y-0 left-2 sm:left-4 md:left-6 flex flex-col justify-center gap-3 pointer-events-auto">
        {left.map((opt, idx) => (
          <div key={`L-${idx}`} className="animate-[float1_5s_ease-in-out_infinite]" style={{ animationDelay: `${idx * 0.18}s` }}>
            <CloudPill text={opt} onClick={() => onPick(opt, idx * 2)} />
          </div>
        ))}
      </div>
      <div className="absolute inset-y-0 right-2 sm:right-4 md:right-6 flex flex-col justify-center items-end gap-3 pointer-events-auto">
        {right.map((opt, idx) => (
          <div key={`R-${idx}`} className="animate-[float2_5.4s_ease-in-out_infinite]" style={{ animationDelay: `${idx * 0.18}s` }}>
            <CloudPill text={opt} onClick={() => onPick(opt, idx * 2 + 1)} />
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

/* ---------- runner ---------- */
export default function ScenarioRunner({
  scenarioKey,
  setLastAssistant,
  selectedChildId,              // <-- OPTIONAL: pass child id if you have
}: {
  scenarioKey: keyof typeof SCENARIOS;
  setLastAssistant: (q: string) => void;
  selectedChildId?: string | null;
}) {
  const scenario = SCENARIOS[scenarioKey];
  const sb = useMemo(() => createClient(), []);
  const { meta, addTurn } = useSession();

  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [childId, setChildId] = useState<string | null>(selectedChildId ?? null);

  const [blockIdx, setBlockIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [answersCorrect, setAnswersCorrect] = useState(0);
  const [totalStars, setTotalStars] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const speaking = useRef(false);

  const block = scenario.blocks[blockIdx];
  const questions = block.questions.slice(0, 3);
  const q = questions[qIdx];

  /* get owner (auth user) */
  useEffect(() => {
    (async () => {
      const { data: { user } } = await sb.auth.getUser();
      setOwnerId(user?.id ?? null);
    })();
  }, [sb]);

  /* (optional) react to prop change for child */
  useEffect(() => {
    if (selectedChildId !== undefined) setChildId(selectedChildId ?? null);
  }, [selectedChildId]);

  /* RESUME: load scenario_progress */
  useEffect(() => {
    (async () => {
      if (!ownerId) return;
      const { data } = await sb
        .from("scenario_progress")
        .select("current_block,total_points")
        .eq("owner_id", ownerId)
        .eq("scenario_key", scenarioKey)
        .eq("child_id", childId ?? null)
        .maybeSingle();

      if (data) {
        const b = Math.max(0, Math.min(scenario.blocks.length - 1, data.current_block ?? 0));
        setBlockIdx(b);
        setTotalStars(Math.max(0, data.total_points ?? 0));
      } else {
        // no row yet → start fresh
        setBlockIdx(0);
        setTotalStars(0);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerId, scenarioKey, childId]);

  /* speak question + show options */
  useEffect(() => {
    (async () => {
      const prompt = q.prompt;
      setLastAssistant(prompt);
      setShowOptions(false);
      try {
        if (!speaking.current) {
          speaking.current = true;
          await speakInBrowser(prompt, { rate: 0.96 });
          speaking.current = false;
        }
      } catch {
        speaking.current = false;
      }
      setShowOptions(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockIdx, qIdx]);

  /* save (upsert) scenario_progress */
  const saveProgress = async (nextBlock: number, newTotal: number) => {
    if (!ownerId) return;
    await sb.from("scenario_progress").upsert(
      {
        owner_id: ownerId,
        child_id: childId ?? null,
        scenario_key: scenarioKey,
        current_block: nextBlock,
        total_points: newTotal,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "owner_id,child_id,scenario_key" }
    );
  };

  /* audit block attempt */
  const insertAttempt = async (blockIndex: number, stars: number, passed: boolean, answers: number) => {
    if (!ownerId) return;
    await sb.from("scenario_block_attempts").insert({
      owner_id: ownerId,
      session_id: /^[0-9a-f-]{36}$/i.test(meta.sessionId) ? meta.sessionId : null,
      child_id: childId ?? null,
      scenario_key: scenarioKey,
      block_index: blockIndex,
      answers_correct: answers,
      stars_earned: stars,
      passed,
    });
  };

  const handlePick = async (optText: string, optIndex: number) => {
    // log child choice
    addTurn({ speaker: "child", text: optText });
    if (/^[0-9a-f-]{36}$/i.test(meta.sessionId)) {
      persistTurn(meta.sessionId, { speaker: "child", text: optText }).catch(() => {});
    }

    const correct = optIndex === q.correctIndex;
    if (correct) setAnswersCorrect((c) => c + 1);

    try { await speakInBrowser(correct ? "Good job!" : "Okay, let's try the next one."); } catch {}

    // more questions in this block?
    if (qIdx < 2) { setQIdx((i) => i + 1); return; }

    // end of block
    const stars = answersCorrect + (correct ? 1 : 0); // 0..3
    const passed = stars >= 2;
    const newTotal = totalStars + stars;

    // mastery on pass
    if (passed && /^[0-9a-f-]{36}$/i.test(meta.sessionId)) {
      persistMastery(meta.sessionId, `${scenario.skillLabel} • ${block.title}`, "success").catch(() => {});
    }

    // audit attempt
    await insertAttempt(blockIdx, stars, passed, answersCorrect + (correct ? 1 : 0));

    const nextBlock = passed ? Math.min(blockIdx + 1, scenario.blocks.length - 1) : blockIdx;
    await saveProgress(nextBlock, newTotal);

    // reset for next round
    setTotalStars(newTotal);
    setAnswersCorrect(0);
    setQIdx(0);
    setBlockIdx(nextBlock);
  };

  return (
    <>
      {/* HUD */}
      <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
        <Badge variant="outline" className="bg-white/70 backdrop-blur">{scenario.title}</Badge>
        <Badge variant="outline">Block {blockIdx + 1}/{scenario.blocks.length}</Badge>
        <div className="inline-flex items-center gap-1 text-amber-500 text-sm font-medium"><Star size={16}/> {totalStars}</div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setBlockIdx(0);
            setQIdx(0);
            setTotalStars(0);
            setAnswersCorrect(0);
            saveProgress(0, 0);
          }}
        >
          Reset
        </Button>
      </div>

      {/* Floating options inside avatar */}
      <CloudsOverlay options={q.options} visible={showOptions} onPick={handlePick} />
    </>
  );
}
