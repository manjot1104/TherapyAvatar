// src/utils/api.ts (ya jahan bhi yeh file hai)

// 🔹 Backend ka base URL – Vercel + local dono me env se aayega
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE) {
  // Dev me help karega agar env bhool gaye ho
  console.warn("⚠️ NEXT_PUBLIC_API_URL is not set. API calls will fail.");
}

// Small helper to avoid repeat
async function request<T>(path: string, options: RequestInit): Promise<T> {
  if (!API_BASE) throw new Error("API base URL is not set");

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`❌ API ${path} failed:`, res.status, text);
    throw new Error(`Request to ${path} failed`);
  }

  return res.json() as Promise<T>;
}

/* ---------------- respond ---------------- */
export async function respond(text: string, kbHint?: string, module?: string) {
  return request<{ text: string; speakClient: boolean }>("/respond", {
    method: "POST",
    body: JSON.stringify({ text, kbHint, module }),
  });
}

/* ---------------- health ---------------- */
export async function pingBackend(): Promise<{
  ok: boolean;
  url: string | null;
  detail?: any;
}> {
  const url = API_BASE || null;
  if (!url) {
    return { ok: false, url };
  }
  try {
    const res = await fetch(`${url}/health`, { cache: "no-store" });
    if (!res.ok) return { ok: false, url, detail: res.status };
    const data = await res.json().catch(() => ({}));
    return { ok: Boolean(data?.ok), url, detail: data };
  } catch (e: any) {
    return { ok: false, url, detail: e?.message || String(e) };
  }
}