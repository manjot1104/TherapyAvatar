// src/app/(protected)/therapy/page.tsx
"use client";

import React, { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RotateCw, Pause, Play } from "lucide-react";
import { useSession } from "@/components/SessionSummary";
import { createClient } from "@/lib/supabase/browser-client";
import ScenarioRunner from "@/components/ScenarioRunner";
import { SCENARIOS } from "@/data/scenarios";
import { speakInBrowser, stopSpeech } from "@/lib/speak";

const AvatarCanvas = dynamic(() => import("@/components/AvatarCanvas"), {
  ssr: false,
});
const EmotionTracker = dynamic(
  () => import("@/components/EmotionTracker"),
  { ssr: false }
);
const AudioRecorder = dynamic(
  () => import("@/components/AudioRecorder"),
  { ssr: false }
);

// keep this in sync with ScenarioRunner
type LangCode = "en" | "hi" | "pa";

const langCodes: Record<LangCode, string> = {
  en: "en-IN",
  hi: "hi-IN",
  pa: "pa-IN",
};

export default function TherapyMainPage() {
  const { addTurn, meta, setMeta } = useSession();

  const [captionText, setCaptionText] = useState("");
  const [spokenScript, setSpokenScript] = useState("");

  const [processing, setProcessing] = useState(false);
  const [activeScenario, setActiveScenario] =
    useState<keyof typeof SCENARIOS>("greeting_teacher");

  const [isPaused, setIsPaused] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [selectedLanguage, setSelectedLanguage] =
    useState<LangCode>("en");

  const selectedChildId: string | null = null;

  // ensure session row
  useEffect(() => {
    (async () => {
      const sb = createClient();
      const {
        data: { user },
      } = await sb.auth.getUser();
      if (!user) return;
      if (!/^[0-9a-f-]{36}$/i.test(meta.sessionId)) {
        const { data, error } = await sb
          .from("sessions")
          .insert({
            user_id: user.id,
            title: meta.sessionTitle || "Therapy Session",
          })
          .select("id")
          .single();
        if (!error && data?.id) setMeta({ sessionId: data.id });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // poll speech synthesis speaking state
  useEffect(() => {
    const interval = setInterval(() => {
      if (
        typeof window !== "undefined" &&
        window.speechSynthesis
      ) {
        setIsSpeaking(window.speechSynthesis.speaking);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  /* ======= CONTROL HANDLERS ======= */

  const handleRepeat = () => {
    if (!spokenScript) return;
    stopSpeech();
    speakInBrowser(spokenScript, {
      rate: 0.7,
      lang: langCodes[selectedLanguage],
    });
    setIsPaused(false);
  };

  const handlePlayPauseToggle = () => {
    if (!spokenScript) return;

    if (!isPaused) {
      stopSpeech();
      setIsPaused(true);
    } else {
      stopSpeech();
      speakInBrowser(spokenScript, {
        rate: 0.7,
        lang: langCodes[selectedLanguage],
      });
      setIsPaused(false);
    }
  };

  return (
    <section className="grid gap-4">
      <Card className="bg-card/90 border-border shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div
            className={[
              "avatar-stage relative w-full",
              "min-h-svh",
              "md:min-h-[620px] lg:min-h-[680px]",
            ].join(" ")}
            style={{
              paddingBottom:
                "max(0px, env(safe-area-inset-bottom))",
            }}
          >
            <Image
              src="/bg.png"
              alt=""
              fill
              priority
              className="object-cover pointer-events-none select-none"
            />
            <div className="absolute inset-0 bg-linear-to-b from-black/0 via-black/0 to-black/10 dark:from-black/10 dark:via-black/15 dark:to-black/40 pointer-events-none" />

            <ScenarioRunner
              scenarioKey={activeScenario}
              setCaption={setCaptionText}
              setSpokenScript={setSpokenScript}
              selectedChildId={selectedChildId || undefined}
              isSpeaking={isSpeaking}
              selectedLanguage={selectedLanguage}
            />

            <div className="absolute inset-0 z-10">
              <Suspense
                fallback={
                  <div className="h-full grid place-items-center text-muted-foreground">
                    Loading avatar…
                  </div>
                }
              >
                <AvatarCanvas modelUrl="https://models.readyplayer.me/68f9edd6a9529d2d623bdb8b.glb?morphTargets=ARKit" />
              </Suspense>
            </div>

            <div className="avatar-overlay overlay-smart drop-shadow-md absolute right-2 top-2 z-20">
              <div className="cam-box rounded-xl overflow-hidden border border-white/40 backdrop-blur bg-white/30 dark:bg-zinc-900/40">
                <Suspense fallback={null}>
                  <EmotionTracker />
                </Suspense>
              </div>
            </div>

            <div
              className="absolute inset-x-0 z-20 pointer-events-none"
              style={{
                bottom:
                  "calc(env(safe-area-inset-bottom, 0px) + 16px)",
              }}
            >
              <div className="flex justify-center">
                <div className="pointer-events-auto">
                  <div className="flex items-center justify-center gap-3 px-3">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="rounded-full bg-background/80 backdrop-blur border-border/80 shadow-sm"
                        onClick={handleRepeat}
                        disabled={processing || !spokenScript}
                        aria-label="Repeat last script"
                      >
                        <RotateCw className="w-4 h-4" />
                      </Button>
                    </div>

                    <Suspense fallback={null}>
                      <AudioRecorder
                        onUserTranscript={(t) =>
                          addTurn({
                            speaker: "child",
                            text: t,
                          })
                        }
                        onAssistant={(reply) => {
                          setCaptionText(reply);
                          addTurn({
                            speaker: "assistant",
                            text: reply,
                          });
                          setIsPaused(false);
                        }}
                        onProcessingChange={(v) =>
                          setProcessing(v)
                        }
                      />
                    </Suspense>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="rounded-full bg-background/80 backdrop-blur border-border/80 shadow-sm"
                        onClick={handlePlayPauseToggle}
                        disabled={processing || !spokenScript}
                        aria-label={
                          isPaused ? "Play / Restart" : "Pause"
                        }
                      >
                        {isPaused ? (
                          <Play className="w-4 h-4" />
                        ) : (
                          <Pause className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-3 md:px-4 py-3">
            <div className="rounded-xl bg-primary/10 dark:bg-primary/20 text-primary px-3 py-2 text-center border border-border">
              {captionText || "Let's begin our fun activity!"}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-0 flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Language:
        </span>
        <Select
          value={selectedLanguage}
          onValueChange={(value: string) =>
            setSelectedLanguage(value as LangCode)
          }
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="hi">Hindi</SelectItem>
            <SelectItem value="pa">Punjabi</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-sm text-muted-foreground">
          Active scenario:
        </span>
        <Badge variant="outline">
          {SCENARIOS[activeScenario].title}
        </Badge>

        <div className="flex gap-2 flex-wrap">
          {([
            "greeting_teacher",
            "ask_help",
            "wait_turn",
            "share_play",
            "calm_down",
          ] as const).map((key) => (
            <button
              key={key}
              onClick={() => {
                stopSpeech();
                setIsPaused(false);
                setActiveScenario(key);
              }}
              className={[
                "px-3 py-1.5 rounded-lg text-sm border transition",
                activeScenario === key
                  ? "bg-primary text-white border-primary"
                  : "bg-background/60 hover:bg-background border-border",
              ].join(" ")}
            >
              {SCENARIOS[key].title}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
