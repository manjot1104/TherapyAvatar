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
import {
  SCENARIOS,
  getScenarioWithShuffledOptions,
  type Option,
  type Q,
} from "@/data/scenarios";
import { speakInBrowser, stopSpeech } from "@/lib/speak";
import { createClient } from "@/lib/supabase/browser-client";
import { useSession } from "@/components/SessionSummary";
import { persistTurn, persistMastery } from "@/lib/session-persist";

/* ------------------------------------------- */
function splitSides(options: Option[]) {
  const L: Option[] = [];
  const R: Option[] = [];
  options.forEach((opt: Option, i: number) => {
    if (i % 2 === 0) L.push(opt);
    else R.push(opt);
  });
  return { left: L, right: R };
}

function removeEmojiRough(s?: string | null): string {
  if (!s) return "";
  return s
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .trim();
}

type OptionStatus = "idle" | "correct" | "wrong";
type LangCode = "en" | "hi" | "pa";

type BlockLocal = {
  title: string;
  questions: Q[];
};

/* Pop-in */
function PopInOption({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setMounted(true);
    });
  }, []);

  return (
    <div
      className={
        mounted
          ? "animate-[popInBounce_0.6s_ease-out_forwards]"
          : "scale-[2.5] opacity-0"
      }
    >
      {children}
    </div>
  );
}

/* Cloud pill */
function CloudPill({
  option,
  onClick,
  status = "idle",
  disabled = false,
  isSpeaking = false,
  selectedLanguage,
}: {
  option: Option;
  onClick: () => void;
  status?: OptionStatus;
  disabled?: boolean;
  isSpeaking?: boolean;
  selectedLanguage: LangCode;
}): ReactNode {
  const [imageError, setImageError] = useState(false);

  const isCorrect = status === "correct";
  const isWrong = status === "wrong";
  const hasImage = !!option.imageUrl && !imageError;

  const label =
    option.text[selectedLanguage] ?? option.text.en ?? "";

  const base =
    "group relative rounded-[1.5rem] px-2 py-1.5 text-[0.95rem] font-semibold border shadow-xl drop-shadow-md transition-all active:scale-[0.98] w-full max-w-full text-center supports-[hover:hover]:hover:scale-[1.03] md:rounded-[2rem] md:px-4 md:py-2 md:text-base md:w-fit md:min-w-[100px] lg:px-5 lg:py-3 lg:text-lg lg:w-fit lg:min-w-[120px] overflow-hidden";

  const idleCls =
    "bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white border-white/60 dark:border-slate-700";
  const okCls = "bg-green-500/90 text-white border-green-600";
  const badRealCls = "bg-red-500/90 text-white border-red-600";

  return (
    <div className="flex flex-col items-center">
      {hasImage && (
        <div className="mb-2">
          <img
            src={option.imageUrl}
            alt={label}
            className="w-28 h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-lg object-cover border-2 border-white/60 dark:border-slate-700 shadow-md"
            onError={() => setImageError(true)}
          />
        </div>
      )}
      <button
        onClick={onClick}
        disabled={disabled}
        className={[
          base,
          "transition-all duration-300",
          isSpeaking ? "scale-[1.25]" : "scale-100",
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
        <span className="truncate text-xs mt-1">{label}</span>
      </button>
    </div>
  );
}

/* CloudsOverlay */
function CloudsOverlay({
  options,
  onPick,
  visible,
  statuses,
  locked,
  visibleCount,
  currentSpeakingIndex,
  currentVisibleIndex,
  selectedLanguage,
}: {
  options: Option[];
  onPick: (opt: Option, idx: number) => void;
  visible: boolean;
  statuses: OptionStatus[];
  locked: boolean;
  visibleCount: number;
  currentSpeakingIndex: number | null;
  currentVisibleIndex: number | null;
  selectedLanguage: LangCode;
}) {
  const { left, right } = useMemo(() => splitSides(options), [options]);
  if (!visible || options.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20" aria-hidden>
      {/* Mobile */}
      <div className="md:hidden absolute inset-0 z-20" aria-hidden>
        <div
          className={[
            "absolute pointer-events-auto flex flex-col items-end",
            "gap-3",
            "top-[50%] -translate-y-1/2",
            "right-[55%]",
            "max-w-[150px]",
          ].join(" ")}
        >
          {left.map((opt: Option, idx: number) => {
            const realIndex = idx * 2;
            if (
              currentVisibleIndex !== null
                ? realIndex !== currentVisibleIndex
                : realIndex >= visibleCount
            )
              return null;
            return (
              <div
                key={`M-L-${idx}-${visibleCount}`}
                className="sr-float1"
                style={{
                  animationDelay: `${idx * 0.12}s`,
                  transform: `translateY(${idx * 2}px)`,
                }}
              >
                <CloudPill
                  option={opt}
                  status={statuses[realIndex] ?? "idle"}
                  disabled={locked}
                  onClick={() => !locked && onPick(opt, realIndex)}
                  isSpeaking={currentSpeakingIndex === realIndex}
                  selectedLanguage={selectedLanguage}
                />
              </div>
            );
          })}
        </div>

        <div
          className={[
            "absolute pointer-events-auto flex flex-col items-start",
            "gap-3",
            "top-[50%] -translate-y-1/2",
            "left-[55%]",
            "max-w-[150px]",
          ].join(" ")}
        >
          {right.map((opt: Option, idx: number) => {
            const realIndex = idx * 2 + 1;
            if (
              currentVisibleIndex !== null
                ? realIndex !== currentVisibleIndex
                : realIndex >= visibleCount
            )
              return null;
            return (
              <div
                key={`M-R-${idx}-${visibleCount}`}
                className="sr-float2"
                style={{
                  animationDelay: `${idx * 0.12}s`,
                  transform: `translateY(${idx * 2}px)`,
                }}
              >
                <PopInOption>
                  <CloudPill
                    option={opt}
                    status={statuses[realIndex] ?? "idle"}
                    disabled={locked}
                    onClick={() => !locked && onPick(opt, realIndex)}
                    isSpeaking={currentSpeakingIndex === realIndex}
                    selectedLanguage={selectedLanguage}
                  />
                </PopInOption>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <div
          className={[
            "absolute pointer-events-auto flex flex-col items-end",
            "gap-5 lg:gap-6",
            "top-[60%] -translate-y-1/2",
            "right-[60%] md:right-[59%] lg:right-[58%] xl:right-[57%]",
            "max-w-[300px] md:max-w-[320px]",
          ].join(" ")}
        >
          {left.map((opt: Option, idx: number) => {
            const realIndex = idx * 2;
            if (
              currentVisibleIndex !== null
                ? realIndex !== currentVisibleIndex
                : realIndex >= visibleCount
            )
              return null;
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
                    option={opt}
                    status={statuses[realIndex] ?? "idle"}
                    disabled={locked}
                    onClick={() => !locked && onPick(opt, realIndex)}
                    isSpeaking={currentSpeakingIndex === realIndex}
                    selectedLanguage={selectedLanguage}
                  />
                </PopInOption>
              </div>
            );
          })}
        </div>

        <div
          className={[
            "absolute pointer-events-auto flex flex-col items-start",
            "gap-5 lg:gap-6",
            "top-[60%] -translate-y-1/2",
            "left-[60%] md:left-[59%] lg:left-[58%] xl:left-[57%]",
            "max-w-[300px] md:max-w-[320px]",
          ].join(" ")}
        >
          {right.map((opt: Option, idx: number) => {
            const realIndex = idx * 2 + 1;
            if (
              currentVisibleIndex !== null
                ? realIndex !== currentVisibleIndex
                : realIndex >= visibleCount
            )
              return null;
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
                    option={opt}
                    status={statuses[realIndex] ?? "idle"}
                    disabled={locked}
                    onClick={() => !locked && onPick(opt, realIndex)}
                    isSpeaking={currentSpeakingIndex === realIndex}
                    selectedLanguage={selectedLanguage}
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

/* Main runner */
export default function ScenarioRunner({
  scenarioKey,
  setCaption,
  setSpokenScript,
  selectedChildId,
  isSpeaking,
  selectedLanguage,
}: {
  scenarioKey: keyof typeof SCENARIOS;
  setCaption: (q: string) => void;
  setSpokenScript: (s: string) => void;
  selectedChildId?: string | null;
  isSpeaking: boolean;
  selectedLanguage: LangCode;
}) {
  const scenario = useMemo(
    () => getScenarioWithShuffledOptions(scenarioKey),
    [scenarioKey]
  );
  const sb = useMemo(() => createClient(), []);
  const { meta, addTurn } = useSession();

  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [childId, setChildId] = useState<string | null>(
    selectedChildId ?? null
  );

  const blocks: BlockLocal[] = useMemo(() => {
    const allQs = scenario.questions;
    const result: BlockLocal[] = [];
    const blockSize = 3;

    for (let i = 0; i < allQs.length; i += blockSize) {
      result.push({
        title: `Block ${Math.floor(i / blockSize) + 1}`,
        questions: allQs.slice(i, i + blockSize),
      });
    }
    return result;
  }, [scenario]);

  const [blockIdx, setBlockIdx] = useState(0);
  const [maxBlockIdx, setMaxBlockIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [answersCorrect, setAnswersCorrect] = useState(0);
  const [totalStars, setTotalStars] = useState(0);

  const [showOptions, setShowOptions] = useState(false);
  const [optionStatuses, setOptionStatuses] = useState<OptionStatus[]>([]);
  const [locked, setLocked] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);
  const [currentSpeakingIndex, setCurrentSpeakingIndex] =
    useState<number | null>(null);
  const [currentVisibleIndex, setCurrentVisibleIndex] =
    useState<number | null>(null);

  const block = blocks[blockIdx];
  const questions: Q[] = block?.questions.slice(0, 3) ?? [];
  const q: Q | undefined = questions[qIdx];

  const langCodes: Record<LangCode, string> = {
    en: "en-IN",
    hi: "hi-IN",
    pa: "pa-IN",
  };

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await sb.auth.getUser();
      setOwnerId(user?.id ?? null);
    })();
  }, [sb]);

  useEffect(() => {
    if (selectedChildId !== undefined) {
      setChildId(selectedChildId ?? null);
    }
  }, [selectedChildId]);

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
      for (const row of data as {
        block_index: number | null;
        passed: boolean;
      }[]) {
        if (row.passed) {
          highestPassed = Math.max(
            highestPassed,
            row.block_index ?? 0
          );
        }
      }

      const maxBlockIndex = Math.max(blocks.length - 1, 0);

      if (highestPassed >= 0) {
        const startBlock = Math.min(highestPassed + 1, maxBlockIndex);
        setBlockIdx(startBlock);
        setMaxBlockIdx(startBlock);
      } else {
        setBlockIdx(0);
        setMaxBlockIdx(0);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerId, scenarioKey, childId, blocks.length]);

  useEffect(() => {
    if (!q) return;
    setOptionStatuses(Array(q.options.length).fill("idle"));
    setLocked(false);
    setVisibleCount(0);
    setShowOptions(false);
  }, [blockIdx, qIdx, q?.options.length]);

  useEffect(() => {
    if (!q) return;
    let cancelled = false;

    const runSpeech = async () => {
      const promptRaw =
        q.prompt[selectedLanguage] ?? q.prompt.en ?? "";
      const prompt = removeEmojiRough(promptRaw);

      const optionTexts = q.options.map((opt: Option) => {
        const raw =
          opt.text[selectedLanguage] ?? opt.text.en ?? "";
        return removeEmojiRough(raw);
      });

      setCaption(prompt);

      const fullScript =
        optionTexts.length > 0
          ? `${prompt}. ${optionTexts.join(". ")}`
          : prompt;
      setSpokenScript(fullScript);

      stopSpeech();

      try {
        await speakInBrowser(prompt, {
          rate: 0.6,
          lang: langCodes[selectedLanguage],
        });
      } catch {}

      if (cancelled) return;

      setShowOptions(true);

      for (let i = 0; i < optionTexts.length; i++) {
        if (cancelled) break;

        if (i > 0) {
          setVisibleCount(0);
          setCurrentVisibleIndex(null);
          setCurrentSpeakingIndex(null);
          await new Promise((resolve) => setTimeout(resolve, 50));
        }

        setVisibleCount(1);
        setCurrentVisibleIndex(i);
        setCurrentSpeakingIndex(i);

        try {
          await speakInBrowser(optionTexts[i], {
            rate: 0.7,
            lang: langCodes[selectedLanguage],
          });
        } catch {}

        if (cancelled) break;
      }
      setCurrentSpeakingIndex(null);
      setCurrentVisibleIndex(null);
      setVisibleCount(optionTexts.length);
    };

    runSpeech();

    return () => {
      cancelled = true;
      stopSpeech();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockIdx, qIdx, scenarioKey, selectedLanguage]);

  const saveProgress = async (
    highestBlock: number,
    newTotal: number
  ) => {
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

  const insertBlockAttempt = async (
    blockIndex: number,
    stars: number,
    passed: boolean,
    answers: number
  ) => {
    if (!ownerId) return;
    await sb.from("scenario_block_attempts").insert({
      owner_id: ownerId,
      session_id: /^[0-9a-f-]{36}$/i.test(meta.sessionId)
        ? meta.sessionId
        : null,
      child_id: childId ?? null,
      scenario_key: scenarioKey,
      block_index: blockIndex,
      answers_correct: answers,
      stars_earned: stars,
      passed,
    });
  };

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
      session_id: /^[0-9a-f-]{36}$/i.test(meta.sessionId)
        ? meta.sessionId
        : null,
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

  const handlePick = async (opt: Option, optIndex: number) => {
    if (locked || !q || !block) return;
    setLocked(true);

    stopSpeech();

    const spokenText =
      opt.text[selectedLanguage] ?? opt.text.en ?? "";
    addTurn({ speaker: "child", text: spokenText });
    if (/^[0-9a-f-]{36}$/i.test(meta.sessionId)) {
      persistTurn(meta.sessionId, {
        speaker: "child",
        text: spokenText,
      }).catch(() => {});
    }

    const qNow = questions[qIdx];
    const isCorrect = optIndex === qNow.correctIndex;

    const questionText =
      qNow.prompt[selectedLanguage] ?? qNow.prompt.en ?? "";

    const chosenText =
      qNow.options[optIndex]?.text[selectedLanguage] ??
      qNow.options[optIndex]?.text.en ??
      spokenText;

    const correctText =
      qNow.options[qNow.correctIndex]?.text[selectedLanguage] ??
      qNow.options[qNow.correctIndex]?.text.en ??
      "";

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

    if (qIdx < 2 && qIdx < questions.length - 1) {
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

    const lastBlockIndex = blocks.length - 1;
    const rawNext = passed
      ? Math.min(blockIdx + 1, lastBlockIndex)
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
    void saveProgress(0, 0);
  };

  if (!block || !q) return null;

  return (
    <>
      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-30 flex flex-wrap items-center gap-1 sm:gap-2">
        <Badge
          variant="outline"
          className="bg-white/70 backdrop-blur text-xs sm:text-sm"
        >
          {scenario.title}
        </Badge>
        <Badge variant="outline" className="text-xs sm:text-sm">
          Block {blockIdx + 1}/{blocks.length || 1}
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

      <CloudsOverlay
        options={q.options}
        visible={showOptions}
        onPick={handlePick}
        statuses={optionStatuses}
        locked={locked}
        visibleCount={visibleCount}
        currentSpeakingIndex={currentSpeakingIndex}
        currentVisibleIndex={currentVisibleIndex}
        selectedLanguage={selectedLanguage}
      />
    </>
  );
}
