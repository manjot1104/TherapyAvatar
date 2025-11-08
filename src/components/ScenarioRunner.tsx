// src/components/ScenarioRunner.tsx
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

/* -------------------------------------------
   Helpers
-------------------------------------------- */
function splitSides(options: string[]) {
  const L: string[] = [];
  const R: string[] = [];
  options.forEach((o, i) => (i % 2 === 0 ? L.push(o) : R.push(o)));
  return { left: L, right: R };
}

function removeEmojiRough(s: string) {
  return s.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "").trim();
}
function formatOptionsForSpeech(opts: string[]) {
  if (!opts?.length) return "";
  const numbered = opts.map((o, i) => `Option ${i + 1}: ${removeEmojiRough(o).replace(/\s+/g, " ")}`);
  return numbered.join("; ");
}

/* -------------------------------------------
   CloudPill — mobile-first
-------------------------------------------- */
function CloudPill({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={[
        // phones first
        "group relative rounded-[1.5rem] px-3.5 py-2.5 text-[0.95rem] font-semibold",
        "bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white",
        "border border-white/60 dark:border-slate-700 shadow-xl drop-shadow-md",
        "transition-transform active:scale-[0.98]",
        "w-full max-w-full text-center",
        // hover effect only where hover exists
        "supports-[hover:hover]:hover:scale-[1.03]",
        // md+
        "md:rounded-[2rem] md:px-6 md:py-3 md:text-base md:w-auto md:min-w-[190px]",
        "lg:px-7 lg:py-4 lg:text-lg lg:min-w-[210px]",
      ].join(" ")}
    >
      {/* cloud dots only on md+ to avoid clutter */}
      <span className="hidden md:block absolute -left-3 bottom-1.5 w-3.5 h-3.5 rounded-full bg-white/95 dark:bg-slate-900/95 border border-white/60 dark:border-slate-700" />
      <span className="hidden md:block absolute -left-5 bottom-4 w-3 h-3 rounded-full bg-white/95 dark:bg-slate-900/95 border border-white/60 dark:border-slate-700" />
      <span className="hidden md:block absolute -right-2.5 top-1.5 w-3 h-3 rounded-full bg-white/95 dark:bg-slate-900/95 border border-white/60 dark:border-slate-700" />
      <span className="truncate">{text}</span>
    </button>
  );
}

/* -------------------------------------------
   CloudsOverlay
   - <md: bottom "sheet" (grid w/ wrap, scroll, mic-safe)
   - md+: left/right floating columns constrained to edges
-------------------------------------------- */
function CloudsOverlay({
  options,
  onPick,
  visible,
}: {
  options: string[];
  onPick: (txt: string, idx: number) => void;
  visible: boolean;
}) {
  const { left, right } = useMemo(() => splitSides(options), [options]);
  if (!visible || options.length === 0) return null;

  // reserve space for mic bubble (roughly 68–80px) + iOS safe area
  const bottomSafe = `calc(env(safe-area-inset-bottom, 0px) + 76px)`;

  return (
    <div className="pointer-events-none absolute inset-0 z-20" aria-hidden>
      {/* ===== Phones: bottom sheet ===== */}
      <div
        className="md:hidden absolute inset-x-2 bottom-0 flex justify-center pointer-events-none"
        style={{ bottom: bottomSafe }}
      >
        <div
          className={[
            "pointer-events-auto w-full max-w-[560px]",
            "rounded-2xl border border-white/50 dark:border-slate-700",
            "bg-white/82 dark:bg-slate-900/72 backdrop-blur-lg",
            "px-3.5 py-3",
            "grid gap-2.5",
            "xsm-two-col",     // (global utility below)
            "cloud-sheet",     // (global utility below)
          ].join(" ")}
        >
          {options.map((opt, idx) => (
            <div
              key={`M-${idx}`}
              className="sr-float1"         // (global animation below)
              style={{ animationDelay: `${idx * 0.12}s` }}
            >
              <CloudPill text={opt} onClick={() => onPick(opt, idx)} />
            </div>
          ))}
        </div>
      </div>

      {/* ===== Tablet/Desktop: side columns kept to edges ===== */}
      <div className="hidden md:block">
        {/* left column (never wider than 42% so center stays clear) */}
        <div className="absolute inset-y-0 left-2 md:left-4 lg:left-6 flex flex-col justify-center gap-3 lg:gap-4 pointer-events-auto max-w-[42%]">
          {left.map((opt, idx) => (
            <div
              key={`L-${idx}`}
              className="sr-float1"
              style={{ animationDelay: `${idx * 0.18}s` }}
            >
              <CloudPill text={opt} onClick={() => onPick(opt, idx * 2)} />
            </div>
          ))}
        </div>
        {/* right column */}
        <div className="absolute inset-y-0 right-2 md:right-4 lg:right-6 flex flex-col justify-center items-end gap-3 lg:gap-4 pointer-events-auto max-w-[42%]">
          {right.map((opt, idx) => (
            <div
              key={`R-${idx}`}
              className="sr-float2"
              style={{ animationDelay: `${idx * 0.18}s` }}
            >
              <CloudPill text={opt} onClick={() => onPick(opt, idx * 2 + 1)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------
   Main runner
-------------------------------------------- */
export default function ScenarioRunner({
  scenarioKey,
  setLastAssistant,
  selectedChildId,
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

  /* who owns data (auth user) */
  useEffect(() => {
    (async () => {
      const { data: { user } } = await sb.auth.getUser();
      setOwnerId(user?.id ?? null);
    })();
  }, [sb]);

  /* react to selected child change */
  useEffect(() => {
    if (selectedChildId !== undefined) setChildId(selectedChildId ?? null);
  }, [selectedChildId]);

  /* resume progress */
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
        setBlockIdx(0);
        setTotalStars(0);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerId, scenarioKey, childId]);

  /* speak question THEN options; show clouds after speech */
  useEffect(() => {
    (async () => {
      const prompt = q.prompt;
      setLastAssistant(prompt);
      setShowOptions(false);

      try {
        if (!speaking.current) {
          speaking.current = true;

          // 1) ask the question
          await speakInBrowser(prompt, { rate: 0.96 });

          // 2) read the options
          const optsSpeech = formatOptionsForSpeech(q.options);
          if (optsSpeech) {
            await speakInBrowser(`Choose one. ${optsSpeech}`, { rate: 0.96 });
          }

          speaking.current = false;
        }
      } catch {
        speaking.current = false;
      }

      // show clouds only after TTS is done (clean UX)
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
  const insertAttempt = async (
    blockIndex: number,
    stars: number,
    passed: boolean,
    answers: number
  ) => {
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

  /* child picked an option */
  const handlePick = async (optText: string, optIndex: number) => {
    // log child choice
    addTurn({ speaker: "child", text: optText });
    if (/^[0-9a-f-]{36}$/i.test(meta.sessionId)) {
      persistTurn(meta.sessionId, { speaker: "child", text: optText }).catch(() => {});
    }

    const correct = optIndex === q.correctIndex;
    if (correct) setAnswersCorrect((c) => c + 1);

    try {
      await speakInBrowser(correct ? "Good job!" : "Okay, let's try the next one.", { rate: 0.98 });
    } catch {}

    // more questions in this block?
    if (qIdx < 2) {
      setQIdx((i) => i + 1);
      return;
    }

    // block finished
    const stars = answersCorrect + (correct ? 1 : 0); // 0..3
    const passed = stars >= 2;
    const newTotal = totalStars + stars;

    // mastery record on pass
    if (passed && /^[0-9a-f-]{36}$/i.test(meta.sessionId)) {
      persistMastery(meta.sessionId, `${scenario.skillLabel} • ${block.title}`, "success").catch(() => {});
    }

    // audit attempt
    await insertAttempt(blockIdx, stars, passed, answersCorrect + (correct ? 1 : 0));

    const nextBlock = passed ? Math.min(blockIdx + 1, scenario.blocks.length - 1) : blockIdx;
    await saveProgress(nextBlock, newTotal);

    // reset counters, move block if passed
    setTotalStars(newTotal);
    setAnswersCorrect(0);
    setQIdx(0);
    setBlockIdx(nextBlock);
  };

  return (
    <>
      {/* HUD (top-right) */}
      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-30 flex flex-wrap items-center gap-1 sm:gap-2">
        <Badge variant="outline" className="bg-white/70 backdrop-blur text-xs sm:text-sm">
          {scenario.title}
        </Badge>
        <Badge variant="outline" className="text-xs sm:text-sm">
          Block {blockIdx + 1}/{scenario.blocks.length}
        </Badge>
        <div className="inline-flex items-center gap-1 text-amber-500 text-xs sm:text-sm font-medium">
          <Star size={16} /> {totalStars}
        </div>
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2 text-xs sm:h-8 sm:px-3 sm:text-sm"
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

      {/* Floating answer options */}
      <CloudsOverlay options={q.options} visible={showOptions} onPick={handlePick} />
    </>
  );
}
