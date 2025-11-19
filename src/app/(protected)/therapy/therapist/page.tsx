// src/app/(protected)/therapy/therapist/page.tsx
"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TherapistPanel from "@/components/TherapistPanel";

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
      <div className="flex items-center justify-between gap-2 ">
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


      {/* Therapist control panel */}
      <Card className="border-dashed border-border bg-card/70 ">
        <CardContent className="p-4 ">
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
