// src/utils/guard.ts
const BAD = /\b(adult|kill|hurt|medicine|diagnosis|drug|sex|violence)\b/gi;
const ALLOWLIST_TOPICS = ['greetings', 'emotions', 'routines', 'feelings', 'play', 'count', 'breathe'];

export function guardAndClamp(input: string): string {
  let t = (input || "").toString().slice(0, 240);
  if (BAD.test(t) || !ALLOWLIST_TOPICS.some(topic => t.toLowerCase().includes(topic))) {
    t = "Let's talk about feelings and play.";
  }
  return t;
}