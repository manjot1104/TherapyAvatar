export type Speaker = "user" | "assistant" | "system";


export type Emotion =
| "neutral"
| "happy"
| "sad"
| "angry"
| "fearful"
| "disgusted"
| "surprised"
| "frustrated"
| "engaged"
| "bored";


export type Turn = {
id: string;
at: string; // ISO timestamp
speaker: Speaker;
text?: string;
durationMs?: number; // optional speaking/interaction duration
attention?: number; // 0..1
emotion?: Emotion;
};


export type Session = {
id: string;
startedAt: string; // ISO
endedAt?: string; // ISO
childName?: string;
therapistName?: string;
location?: string;
notes?: string;
turns: Turn[];
};


export type SessionAggregate = {
sessionId: string;
from: string;
to: string;
totalDurationMs: number;
totalTurns: number;
userTurns: number;
assistantTurns: number;
avgAttention: number | null; // 0..1
attentionTrend: { t: string; v: number }[]; // ISO + 0..1
emotionCounts: Record<Emotion, number>;
topEmotions: { emotion: Emotion; count: number }[];
speakingTimeMs: { user: number; assistant: number };
};