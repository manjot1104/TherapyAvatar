// src/app/(protected)/therapy/therapist/page.tsx
"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TherapistPanel from "@/components/TherapistPanel";

const AvatarCanvas = dynamic(() => import("@/components/AvatarCanvas"), { ssr: false });
const EmotionTracker = dynamic(() => import("@/components/EmotionTracker"), { ssr: false });

export default function TherapistToolsPage() {
  // Dummy handlers for now – wire them to real logic later
  const currentSkill = "Greeting teacher";

  const handlePause = () => {
    // pause current scenario / avatar speech
    console.log("Pause clicked");
  };

  const handleRepeat = async () => {
    // repeat last instruction / prompt
    console.log("Repeat clicked");
  };

  const handleSimplify = () => {
    // simplify prompt / scenario
    console.log("Simplify clicked");
  };

  const handleNext = () => {
    // move to next step / question
    console.log("Next clicked");
  };

  const handleCalm = () => {
    // play calming script / animation
    console.log("Calm clicked");
  };

  const handleMarkAttempt = (skill: string) => {
    console.log("Mark attempt:", skill);
  };

  const handleMarkSuccess = (skill: string) => {
    console.log("Mark success:", skill);
  };

  const handleAsk = async (q: string) => {
    console.log("Therapist asked:", q);
    // here you could call your assistant API, etc.
  };

  return (
    <section className="grid gap-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Therapist Control Room
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor avatar, emotions, and mark progress while the child interacts.
          </p>
        </div>
        <Badge variant="outline" className="hidden sm:inline-flex">
          Therapist mode
        </Badge>
      </div>

      {/* Avatar + emotion tracker */}
      <Card className="bg-card/90 border-border shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div
            className={[
              "relative w-full",
              "min-h-[380px]",
              "md:min-h-[480px] lg:min-h-[520px]",
            ].join(" ")}
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-indigo-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />

            {/* Avatar */}
            <div className="absolute inset-0 z-10">
              <React.Suspense
                fallback={
                  <div className="h-full grid place-items-center text-muted-foreground">
                    Loading therapist avatar…
                  </div>
                }
              >
                <AvatarCanvas modelUrl="https://models.readyplayer.me/68f9edd6a9529d2d623bdb8b.glb?morphTargets=ARKit" />
              </React.Suspense>
            </div>

            {/* Emotion camera */}
            <div className="absolute right-3 top-3 z-20">
              <div className="rounded-xl overflow-hidden border border-white/40 backdrop-blur bg-white/30 dark:bg-zinc-900/40 shadow-md">
                <React.Suspense fallback={null}>
                  <EmotionTracker />
                </React.Suspense>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Therapist control panel */}
      <Card className="border-dashed border-border bg-card/70">
        <CardContent className="p-4">
          <TherapistPanel
            disabled={false}
            currentSkill={currentSkill}
            onPause={handlePause}
            onRepeat={handleRepeat}
            onSimplify={handleSimplify}
            onNext={handleNext}
            onCalm={handleCalm}
            onMarkAttempt={handleMarkAttempt}
            onMarkSuccess={handleMarkSuccess}
            onAsk={handleAsk}
          />
        </CardContent>
      </Card>
    </section>
  );
}
