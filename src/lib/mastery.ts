// lib/mastery.ts
export function updateMastery(oldScore: number, observation: number, alpha = 0.4) {
  const o = Math.max(0, Math.min(1, observation));
  const base = Number.isFinite(oldScore) ? oldScore : 0;
  return Math.round((alpha * o + (1 - alpha) * base) * 100) / 100;
}

export function statusFrom(mastery: number, obsCount: number, hasAllPrereqs: boolean) {
  if (mastery >= 0.8 && obsCount >= 3) return "mastered";
  if (!hasAllPrereqs) return "blocked";
  if (mastery >= 0.6) return "ready";
  return "learning";
}
