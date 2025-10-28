// Minimal in-memory session store for one active session.

export type Speaker = "user" | "assistant" | "system";
export type Emotion =
  | "neutral" | "happy" | "sad" | "angry" | "fearful"
  | "disgusted" | "surprised" | "frustrated" | "engaged" | "bored";

export type Turn = {
  id: string;
  at: string;               // ISO
  speaker: Speaker;
  text?: string;
  durationMs?: number;
  attention?: number;       // 0..1 (avg during this turn)
  emotion?: Emotion;
};

export type Session = {
  id: string;
  startedAt: string;
  endedAt?: string;
  childName?: string;
  therapistName?: string;
  location?: string;
  notes?: string;
  turns: Turn[];
};

let _session: Session | null = null;

export function startSession(meta?: Partial<Pick<Session,
  "childName" | "therapistName" | "location" | "notes">>
) {
  _session = {
    id: `sess_${Date.now()}`,
    startedAt: new Date().toISOString(),
    childName: meta?.childName,
    therapistName: meta?.therapistName,
    location: meta?.location,
    notes: meta?.notes,
    turns: [],
  };
  return _session;
}

export function addTurn(t: Omit<Turn, "id" | "at"> & { id?: string; at?: string }) {
  if (!_session) startSession();
  _session!.turns.push({
    id: t.id ?? `turn_${_session!.turns.length + 1}`,
    at: t.at ?? new Date().toISOString(),
    speaker: t.speaker,
    text: t.text,
    durationMs: t.durationMs,
    attention: t.attention,
    emotion: t.emotion,
  });
}

export function endSession() {
  if (_session) _session.endedAt = new Date().toISOString();
  return _session;
}

export function getSession(): Session | null {
  return _session;
}

// Optional: reset if you want a brand-new session
export function resetSession() { _session = null; }

// Small helpers so your UI code is clean:
export function addUserTurn(p: Omit<Turn, "id" | "at" | "speaker">) {
  addTurn({ ...p, speaker: "user" });
}
export function addAssistantTurn(p: Omit<Turn, "id" | "at" | "speaker">) {
  addTurn({ ...p, speaker: "assistant" });
}
