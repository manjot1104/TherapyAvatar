export type MasteryStatus = "attempted" | "success";
export type MasteryEvent = {
  id: string;                // local uuid
  ts: number;                // Date.now()
  skill: string;             // e.g., "greet", "emotion_happy"
  status: MasteryStatus;     // attempted | success
  rater: "manual";           // later: "auto" as well
};

export function mkEvent(skill: string, status: MasteryStatus): MasteryEvent {
  return { id: crypto.randomUUID(), ts: Date.now(), skill, status, rater: "manual" };
}

// Optional: send to backend later
export async function sendEvent(e: MasteryEvent) {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
    await fetch(`${base}/events`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(e) });
  } catch {
    // silent fail in MVP
  }
}
