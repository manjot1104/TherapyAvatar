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

/* -------------------------------------------
   Types
-------------------------------------------- */
type OptionStatus = "idle" | "correct" | "wrong";

type QuestionAttemptRow = {
  block_index: number;
  question_index: number;
  option_index: number;
  is_correct: boolean;
};

/* -------------------------------------------
   CloudPill — mobile-first
-------------------------------------------- */
function CloudPill({
  text,
  onClick,
  status = "idle",
  disabled = false,
}: {
  text: string;
  onClick: () => void;
  status?: OptionStatus;
  disabled?: boolean;
}) {
  const isCorrect = status === "correct";
  const isWrong = status === "wrong";

  const base =
    "group relative rounded-[1.5rem] px-3.5 py-2.5 text-[0.95rem] font-semibold border shadow-xl drop-shadow-md transition-all active:scale-[0.98] w-full max-w-full text-center supports-[hover:hover]:hover:scale-[1.03] md:rounded-[2rem] md:px-6 md:py-3 md:text-base md:w-auto md:min-w-[190px] lg:px-7 lg:py-4 lg:text-lg lg:min-w-[210px]";

  const idleCls =
    "bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white border-white/60 dark:border-slate-700";
  const okCls = "bg-green-500/90 text-white border-green-600";
  const badCls = "bg-red-500/90 text-white border-red-600";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        base,
        "transition-colors duration-300",
        isCorrect ? okCls : isWrong ? badCls : idleCls,
        disabled ? "opacity-95 cursor-not-allowed" : "",
      ].join(" ")}
    >
      {/* Cloud dots only when idle so feedback colors look clean */}
      {status === "idle" && (
        <>
          <span className="hidden md:block absolute -left-3 bottom-1.5 w-3.5 h-3.5 rounded-full bg-white/95 dark:bg-slate-900/95 border border-white/60 dark:border-slate-700" />
          <span className="hidden md:block absolute -left-5 bottom-4 w-3 h-3 rounded-full bg-white/95 dark:bg-slate-900/95 border border-white/60 dark:border-slate-700" />
          <span className="hidden md:block absolute -right-2.5 top-1.5 w-3 h-3 rounded-full bg-white/95 dark:bg-slate-900/95 border border-white/60 dark:border-slate-700" />
        </>
      )}
      <span className="truncate">{text}</span>
    </button>
  );
}

/* -------------------------------------------
   CloudsOverlay
-------------------------------------------- */
function CloudsOverlay({
  options,
  onPick,
  visible,
  statuses,
  locked,
  visibleCount,
}: {
  options: string[];
  onPick: (txt: string, idx: number) => void;
  visible: boolean;
  statuses: OptionStatus[];
  locked: boolean;
  visibleCount: number;
}) {
  const { left, right } = useMemo(() => splitSides(options), [options]);
  if (!visible || options.length === 0) return null;

  const bottomSafe = `calc(env(safe-area-inset-bottom, 0px) + 76px)`;

  return (
    <div className="pointer-events-none absolute inset-0 z-20" aria-hidden>
      {/* Phones: bottom sheet */}
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
            "xsm-two-col",
            "cloud-sheet",
          ].join(" ")}
        >
          {options.map((opt, idx) =>
            idx < visibleCount ? (
              <div key={`M-${idx}`} className="sr-float1" style={{ animationDelay: `${idx * 0.08}s` }}>
                <CloudPill
                  text={opt}
                  status={statuses[idx] ?? "idle"}
                  disabled={locked}
                  onClick={() => !locked && onPick(opt, idx)}
                />
              </div>
            ) : (
              <div key={`M-${idx}`} />
            )
          )}
        </div>
      </div>

      {/* Tablet/Desktop: stacks farther from center */}
      <div className="hidden md:block">
        {/* LEFT */}
        <div
          className={[
            "absolute pointer-events-auto flex flex-col items-end",
            "gap-5 lg:gap-6",
            "top-[60%] -translate-y-1/2",
            "right-[60%] md:right-[59%] lg:right-[58%] xl:right-[57%]",
            "max-w-[300px] md:max-w-[320px]",
          ].join(" ")}
        >
          {left.map((opt, idx) => {
            const realIndex = idx * 2;
            if (realIndex >= visibleCount) return <div key={`L-${idx}`} />;
            return (
              <div
                key={`L-${idx}`}
                className="sr-float1"
                style={{
                  animationDelay: `${idx * 0.12}s`,
                  transform: `translateY(${idx * 3}px)`,
                }}
              >
                <CloudPill
                  text={opt}
                  status={statuses[realIndex] ?? "idle"}
                  disabled={locked}
                  onClick={() => !locked && onPick(opt, realIndex)}
                />
              </div>
            );
          })}
        </div>

        {/* RIGHT */}
        <div
          className={[
            "absolute pointer-events-auto flex flex-col items-start",
            "gap-5 lg:gap-6",
            "top-[60%] -translate-y-1/2",
            "left-[60%] md:left-[59%] lg:left-[58%] xl:left-[57%]",
            "max-w-[300px] md:max-w-[320px]",
          ].join(" ")}
        >
          {right.map((opt, idx) => {
            const realIndex = idx * 2 + 1;
            if (realIndex >= visibleCount) return <div key={`R-${idx}`} />;
            return (
              <div
                key={`R-${idx}`}
                className="sr-float2"
                style={{
                  animationDelay: `${idx * 0.12}s`,
                  transform: `translateY(${idx * 3}px)`,
                }}
              >
                <CloudPill
                  text={opt}
                  status={statuses[realIndex] ?? "idle"}
                  disabled={locked}
                  onClick={() => !locked && onPick(opt, realIndex)}
                />
              </div>
            );
          })}
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

  // Stars from passed blocks (legacy points)
  const [totalStars, setTotalStars] = useState(0);

  // Running totals from attempts (for child profile)
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);

  // Per-block correct answers (for star calc 0..3)
  const [blockCorrect, setBlockCorrect] = useState(0);

  const [showOptions, setShowOptions] = useState(false);
  const speaking = useRef(false);

  // UI feedback + progressive reveal
  const [optionStatuses, setOptionStatuses] = useState<OptionStatus[]>([]);
  const [locked, setLocked] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);
  const ttsToken = useRef(0);

  const block = scenario.blocks[blockIdx];
  const questions = block.questions.slice(0, 3);
  const q = questions[qIdx];

  /* auth owner */
  useEffect(() => {
    (async () => {
      const {
        data: { user },
        error,
      } = await sb.auth.getUser();
      if (error) console.error("auth.getUser error:", error);
      setOwnerId(user?.id ?? null);
    })();
  }, [sb]);

  /* react to selected child change */
  useEffect(() => {
    if (selectedChildId !== undefined) setChildId(selectedChildId ?? null);
  }, [selectedChildId]);

  /* --------- Resume progress & totals from attempts (and points) --------- */
  useEffect(() => {
    (async () => {
      if (!ownerId) return;

      // 1) Load historical attempts for this child+scenario (NULL-safe child filter)
      let q1 = sb
        .from("scenario_question_attempts")
        .select("block_index,question_index,option_index,is_correct")
        .eq("owner_id", ownerId)
        .eq("scenario_key", scenarioKey)
        .order("block_index", { ascending: true })
        .order("question_index", { ascending: true });

      q1 = childId ? q1.eq("child_id", childId) : q1.is("child_id", null);

      const { data: attempts, error: attemptsErr } = await q1;
      if (attemptsErr) console.error("Load attempts error:", attemptsErr);

      const list: QuestionAttemptRow[] = attempts ?? [];

      // Totals
      let answered = 0;
      let correct = 0;
      const answeredSet = new Set<string>();
      for (const a of list) {
        const key = `${a.block_index}:${a.question_index}`;
        answeredSet.add(key);
        answered += 1;
        if (a.is_correct) correct += 1;
      }
      setTotalAnswered(answered);
      setTotalCorrect(correct);

      // Next unanswered
      let nextB = 0;
      let nextQ = 0;
      let found = false;
      for (let b = 0; b < scenario.blocks.length && !found; b++) {
        const qs = scenario.blocks[b].questions.slice(0, 3);
        for (let qi = 0; qi < qs.length; qi++) {
          const k = `${b}:${qi}`;
          if (!answeredSet.has(k)) {
            nextB = b;
            nextQ = qi;
            found = true;
            break;
          }
        }
      }
      if (!found) {
        // everything answered at least once; restart last block
        nextB = Math.min(scenario.blocks.length - 1, 0);
        nextQ = 0;
      }
      setBlockIdx(nextB);
      setQIdx(nextQ);
      setBlockCorrect(0); // reset per-block counter

      // 2) Load legacy stars/points (optional)
      let q2 = sb
        .from("scenario_progress")
        .select("total_points")
        .eq("owner_id", ownerId)
        .eq("scenario_key", scenarioKey);

      q2 = childId ? q2.eq("child_id", childId) : q2.is("child_id", null);

      const { data: progress, error: progErr } = await q2.maybeSingle();
      if (progErr) console.error("Load progress error:", progErr);

      setTotalStars(Math.max(0, progress?.total_points ?? 0));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerId, scenarioKey, childId]);

  /* reset per-question UI */
  useEffect(() => {
    setOptionStatuses(Array(q.options.length).fill("idle"));
    setLocked(false);
    setVisibleCount(0);
  }, [blockIdx, qIdx, q.options.length]);

  /* reset per-block correct counter when entering the first question */
  useEffect(() => {
    if (qIdx === 0) setBlockCorrect(0);
  }, [blockIdx, qIdx]);

  /* Speak question, then reveal/speak options one by one — wait for ownerId */
  useEffect(() => {
    (async () => {
      if (!ownerId) return; // do not proceed until auth is ready
      const prompt = q.prompt;
      setLastAssistant(prompt);
      setShowOptions(false);

      const myToken = ++ttsToken.current;

      try {
        if (!speaking.current) {
          speaking.current = true;

          await speakInBrowser(prompt, { rate: 0.96 });
          if (ttsToken.current !== myToken) throw new Error("stale");

          await speakInBrowser("Choose one.", { rate: 0.96 });
          if (ttsToken.current !== myToken) throw new Error("stale");

          setShowOptions(true);

          for (let i = 0; i < q.options.length; i++) {
            if (ttsToken.current !== myToken) throw new Error("stale");
            setVisibleCount(i + 1);
            const spoken = `Option ${i + 1}: ${removeEmojiRough(q.options[i]).replace(/\s+/g, " ")}`;
            await speakInBrowser(spoken, { rate: 0.96 });
            if (ttsToken.current !== myToken) throw new Error("stale");
            await new Promise((r) => setTimeout(r, 60));
          }
        }
      } catch {
        // ignore stale/cancel
      } finally {
        speaking.current = false;
        setShowOptions(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerId, blockIdx, qIdx]);

  /* save (upsert) scenario_progress — ONLY when child is selected */
  const saveProgress = async (nextBlock: number, newTotalPoints: number) => {
    if (!ownerId) return;
    if (!childId) return; // prevent PK clash when child not selected
    const { error } = await sb.from("scenario_progress").upsert(
      {
        owner_id: ownerId,
        child_id: childId,
        scenario_key: scenarioKey,
        current_block: nextBlock,
        total_points: newTotalPoints,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "owner_id,child_id,scenario_key" }
    );
    if (error) console.error("saveProgress error:", error);
  };

  /* audit block attempt */
  const insertBlockAttempt = async (blockIndex: number, stars: number, passed: boolean, answers: number) => {
    if (!ownerId) return;
    const { error } = await sb.from("scenario_block_attempts").insert({
      owner_id: ownerId,
      session_id: /^[0-9a-f-]{36}$/i.test(meta.sessionId) ? meta.sessionId : null,
      child_id: childId ?? null,
      scenario_key: scenarioKey,
      block_index: blockIndex,
      answers_correct: answers,
      stars_earned: stars,
      passed,
    });
    if (error) console.error("Block attempt insert error:", error);
  };

  /* log single question attempt */
  const insertQuestionAttempt = async (
    blockIndex: number,
    questionIndex: number,
    optionIndex: number,
    isCorrect: boolean
  ) => {
    if (!ownerId) return;
    const { error } = await sb.from("scenario_question_attempts").insert({
      owner_id: ownerId,
      session_id: /^[0-9a-f-]{36}$/i.test(meta.sessionId) ? meta.sessionId : null,
      child_id: childId ?? null,
      scenario_key: scenarioKey,
      block_index: blockIndex,
      question_index: questionIndex,
      option_index: optionIndex,
      is_correct: isCorrect,
    });
    if (error) console.error("SQA insert error:", error);
  };

  /* child picked an option */
  const handlePick = async (optText: string, optIndex: number) => {
    if (locked) return;
    setLocked(true);

    ++ttsToken.current; // stop further option speech

    addTurn({ speaker: "child", text: optText });
    if (/^[0-9a-f-]{36}$/i.test(meta.sessionId)) {
      persistTurn(meta.sessionId, { speaker: "child", text: optText }).catch((e) =>
        console.error("persistTurn error:", e)
      );
    }

    const qNow = questions[qIdx];
    const correct = optIndex === qNow.correctIndex;

    // UI feedback
    setOptionStatuses((prev) => prev.map((s, i) => (i === optIndex ? (correct ? "correct" : "wrong") : s)));

    // Running totals
    if (correct) setTotalCorrect((c) => c + 1);
    setTotalAnswered((c) => c + 1);

    // Persist this attempt
    insertQuestionAttempt(blockIdx, qIdx, optIndex, correct).catch(() => {});

    // Update per-block counter (for stars)
    if (correct) setBlockCorrect((c) => c + 1);

    try {
      await speakInBrowser(correct ? "Good job!" : "Okay, let's try the next one.", { rate: 0.98 });
    } catch {}

    await new Promise((r) => setTimeout(r, 350)); // dwell

    // Move within block (3 questions per block)
    if (qIdx < 2) {
      setQIdx((i) => i + 1);
      return;
    }

    // Block finished -> compute stars for this block attempt
    const starsForThisBlock = blockCorrect + (correct ? 1 : 0); // 0..3
    const passed = starsForThisBlock >= 2;
    const newTotalPoints = totalStars + starsForThisBlock;

    if (passed && /^[0-9a-f-]{36}$/i.test(meta.sessionId)) {
      persistMastery(meta.sessionId, `${scenario.skillLabel} • ${block.title}`, "success").catch((e) =>
        console.error("persistMastery error:", e)
      );
    }

    await insertBlockAttempt(blockIdx, starsForThisBlock, passed, starsForThisBlock);

    const nextBlock = passed ? Math.min(blockIdx + 1, scenario.blocks.length - 1) : blockIdx;
    await saveProgress(nextBlock, newTotalPoints);

    // Reset per-block counters
    setBlockCorrect(0);

    setTotalStars(newTotalPoints);
    setQIdx(0);
    setBlockIdx(nextBlock);
  };

  return (
    <>
      {/* HUD (top-right) */}
      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-30 flex flex-wrap items-center gap-1.5 sm:gap-2">
        <Badge variant="outline" className="bg-white/70 backdrop-blur text-xs sm:text-sm">
          {scenario.title}
        </Badge>
        <Badge variant="outline" className="text-xs sm:text-sm">
          Block {blockIdx + 1}/{scenario.blocks.length}
        </Badge>
        <div className="inline-flex items-center gap-1 text-amber-500 text-xs sm:text-sm font-medium">
          <Star size={16} /> {totalStars}
        </div>
        <Badge variant="outline" className="text-xs sm:text-sm">
          Answered {totalAnswered}
        </Badge>
        <Badge variant="outline" className="text-xs sm:text-sm">
          Correct {totalCorrect}
        </Badge>
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2 text-xs sm:h-8 sm:px-3 sm:text-sm"
          onClick={async () => {
            setBlockIdx(0);
            setQIdx(0);
            setTotalStars(0);
            setTotalAnswered(0);
            setTotalCorrect(0);
            setBlockCorrect(0);
            setOptionStatuses([]);
            setLocked(false);
            setVisibleCount(0);
            ++ttsToken.current; // cancel ongoing speech

            // Keep historical logs, just reset progress points (only when child selected)
            await saveProgress(0, 0);
          }}
        >
          Reset
        </Button>
      </div>

      {/* Floating answer options */}
      <CloudsOverlay
        options={q.options}
        visible={showOptions}
        onPick={handlePick}
        statuses={optionStatuses}
        locked={locked}
        visibleCount={visibleCount}
      />
    </>
  );
}
