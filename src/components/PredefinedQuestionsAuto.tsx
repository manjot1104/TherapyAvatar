"use client";

import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import { speakInBrowser, stopSpeech } from "@/lib/speak";

export type PreQ = { id: string; text: string };

export type PredefinedQuestionsAutoHandle = {
  childAnswered: () => void;
  start: () => void;
  repeat: () => void;
};

type Props = {
  questions?: PreQ[];
  onDone?: () => void;
  setLastAssistant?: (t: string) => void;
  gapMs?: number;

  /** TTS options (match speakInBrowser signature) */
  rate?: number;      // default 0.6
  pitch?: number;
  lang?: string;      // e.g. "en-IN", "hi-IN", "pa-IN"
  voiceName?: string; // exact voice name if you have one

  /** If false, won't speak the first question automatically on mount. Call ref.start() later. */
  startOnMount?: boolean;  // default true
};

const DEFAULTS: PreQ[] = [
  { id: "feel",   text: "Hello! How are you feeling today?" },
  { id: "meal",   text: "Did you eat before coming here?" },
  { id: "home",   text: "What did you do at home today?" },
  { id: "ready",  text: "Are you ready for today’s fun session?" },
  { id: "choice", text: "Which game or activity do you want to start with?" },
];

// waitForVoices removed - not needed for Piper TTS

const PredefinedQuestionsAuto = React.forwardRef<PredefinedQuestionsAutoHandle, Props>(
  (
    {
      questions = DEFAULTS,
      onDone,
      setLastAssistant,
      gapMs = 600,
      rate = 0.6,
      pitch,
      lang,
      voiceName,
      startOnMount = true,
    },
    ref
  ) => {
    const [i, setI] = useState(0);
    const runningRef = useRef<boolean>(startOnMount);
    const speakingRef = useRef(false); // prevent overlaps
    const askedOnceRef = useRef(false);

    const speak = async (line: string) => {
      if (!line) return;
      setLastAssistant?.(line);

      if (speakingRef.current) return;
      speakingRef.current = true;
      try {
        // Stop any current speech then speak
        stopSpeech();
        await speakInBrowser(line, { rate, pitch, lang, voiceName });
      } catch {
        // ignore speech failures so flow doesn't break
      } finally {
        setTimeout(() => {
          speakingRef.current = false;
        }, 80);
      }
    };

    const askCurrent = async () => {
      const q = questions[i]?.text;
      if (!q) return;
      await speak(q);
      askedOnceRef.current = true;
    };

    const askAtIndex = async (idx: number) => {
      const q = questions[idx]?.text;
      if (!q) return;
      await speak(q);
    };

    useImperativeHandle(ref, () => ({
      start: async () => {
        runningRef.current = true;
        // Small delay can help autoplay policies
        await new Promise((r) => setTimeout(r, 100));
        if (askedOnceRef.current) {
          await speak(questions[i]?.text || "");
          return;
        }
        await askCurrent();
      },
      childAnswered: () => {
        if (!runningRef.current) return;
        const nextIdx = i + 1;
        if (nextIdx >= questions.length) {
          runningRef.current = false;
          onDone?.();
          return;
        }
        setTimeout(async () => {
          await askAtIndex(nextIdx);
          setI(nextIdx);
          askedOnceRef.current = true;
        }, gapMs);
      },
      repeat: async () => {
        await speak(questions[i]?.text || "");
      },
    }));

    useEffect(() => {
      runningRef.current = startOnMount;

      if (!startOnMount) {
        return () => { runningRef.current = false; };
      }

      // Kick off after mount with a tiny delay (helps some browsers)
      (async () => {
        if (!questions[0]?.text) return;
        await new Promise((r) => setTimeout(r, 120));
        await askCurrent();
      })();

      return () => { runningRef.current = false; };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
  }
);

PredefinedQuestionsAuto.displayName = "PredefinedQuestionsAuto";
export default PredefinedQuestionsAuto;
