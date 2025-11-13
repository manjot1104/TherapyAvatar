// src/lib/speak.ts

let speakingLock = false;

/* ========= Small helpers ========= */

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.speechSynthesis !== "undefined";
}

function waitForVoices(timeoutMs = 2000): Promise<void> {
  if (!isBrowser()) return Promise.resolve();

  return new Promise((resolve) => {
    const synth = window.speechSynthesis;
    const have = () => synth.getVoices().length > 0;
    if (have()) return resolve();

    const t = setTimeout(() => resolve(), timeoutMs);

    const handler = () => {
      if (have()) {
        clearTimeout(t);
        synth.removeEventListener("voiceschanged", handler);
        resolve();
      }
    };

    synth.addEventListener("voiceschanged", handler);
  });
}

async function waitForAvatar(timeoutMs = 4000): Promise<any> {
  if (!isBrowser()) return null;
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

/* ========= iOS unlock logic ========= */

let unlocked = false;
let unlockPromise: Promise<void> | null = null;

/**
 * On iOS/Safari, speech is blocked until user gesture.
 * This waits for first tap/click/touch, then warms up audio.
 */
export async function ensureSpeechUnlocked(): Promise<void> {
  if (!isBrowser()) return;
  if (unlocked) return;

  if (!unlockPromise) {
    unlockPromise = new Promise<void>((resolve) => {
      const done = () => {
        unlocked = true;

        // Optional tiny AudioContext warmup (helps some browsers)
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const Ctor = (window as any).AudioContext || (window as any).webkitAudioContext;
          if (Ctor) {
            const ctx = new Ctor();
            const node = ctx.createOscillator();
            const gain = ctx.createGain();
            gain.gain.value = 0.0001;
            node.connect(gain).connect(ctx.destination);
            node.start();
            node.stop(ctx.currentTime + 0.02);
            setTimeout(() => ctx.close(), 120);
          }
        } catch {
          // ignore
        }

        try {
          window.removeEventListener("click", done);
          window.removeEventListener("touchstart", done);
        } catch {
          // ignore
        }

        resolve();
      };

      // Next user gesture unlocks everything
      window.addEventListener("click", done, { once: true });
      window.addEventListener("touchstart", done, { once: true });
    });
  }

  return unlockPromise;
}

/* ========= Public helpers ========= */

export function stopSpeech() {
  if (!isBrowser()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // ignore
  }
}

/**
 * Main speech helper:
 * - waits for iOS unlock (first user tap)
 * - waits for voices
 * - syncs with avatar visemes
 */
export async function speakInBrowser(
  text: string,
  opts?: { rate?: number; pitch?: number; lang?: string; voiceName?: string }
): Promise<void> {
  if (!isBrowser()) throw new Error("Web Speech not supported");
  const t = (text || "").trim();
  if (!t) return;

  // 🔒 iOS unlock: wait until first tap/click
  await ensureSpeechUnlocked();

  await waitForVoices();
  await waitForAvatar();

  const getA = () => (window as any).__AVATAR__ || null;
  const has = (key: string) => Boolean(getA()?._has?.(key));

  const WIDE = ["jawOpen", "mouthOpen", "viseme_aa", "mouthAa"].find(has) || "jawOpen";
  const ROUND = ["mouthFunnel", "mouthPucker", "viseme_O", "viseme_U"].find(has) || "mouthFunnel";

  const V_A = (["viseme_aa", WIDE, "jawOpen"] as string[]).find(has) || WIDE;
  const V_E = (["viseme_E", WIDE, "mouthSmile"] as string[]).find(has) || WIDE;
  const V_I = (["viseme_I", WIDE, "mouthSmile"] as string[]).find(has) || WIDE;
  const V_O = (["viseme_O", ROUND, "mouthFunnel"] as string[]).find(has) || ROUND;
  const V_U = (["viseme_U", ROUND, "mouthFunnel"] as string[]).find(has) || ROUND;

  const words = (t.match(/\S+/g) || []).length || 1;
  const rate = opts?.rate ?? 0.95;
  const baseWPM = 150;
  const wpm = Math.max(100, baseWPM * rate);
  const estDurationMs = (words / (wpm / 60)) * 1000;

  const letters = t.replace(/\s+/g, "").length || 1;
  let charMs = Math.max(70, estDurationMs / letters);
  charMs = Math.min(charMs, 130);

  type KeyVal = { time: number; key: string; value: number };
  const timeline: KeyVal[] = [];

  let time = 0;
  const push = (key: string, value: number) => timeline.push({ time, key, value });

  for (const chRaw of t) {
    const ch = chRaw.toLowerCase();

    if (/\s/.test(ch)) {
      time += charMs * 0.85;
      continue;
    }
    if (/[.,!?;:]/.test(ch)) {
      push(WIDE, 0.35);
      time += charMs * 0.6;
      continue;
    }
    if ("aáàâäã".includes(ch)) {
      push(V_A, 0.98);
      time += charMs;
      continue;
    }
    if ("eéèêë".includes(ch)) {
      push(V_E, 0.92);
      time += charMs;
      continue;
    }
    if ("iíìîï".includes(ch)) {
      push(V_I, 0.90);
      time += charMs;
      continue;
    }
    if ("oóòôöõ".includes(ch)) {
      push(V_O, 0.96);
      time += charMs;
      continue;
    }
    if ("uúùûü".includes(ch)) {
      push(V_U, 0.94);
      time += charMs;
      continue;
    }
    if ("pbm".includes(ch)) {
      push("viseme_PP", 0.75);
      time += charMs * 0.90;
      continue;
    }
    if ("fvw".includes(ch)) {
      push("viseme_FF", 0.68);
      time += charMs * 0.95;
      continue;
    }
    if ("tðþθ".includes(ch)) {
      push("viseme_TH", 0.66);
      time += charMs * 0.95;
      continue;
    }
    if ("dnl".includes(ch)) {
      push("viseme_DD", 0.60);
      time += charMs * 0.95;
      continue;
    }
    if ("kgxq".includes(ch)) {
      push("viseme_kk", 0.66);
      time += charMs * 0.95;
      continue;
    }
    if ("cszj".includes(ch)) {
      push("viseme_SS", 0.62);
      time += charMs * 0.95;
      continue;
    }
    if ("r".includes(ch)) {
      push("viseme_RR", 0.64);
      time += charMs * 0.95;
      continue;
    }

    // default mouth shape
    push(ROUND, 0.60);
    time += charMs;
  }

  const timelineEndMs = timeline.length ? timeline[timeline.length - 1].time : 0;

  return new Promise<void>((resolve) => {
    const synth = window.speechSynthesis;

    if (speakingLock) {
      try {
        synth.cancel();
      } catch {
        // ignore
      }
    }
    speakingLock = true;

    const u = new SpeechSynthesisUtterance(t);
    u.rate = rate;
    u.pitch = opts?.pitch ?? 1.0;
    u.lang = opts?.lang ?? "en-US";

    const voices = synth.getVoices();
    let v: SpeechSynthesisVoice | undefined;

    if (opts?.voiceName) {
      v = voices.find((x) => x.name === opts.voiceName);
    }
    if (!v) {
      v = voices.find(
        (x) => /en[-_]US/i.test(x.lang) && /Google|Microsoft|Samantha|Daniel/.test(x.name)
      );
    }
    if (!v) {
      v = voices.find((x) => /en/i.test(x.lang));
    }
    if (v) u.voice = v;

    let fillerInt: any = null;
    let rafId: number | null = null;
    let startedAt = 0;

    const startOsc = () => {
      const A = 0.6;
      const B = 0.5;
      const F = 2.8;
      const BASE = 0.12;
      const t0 = performance.now();

      const tick = () => {
        if (!synth.speaking) return;
        const s = Math.sin(((performance.now() - t0) / 1000) * Math.PI * 2 * F);
        const wide = Math.max(0, BASE + A * Math.max(0, s));
        const round = Math.max(0, BASE + B * Math.max(0, -s));
        (window as any).__AVATAR__?.setWeight?.(WIDE, wide);
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
        if (elapsed > timelineEndMs + 150) {
          (window as any).__AVATAR__?.pulseWord?.();
        }
      }, 140);

      startOsc();
    };

    const cleanup = () => {
      if (fillerInt) clearInterval(fillerInt);
      if (rafId !== null) cancelAnimationFrame(rafId);
      (window as any).__AVATAR__?.playVisemes?.([]);
      speakingLock = false;
    };

    u.onend = () => {
      cleanup();
      resolve();
    };
    u.onerror = () => {
      cleanup();
      resolve();
    };

    try {
      synth.cancel();
    } catch {
      // ignore
    }
    synth.speak(u);
  });
}
