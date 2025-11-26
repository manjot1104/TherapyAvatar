// src/components/ScenarioRunner.tsx
"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { SCENARIOS, getScenarioWithShuffledOptions } from "@/data/scenarios";
import { speakInBrowser, stopSpeech } from "@/lib/speak";
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
   Types for option feedback
-------------------------------------------- */
type OptionStatus = "idle" | "correct" | "wrong";

/* -------------------------------------------
   Pop-in wrapper (zoom effect)
-------------------------------------------- */
function PopInOption({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setMounted(true);
    });
  }, []);

  return (
    <div
      className={[
        "transition-transform transition-opacity duration-300 ease-out",
        mounted ? "scale-100 opacity-100" : "scale-[1.6] opacity-0",
      ].join(" ")}
    >
      {children}
    </div>
  );
}


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
  const badRealCls = "bg-red-500/90 text-white border-red-600";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        base,
        "transition-colors duration-300",
        isCorrect ? okCls : isWrong ? badRealCls : idleCls,
        disabled ? "opacity-95 cursor-not-allowed" : "",
      ].join(" ")}
    >
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

  const MOBILE_BOTTOM_OFFSET = 165;
  const bottomSafe = `calc(env(safe-area-inset-bottom, 0px) + ${MOBILE_BOTTOM_OFFSET}px)`;

  return (
    <div className="pointer-events-none absolute inset-0 z-20" aria-hidden>
      {/* Phones: bottom sheet (raised) */}
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
            "cloud-sheet shadow-xl",
          ].join(" ")}
        >
          {options.map((opt, idx) =>
            idx < visibleCount ? (
              <div
                key={`opt-${idx}-${visibleCount}`}
                className="sr-float1"
                style={{ animationDelay: `${idx * 0.08}s` }}
              >
                <PopInOption>
                  <CloudPill
                    text={opt}
                    status={statuses[idx] ?? "idle"}
                    disabled={locked}
                    onClick={() => !locked && onPick(opt, idx)}
                  />
                </PopInOption>
              </div>
            ) : null
          )}
        </div>
      </div>

      {/* Tablet/Desktop: anchor near avatar but further apart */}
      <div className="hidden md:block">
        {/* LEFT stack */}
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
            if (realIndex >= visibleCount) return null;
            return (
              <div
                key={`L-${idx}-${visibleCount}`}
                className="sr-float1"
                style={{
                  animationDelay: `${idx * 0.12}s`,
                  transform: `translateY(${idx * 3}px)`,
                }}
              >
                <PopInOption>
                  <CloudPill
                    text={opt}
                    status={statuses[realIndex] ?? "idle"}
                    disabled={locked}
                    onClick={() => !locked && onPick(opt, realIndex)}
                  />
                </PopInOption>
              </div>
            );
          })}
        </div>

        {/* RIGHT stack */}
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
            if (realIndex >= visibleCount) return null;
            return (
              <div
                key={`R-${idx}-${visibleCount}`}
                className="sr-float2"
                style={{
                  animationDelay: `${idx * 0.12}s`,
                  transform: `translateY(${idx * 3}px)`,
                }}
              >
                <PopInOption>
                  <CloudPill
                    text={opt}
                    status={statuses[realIndex] ?? "idle"}
                    disabled={locked}
                    onClick={() => !locked && onPick(opt, realIndex)}
                  />
                </PopInOption>
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
  setCaption,
  setSpokenScript,
  selectedChildId,
}: {
  scenarioKey: keyof typeof SCENARIOS;
  setCaption: (q: string) => void;
  setSpokenScript: (s: string) => void;
  selectedChildId?: string | null;
}) {
  const scenario = useMemo(
    () => getScenarioWithShuffledOptions(scenarioKey),
    [scenarioKey]
  );
  const sb = useMemo(() => createClient(), []);
  const { meta, addTurn } = useSession();

  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [childId, setChildId] = useState<string | null>(selectedChildId ?? null);

  const [blockIdx, setBlockIdx] = useState(0);
  const [maxBlockIdx, setMaxBlockIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [answersCorrect, setAnswersCorrect] = useState(0);
  const [totalStars, setTotalStars] = useState(0);

  const [showOptions, setShowOptions] = useState(false);

  // UI feedback + progressive reveal
  const [optionStatuses, setOptionStatuses] = useState<OptionStatus[]>([]);
  const [locked, setLocked] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);

  const block = scenario.blocks[blockIdx];
  const questions = block.questions.slice(0, 3);
  const q = questions[qIdx];

  /* auth owner */
  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await sb.auth.getUser();
      setOwnerId(user?.id ?? null);
    })();
  }, [sb]);

  /* react to selected child change */
  useEffect(() => {
    if (selectedChildId !== undefined) setChildId(selectedChildId ?? null);
  }, [selectedChildId]);

  /* ✅ resume progress: highest PASSED block from scenario_block_attempts */
  useEffect(() => {
    (async () => {
      if (!ownerId) return;

      const { data, error } = await sb
        .from("scenario_block_attempts")
        .select("block_index, passed")
        .eq("owner_id", ownerId)
        .eq("scenario_key", scenarioKey)
        .or(childId ? `child_id.eq.${childId}` : `child_id.is.null`)
        .order("block_index", { ascending: false })
        .limit(20);

      if (error) {
        console.warn("resume error scenario_block_attempts:", error);
        return;
      }

      if (!data || data.length === 0) {
        setBlockIdx(0);
        setMaxBlockIdx(0);
        setTotalStars(0);
        return;
      }

      let highestPassed = -1;
      for (const row of data) {
        if (row.passed) {
          highestPassed = Math.max(highestPassed, row.block_index ?? 0);
        }
      }

      if (highestPassed >= 0) {
        const startBlock = Math.min(
          highestPassed + 1,
          scenario.blocks.length - 1
        );
        setBlockIdx(startBlock);
        setMaxBlockIdx(startBlock);
      } else {
        setBlockIdx(0);
        setMaxBlockIdx(0);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerId, scenarioKey, childId]);

  /* reset per-question UI */
  useEffect(() => {
    setOptionStatuses(Array(q.options.length).fill("idle"));
    setLocked(false);
    setVisibleCount(0);
    setShowOptions(false);
  }, [blockIdx, qIdx, q.options.length]);

  /* Speak question + then options one by one */
  useEffect(() => {
    let cancelled = false;

    const runSpeech = async () => {
      const prompt = q.prompt;
      const optionTexts = q.options.map((opt) => removeEmojiRough(opt));

      setCaption(prompt);

      const fullScript =
        optionTexts.length > 0
          ? `${prompt}. ${optionTexts.join(". ")}`
          : prompt;
      setSpokenScript(fullScript);

      stopSpeech();

      try {
        // slow question
        await speakInBrowser(prompt, { rate: 0.75 });
      } catch {}

      if (cancelled) return;

      setShowOptions(true);

      for (let i = 0; i < optionTexts.length; i++) {
        if (cancelled) break;

        setVisibleCount((prev) => (prev < i + 1 ? i + 1 : prev));

        try {
          // slow options
          await speakInBrowser(optionTexts[i], { rate: 0.75 });
        } catch {}

        if (cancelled) break;
      }
    };

    runSpeech();

    return () => {
      cancelled = true;
      stopSpeech();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockIdx, qIdx, scenarioKey]);

  /* save (upsert) scenario_progress - highest block only */
  const saveProgress = async (highestBlock: number, newTotal: number) => {
    if (!ownerId) return;

    await sb.from("scenario_progress").upsert(
      {
        owner_id: ownerId,
        child_id: childId ?? null,
        scenario_key: scenarioKey,
        current_block: highestBlock,
        total_points: newTotal,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "owner_id,child_id,scenario_key" }
    );
  };

  /* audit block attempt */
  const insertBlockAttempt = async (
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

  /* per-question attempt */
  const insertQuestionAttempt = async ({
    questionIndex,
    optionIndex,
    isCorrect,
    questionText,
    chosenText,
    correctText,
  }: {
    questionIndex: number;
    optionIndex: number;
    isCorrect: boolean;
    questionText: string;
    chosenText: string;
    correctText: string;
  }) => {
    if (!ownerId) return;
    await sb.from("scenario_question_attempts").insert({
      owner_id: ownerId,
      child_id: childId ?? null,
      session_id: /^[0-9a-f-]{36}$/i.test(meta.sessionId) ? meta.sessionId : null,
      scenario_key: scenarioKey,
      block_index: blockIdx,
      question_index: questionIndex,
      option_index: optionIndex,
      is_correct: isCorrect,
      question_text: questionText,
      chosen_option_text: chosenText,
      correct_option_text: correctText,
    });
  };

  /* child picked an option */
  const handlePick = async (optText: string, optIndex: number) => {
    if (locked) return;
    setLocked(true);

    stopSpeech();

    addTurn({ speaker: "child", text: optText });
    if (/^[0-9a-f-]{36}$/i.test(meta.sessionId)) {
      persistTurn(meta.sessionId, { speaker: "child", text: optText }).catch(
        () => {}
      );
    }

    const qNow = questions[qIdx];
    const isCorrect = optIndex === qNow.correctIndex;

    const questionText = qNow.prompt;
    const chosenText = qNow.options[optIndex] ?? optText;
    const correctText = qNow.options[qNow.correctIndex];

    setOptionStatuses((prev) =>
      prev.map((s, i) =>
        i === optIndex ? (isCorrect ? "correct" : "wrong") : s
      )
    );
    if (isCorrect) setAnswersCorrect((c) => c + 1);

    insertQuestionAttempt({
      questionIndex: qIdx,
      optionIndex: optIndex,
      isCorrect,
      questionText,
      chosenText,
      correctText,
    }).catch(() => {});

    try {
      await speakInBrowser(
        isCorrect ? "Good job!" : "Okay, let's try the next one.",
        { rate: 0.9 }
      );
    } catch {}

    await new Promise((r) => setTimeout(r, 350));

    if (qIdx < 2) {
      setQIdx((i) => i + 1);
      return;
    }

    const stars = answersCorrect + (isCorrect ? 1 : 0);
    const passed = stars >= 2;
    const newTotal = totalStars + stars;

    if (passed && /^[0-9a-f-]{36}$/i.test(meta.sessionId)) {
      persistMastery(
        meta.sessionId,
        `${scenario.skillLabel} • ${block.title}`,
        "success"
      ).catch(() => {});
    }

    await insertBlockAttempt(
      blockIdx,
      stars,
      passed,
      answersCorrect + (isCorrect ? 1 : 0)
    );

    const rawNext = passed
      ? Math.min(blockIdx + 1, scenario.blocks.length - 1)
      : blockIdx;

    const newMaxBlock = Math.max(maxBlockIdx, rawNext);

    await saveProgress(newMaxBlock, newTotal);

    setMaxBlockIdx(newMaxBlock);
    setTotalStars(newTotal);
    setAnswersCorrect(0);
    setQIdx(0);
    setBlockIdx(rawNext);
  };

  const handleReset = () => {
    setBlockIdx(0);
    setMaxBlockIdx(0);
    setQIdx(0);
    setTotalStars(0);
    setAnswersCorrect(0);
    setOptionStatuses([]);
    setLocked(false);
    setVisibleCount(0);
    stopSpeech();
    saveProgress(0, 0);
  };

  return (
    <>
      {/* HUD (top-right) */}
      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-30 flex flex-wrap items-center gap-1 sm:gap-2">
        <Badge
          variant="outline"
          className="bg-white/70 backdrop-blur text-xs sm:text-sm"
        >
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
          onClick={handleReset}
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
