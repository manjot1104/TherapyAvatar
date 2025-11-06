// lib/heuristics.ts
export const skillKeywords: Record<string, string[]> = {
  "skill_aac_requesting_1": ["want", "chahiye", "mangu", "request", "symbol"],
  "skill_joint_attention_1": ["dekho", "look", "see", "nazr"],
  "skill_parent_autism_intro": ["autism", "what is autism", "ASD"],
  // ...
};

export function inferEvidenceFromText(text: string) {
  const t = text.toLowerCase();
  const hits: string[] = [];
  for (const [skill, keys] of Object.entries(skillKeywords)) {
    if (keys.some(k => t.includes(k))) hits.push(skill);
  }
  // crude observation: positive if “I did / samajh aaya / ho gaya”
  const observation = /(\bdid\b|\bdone\b|samajh|ho gaya|understood)/.test(t) ? 0.8 : 0.5;
  return { hits, observation };
}

