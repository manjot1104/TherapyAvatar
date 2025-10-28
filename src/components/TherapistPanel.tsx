// src/components/TherapistPanel.tsx
"use client";
import React, { useState } from "react";

type Props = {
  disabled?: boolean;
  onPause: () => void;
  onRepeat: () => void | Promise<void>;
  onSimplify: () => void;
  onNext: () => void;
  onCalm: () => void | Promise<void>;
  onMarkAttempt: (skill: string) => void;
  onMarkSuccess: (skill: string) => void;
  currentSkill?: string;

  /** Optional: lets therapist speak/ask a prompt aloud from page.tsx */
  onAsk?: (q: string) => void | Promise<void>;
};

export default function TherapistPanel({
  disabled,
  onPause,
  onRepeat,
  onSimplify,
  onNext,
  onCalm,
  onMarkAttempt,
  onMarkSuccess,
  currentSkill = "greet",
  onAsk,
}: Props) {
  const [askText, setAskText] = useState("");

  const fireAsk = async () => {
    const q = askText.trim();
    if (!q || !onAsk) return;
    await onAsk(q);
    setAskText("");
  };

  return (
    <aside className="w-full max-w-md rounded-3xl p-5 bg-card/90 shadow-lg border border-border backdrop-blur-sm text-foreground">
      <h3 className="text-xl font-bold text-primary mb-4">Therapist Controls</h3>

      {/* Main controls */}
      <div className="grid grid-cols-2 gap-3">
        <button
          disabled={!!disabled}
          onClick={onPause}
          className="rounded-2xl px-4 py-2 bg-pink-200 text-pink-900 hover:bg-pink-300 shadow-sm transition transform hover:-translate-y-0.5 disabled:opacity-50 dark:bg-pink-300 dark:text-pink-950 dark:hover:bg-pink-400"
        >
          Pause
        </button>

        <button
            disabled={!!disabled}
            onClick={onRepeat}
            className="rounded-2xl px-4 py-2 bg-blue-200 text-blue-900 hover:bg-blue-300 shadow-sm transition transform hover:-translate-y-0.5 disabled:opacity-50 dark:bg-blue-300 dark:text-blue-950 dark:hover:bg-blue-400"
        >
          Repeat
        </button>

        <button
          disabled={!!disabled}
          onClick={onSimplify}
          className="rounded-2xl px-4 py-2 bg-amber-200 text-amber-900 hover:bg-amber-300 shadow-sm transition transform hover:-translate-y-0.5 disabled:opacity-50 dark:bg-amber-300 dark:text-amber-950 dark:hover:bg-amber-400"
        >
          Simplify
        </button>

        <button
          disabled={!!disabled}
          onClick={onNext}
          className="rounded-2xl px-4 py-2 bg-emerald-200 text-emerald-900 hover:bg-emerald-300 shadow-sm transition transform hover:-translate-y-0.5 disabled:opacity-50 dark:bg-emerald-300 dark:text-emerald-950 dark:hover:bg-emerald-400"
        >
          Next
        </button>

        <button
          disabled={!!disabled}
          onClick={onCalm}
          className="col-span-2 rounded-3xl px-4 py-2 bg-violet-200 text-violet-900 hover:bg-violet-300 shadow-md transition transform hover:-translate-y-0.5 disabled:opacity-50 dark:bg-violet-300 dark:text-violet-950 dark:hover:bg-violet-400"
        >
          Calm Mode
        </button>
      </div>

      {/* Mastery log block */}
      <div className="mt-5 rounded-2xl bg-muted p-4 border border-border">
        <p className="text-sm text-muted-foreground mb-3">
          Log mastery for: <span className="font-semibold text-primary">{currentSkill}</span>
        </p>
        <div className="flex gap-3">
          <button
            disabled={!!disabled}
            onClick={() => onMarkAttempt(currentSkill)}
            className="flex-1 rounded-2xl px-4 py-2 bg-accent hover:bg-accent/80 text-foreground shadow-sm transition transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            Attempted
          </button>
          <button
            disabled={!!disabled}
            onClick={() => onMarkSuccess(currentSkill)}
            className="flex-1 rounded-2xl px-4 py-2 bg-primary/20 hover:bg-primary/30 text-foreground shadow-sm transition transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            Success
          </button>
        </div>
      </div>

      {/* Ask section (uses onAsk if provided) */}
      <div className="mt-5 rounded-2xl bg-muted p-4 border border-border">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-muted-foreground">Ask the child (speaks out loud)</p>
          {!onAsk && (
            <span className="text-[11px] text-amber-600">onAsk not wired</span>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={askText}
            onChange={(e) => setAskText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") fireAsk();
            }}
            placeholder="Type a prompt… e.g., How are you feeling today?"
            disabled={!!disabled || !onAsk}
            className="flex-1 rounded-xl border border-border bg-card/80 px-3 py-2 text-sm outline-none disabled:opacity-50"
          />
          <button
            onClick={fireAsk}
            disabled={!!disabled || !onAsk || !askText.trim()}
            className="rounded-xl px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50"
          >
            Ask
          </button>
        </div>

        {/* Quick-ask presets */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            disabled={!!disabled || !onAsk}
            onClick={() => onAsk?.("How are you feeling today?")}
            className="rounded-xl px-3 py-2 text-xs bg-secondary text-secondary-foreground hover:bg-secondary/80 transition disabled:opacity-50"
          >
            How are you?
          </button>
          <button
            disabled={!!disabled || !onAsk}
            onClick={() => onAsk?.("Do you want to play a game?")}
            className="rounded-xl px-3 py-2 text-xs bg-secondary text-secondary-foreground hover:bg-secondary/80 transition disabled:opacity-50"
          >
            Play a game?
          </button>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground mt-4">
        Tip: hotkeys — <b>P</b> Pause, <b>R</b> Repeat, <b>S</b> Simplify, <b>N</b> Next, <b>C</b> Calm
      </p>
    </aside>
  );
}
