let speakingLock = false;

function waitForVoices(timeoutMs = 2000): Promise<void> {
  return new Promise((resolve) => {
    const have = () => speechSynthesis.getVoices().length > 0;
    if (have()) return resolve();
    const t = setTimeout(() => resolve(), timeoutMs);
    const handler = () => { if (have()) { clearTimeout(t); speechSynthesis.removeEventListener("voiceschanged", handler); resolve(); } };
    speechSynthesis.addEventListener("voiceschanged", handler);
  });
}

async function waitForAvatar(timeoutMs = 4000): Promise<any> {
  const start = performance.now();
  return new Promise((resolve) => {
    const tick = () => {
      const A = (window as any).__AVATAR__;
      if (A && typeof A.setWeight === "function") return resolve(A);
      if (performance.now() - start > timeoutMs) return resolve(null);
      requestAnimationFrame(tick);
    };
    tick();
  });
}

export async function ensureSpeechUnlocked(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    await ctx.resume();
    const node = ctx.createOscillator();
    const gain = ctx.createGain();
    gain.gain.value = 0.0001;
    node.connect(gain).connect(ctx.destination);
    node.start();
    node.stop(ctx.currentTime + 0.02);
    setTimeout(() => ctx.close(), 120);
  } catch {}
  await waitForVoices();
}

export async function speakInBrowser(
  text: string,
  opts?: { rate?: number; pitch?: number; lang?: string; voiceName?: string }
): Promise<void> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) throw new Error("Web Speech not supported");
  const t = (text || "").trim(); if (!t) return;

  await waitForVoices();
  const getA = () => (window as any).__AVATAR__ || null;
  await waitForAvatar();

  const has  = (key: string) => Boolean(getA()?._has?.(key));
  const WIDE  = ["jawOpen","mouthOpen","viseme_aa","mouthAa"].find(has) || "jawOpen";
  const ROUND = ["mouthFunnel","mouthPucker","viseme_O","viseme_U"].find(has) || "mouthFunnel";
  const V_A = (["viseme_aa", WIDE, "jawOpen"] as string[]).find(has) || WIDE;
  const V_E = (["viseme_E",  WIDE, "mouthSmile"] as string[]).find(has) || WIDE;
  const V_I = (["viseme_I",  WIDE, "mouthSmile"] as string[]).find(has) || WIDE;
  const V_O = (["viseme_O",  ROUND,"mouthFunnel"] as string[]).find(has) || ROUND;
  const V_U = (["viseme_U",  ROUND,"mouthFunnel"] as string[]).find(has) || ROUND;

  const words = (t.match(/\S+/g) || []).length || 1;
  const rate  = opts?.rate ?? 0.95;
  const baseWPM = 150;
  const wpm   = Math.max(100, baseWPM * rate);
  const estDurationMs = (words / (wpm / 60)) * 1000;
  const letters = t.replace(/\s+/g, "").length || 1;
  let charMs = Math.max(70, estDurationMs / letters); charMs = Math.min(charMs, 130);

  type KeyVal = { time: number; key: string; value: number };
  const timeline: KeyVal[] = [];
  let time = 0;
  const push = (key: string, value: number) => timeline.push({ time, key, value });

  for (const chRaw of t) {
    const ch = chRaw.toLowerCase();
    if (/\s/.test(ch)) { time += charMs * 0.85; continue; }
    if (/[.,!?;:]/.test(ch)) { push(WIDE, 0.35); time += charMs * 0.6; continue; }
    if ("aáàâäã".includes(ch)) { push(V_A, 0.98); time += charMs; continue; }
    if ("eéèêë".includes(ch)) { push(V_E, 0.92); time += charMs; continue; }
    if ("iíìîï".includes(ch)) { push(V_I, 0.90); time += charMs; continue; }
    if ("oóòôöõ".includes(ch)) { push(V_O, 0.96); time += charMs; continue; }
    if ("uúùûü".includes(ch)) { push(V_U, 0.94); time += charMs; continue; }
    if ("pbm".includes(ch)) { push("viseme_PP", 0.75); time += charMs * 0.90; continue; }
    if ("fvw".includes(ch)) { push("viseme_FF", 0.68); time += charMs * 0.95; continue; }
    if ("tðþθ".includes(ch)) { push("viseme_TH", 0.66); time += charMs * 0.95; continue; }
    if ("dnl".includes(ch)) { push("viseme_DD", 0.60); time += charMs * 0.95; continue; }
    if ("kgxq".includes(ch)) { push("viseme_kk", 0.66); time += charMs * 0.95; continue; }
    if ("cszj".includes(ch)) { push("viseme_SS", 0.62); time += charMs * 0.95; continue; }
    if ("r".includes(ch)) { push("viseme_RR", 0.64); time += charMs * 0.95; continue; }
    push(ROUND, 0.60); time += charMs;
  }
  const timelineEndMs = timeline.length ? timeline[timeline.length - 1].time : 0;

  return new Promise<void>((resolve) => {
    if (speakingLock) { try { window.speechSynthesis.cancel(); } catch {} }
    speakingLock = true;

    const u = new SpeechSynthesisUtterance(t);
    u.rate  = rate; u.pitch = opts?.pitch ?? 1.0; u.lang = opts?.lang ?? "en-US";

    const voices = window.speechSynthesis.getVoices();
    let v: SpeechSynthesisVoice | undefined = undefined;
    if (opts?.voiceName) v = voices.find(x => x.name === opts.voiceName);
    if (!v) v = voices.find(x => /en[-_]US/i.test(x.lang) && /Google|Microsoft|Samantha|Daniel/.test(x.name));
    if (!v) v = voices.find(x => /en/i.test(x.lang));
    if (v) u.voice = v;

    let fillerInt: any = null;
    let rafId: number | null = null;
    let startedAt = 0;

    const startOsc = () => {
      const A = 0.6, B = 0.5, F = 2.8, BASE = 0.12;
      const t0 = performance.now();
      const tick = () => {
        if (!speechSynthesis.speaking) return;
        const s = Math.sin(((performance.now() - t0) / 1000) * Math.PI * 2 * F);
        const wide  = Math.max(0, BASE + A * Math.max(0,  s));
        const round = Math.max(0, BASE + B * Math.max(0, -s));
        (window as any).__AVATAR__?.setWeight?.(WIDE,  wide);
        (window as any).__AVATAR__?.setWeight?.(ROUND, round);
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    };

    u.onstart = () => {
      startedAt = performance.now();
      (window as any).__AVATAR__?.playVisemes?.(timeline);
      fillerInt = setInterval(() => {
        const elapsed = performance.now() - startedAt;
        if (elapsed > timelineEndMs + 150) (window as any).__AVATAR__?.pulseWord?.();
      }, 140);
      startOsc();
    };

    const cleanup = () => {
      if (fillerInt) clearInterval(fillerInt);
      if (rafId !== null) cancelAnimationFrame(rafId);
      (window as any).__AVATAR__?.playVisemes?.([]);
      speakingLock = false;
    };

    u.onend = () => { cleanup(); resolve(); };
    u.onerror = () => { cleanup(); resolve(); };

    try { window.speechSynthesis.cancel(); } catch {}
    window.speechSynthesis.speak(u);
  });
}
