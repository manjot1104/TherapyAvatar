// src/components/TherapistPanel.tsx
"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type SkillKey = string;

export type TherapistPanelProps = {
  disabled?: boolean;
  currentSkill: SkillKey;
  onPause: () => void;
  onRepeat: () => Promise<void> | void;
  onSimplify: () => void;
  onNext: () => void;
  onCalm: () => void;
  onMarkAttempt: (skill: SkillKey) => void;
  onMarkSuccess: (skill: SkillKey) => void;
  onAsk: (q: string) => Promise<void> | void;
};

export default function TherapistPanel({
  disabled = false,
  currentSkill,
  onPause,
  onRepeat,
  onSimplify,
  onNext,
  onCalm,
  onMarkAttempt,
  onMarkSuccess,
  onAsk,
}: TherapistPanelProps) {
  const [q, setQ] = useState("");
  const canSend = useMemo(() => q.trim().length > 0, [q]);

  return (
    <div className="grid gap-3">
      <Card className="border-dashed">
        <CardContent className="p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Skill</Badge>
            <span className="font-medium">{currentSkill}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onMarkAttempt(currentSkill)}
              disabled={disabled}
            >
              Mark Attempt
            </Button>
            <Button
              size="sm"
              onClick={() => onMarkSuccess(currentSkill)}
              disabled={disabled}
            >
              Mark Success ✅
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <Button variant="outline" onClick={onPause} disabled={disabled}>
          ⏸ Pause
        </Button>
        <Button
          variant="outline"
          onClick={() => void onRepeat()}
          disabled={disabled}
        >
          🔁 Repeat
        </Button>
        <Button variant="outline" onClick={onSimplify} disabled={disabled}>
          🧩 Simplify
        </Button>
        <Button variant="outline" onClick={onNext} disabled={disabled}>
          ⏭️ Next
        </Button>
        <Button variant="outline" onClick={onCalm} disabled={disabled}>
          🫶 Calm
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Input
          placeholder="Type a prompt/question to ask…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && canSend && !disabled) {
              const text = q.trim();
              setQ("");
              void onAsk(text);
            }
          }}
          disabled={disabled}
        />
        <Button
          onClick={() => {
            const text = q.trim();
            if (!text) return;
            setQ("");
            void onAsk(text);
          }}
          disabled={!canSend || disabled}
        >
          🎙️ Ask
        </Button>
      </div>
    </div>
  );
}
