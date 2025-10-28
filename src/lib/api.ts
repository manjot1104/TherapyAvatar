const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function respond(text: string, kbHint?: string, module?: string) {
  if (!API_BASE) throw new Error("API base URL is not set");
  const r = await fetch(`${API_BASE}/respond`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, kbHint, module }),
  });
  if (!r.ok) throw new Error("respond failed");
  return r.json() as Promise<{ text: string; speakClient: boolean }>;
}
