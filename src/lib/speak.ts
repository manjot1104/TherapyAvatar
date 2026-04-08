// src/lib/speak.ts
// Piper TTS implementation with avatar viseme support
"use client";

// Types will be inferred from dynamic imports
type TTSLogic = any;
type SharedAudioPlayer = any;

let ttsInstance: TTSLogic | null = null;
let ttsInitialized = false;
let initPromise: Promise<void> | null = null;
let speakingLock = false;
let audioPlayerConfigured = false;
const TTS_GAIN = 1.8;

/* ========= Browser check ========= */

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/* ========= TTS Initialization ========= */

/**
 * Initialize TTS with appropriate voice based on language
 */
async function initializeTTS(lang?: string): Promise<any> {
  if (ttsInstance && ttsInitialized) {
    return ttsInstance;
  }

  if (initPromise) {
    await initPromise;
    return ttsInstance!;
  }

  initPromise = (async () => {
    if (!isBrowser()) {
      throw new Error("TTS only works in browser");
    }

    // Dynamic import to avoid SSR issues
    let TTSLogicMod: any = null;
    let audioPlayer: any = null;
    try {
      const mod = await import("speech-to-speech");
      TTSLogicMod = mod.TTSLogic;
      audioPlayer = mod.sharedAudioPlayer;
    } catch (e) {
      // Fall back to Web Speech API later in speakInBrowser
      throw new Error("speech-to-speech module unavailable");
    }

    // Configure shared audio player only once
    if (!audioPlayerConfigured) {
      try {
        audioPlayer.configure({
          autoPlay: true,
          sampleRate: 22050,
          volume: 1.0,
        });
        audioPlayerConfigured = true;
      } catch (error: any) {
        // If already configured, try to reset first
        if (error?.message?.includes("already initialized")) {
          try {
        (audioPlayer as any).reset?.();
            audioPlayer.configure({
              autoPlay: true,
              sampleRate: 22050,
              volume: 1.0,
            });
            audioPlayerConfigured = true;
          } catch {
            // Ignore - assume it's already configured correctly
            audioPlayerConfigured = true;
          }
        } else {
          // Assume configured if error
          audioPlayerConfigured = true;
        }
      }
    }

    // Map language codes to Piper voice IDs
    const voiceMap: Record<string, string> = {
      "en": "en_US-hfc_female-medium",
      "en-US": "en_US-hfc_female-medium",
      "en-IN": "en_US-hfc_female-medium",
      "en-GB": "en_GB-alba-medium",
      "hi": "en_US-hfc_female-medium", // Fallback to English for now
      "hi-IN": "en_US-hfc_female-medium",
      "pa": "en_US-hfc_female-medium", // Fallback to English for now
      "pa-IN": "en_US-hfc_female-medium",
    };

    // Check for SharedArrayBuffer support (required for ONNX Runtime)
    if (typeof SharedArrayBuffer === "undefined") {
      throw new Error(
        "SharedArrayBuffer is not available. Ensure COOP/COEP headers are set."
      );
    }

    const langCode = lang?.toLowerCase().split("-")[0] || "en";
    const voiceId = voiceMap[langCode] || voiceMap[lang || ""] || "en_US-hfc_female-medium";

    // Disable warmUp to reduce initial memory allocation
    // Model will be loaded on first synthesis instead
    ttsInstance = new TTSLogicMod({
      voiceId,
      warmUp: false, // Changed from true to reduce memory usage
    });

    await ttsInstance.initialize();
    ttsInitialized = true;
  })();

  await initPromise;
  return ttsInstance!;
}

/* ========= Avatar helpers ========= */

async function waitForAvatar(timeoutMs = 4000): Promise<any> {
  if (!isBrowser()) return null;
  const existing = (window as any).__AVATAR__;
  // When avatar model is disabled/unavailable, don't block TTS waiting for hooks.
  if (!existing || typeof existing.setWeight !== "function") return null;
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

type Mood = "neutral" | "happy" | "sad" | "angry" | "excited";

function getAvatar(): any | null {
  if (!isBrowser()) return null;
  return (window as any).__AVATAR__ || null;
}

function setAvatarMood(mood: Mood, phase: "pre" | "during" | "after" = "during") {
  const A = getAvatar();
  if (!A) return;

  if (typeof A.setMood === "function") {
    A.setMood(mood, phase);
    return;
  }

  if (typeof A.setExpression === "function") {
    A.setExpression(mood, phase === "after" ? 0 : 1);
    return;
  }

  if (typeof A.setWeight !== "function") return;

  const has = (key: string) => Boolean(A._has?.(key));

  const moodKeys: Record<Mood, string[]> = {
    neutral: [],
    happy: ["happy", "Joy", "joy", "Fun", "smile", "mouthSmile"],
    sad: ["sad", "Sorrow", "sorrow", "frown"],
    angry: ["angry", "Angry"],
    excited: ["Fun", "joy", "happy"],
  };

  const allExprKeys = [
    "happy",
    "Joy",
    "joy",
    "Fun",
    "smile",
    "mouthSmile",
    "sad",
    "Sorrow",
    "sorrow",
    "frown",
    "angry",
    "Angry",
  ];

  for (const k of allExprKeys) {
    if (has(k)) A.setWeight(k, 0);
  }

  if (mood === "neutral" || phase === "after") {
    return;
  }

  const candidates = moodKeys[mood];
  const key = candidates.find(has);
  if (key) {
    A.setWeight(key, 0.9);
  }
}

function avatarTalkStart() {
  const A = getAvatar();
  if (!A) return;
  if (typeof A.setTalking === "function") A.setTalking(true);
  if (typeof A.setGesture === "function") A.setGesture("talk");
  if (typeof A.playGesture === "function") A.playGesture("talk");
}

function avatarTalkStop() {
  const A = getAvatar();
  if (!A) return;
  if (typeof A.setTalking === "function") A.setTalking(false);
  if (typeof A.setGesture === "function") A.setGesture("idle");
  if (typeof A.playGesture === "function") A.playGesture("idle");
}

/* ========= iOS unlock logic ========= */

let unlocked = false;
let unlockPromise: Promise<void> | null = null;

export async function ensureSpeechUnlocked(): Promise<void> {
  if (!isBrowser()) return;
  if (unlocked) return;

  if (!unlockPromise) {
    unlockPromise = new Promise<void>((resolve) => {
      const done = () => {
        unlocked = true;

        try {
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

      window.addEventListener("click", done, { once: true });
      window.addEventListener("touchstart", done, { once: true });
    });
  }

  return unlockPromise;
}

/* ========= Viseme timeline generation ========= */

type KeyVal = { time: number; key: string; value: number };

function applyGain(
  audio: Float32Array | number[] | ArrayLike<number>,
  gain = TTS_GAIN
) {
  const out = new Float32Array(audio.length);
  for (let i = 0; i < audio.length; i++) {
    const s = Number(audio[i]) * gain;
    out[i] = Math.max(-1, Math.min(1, s));
  }
  return out;
}

function generateVisemeTimeline(text: string, rate: number): KeyVal[] {
  const t = text.trim();
  if (!t) return [];

  const avatar = getAvatar();
  const has = (key: string) => Boolean(avatar?._has?.(key));

  const WIDE = ["jawOpen", "mouthOpen", "viseme_aa", "mouthAa"].find(has) || "jawOpen";
  const ROUND = ["mouthFunnel", "mouthPucker", "viseme_O", "viseme_U"].find(has) || "mouthFunnel";

  const V_A = (["viseme_aa", WIDE, "jawOpen"] as string[]).find(has) || WIDE;
  const V_E = (["viseme_E", WIDE, "mouthSmile"] as string[]).find(has) || WIDE;
  const V_I = (["viseme_I", WIDE, "mouthSmile"] as string[]).find(has) || WIDE;
  const V_O = (["viseme_O", ROUND, "mouthFunnel"] as string[]).find(has) || ROUND;
  const V_U = (["viseme_U", ROUND, "mouthFunnel"] as string[]).find(has) || ROUND;

  const words = (t.match(/\S+/g) || []).length || 1;
  const baseWPM = 150;
  const wpm = Math.max(100, baseWPM * rate);
  const estDurationMs = (words / (wpm / 60)) * 1000;

  const letters = t.replace(/\s+/g, "").length || 1;
  let charMs = Math.max(70, estDurationMs / letters);
  charMs = Math.min(charMs, 130);

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

    push(ROUND, 0.60);
    time += charMs;
  }

  return timeline;
}

/* ========= Public API ========= */

export function stopSpeech() {
  if (!isBrowser()) return;
  
  // Stop and clear the sharedAudioPlayer queue
  import("speech-to-speech")
    .then(({ sharedAudioPlayer }) => {
      sharedAudioPlayer.stopAndClearQueue();
    })
    .catch(() => {
      // ignore
    });
  
  // Reset speaking lock
  speakingLock = false;
}

/**
 * Main speech helper with Piper TTS:
 * - waits for iOS unlock (first user tap)
 * - initializes TTS
 * - syncs with avatar visemes + expressions + gesture hooks
 */
export async function speakInBrowser(
  text: string,
  opts?: {
    rate?: number;
    pitch?: number;
    lang?: string;
    voiceName?: string;
    mood?: Mood;
  }
): Promise<void> {
  if (!isBrowser()) throw new Error("TTS only works in browser");
  const t = (text || "").trim();
  if (!t) return;

  await ensureSpeechUnlocked();
  await waitForAvatar();

  const rate = opts?.rate ?? 1.0; // Default to normal speed (100%)
  const mood: Mood = opts?.mood ?? "neutral";

  // Generate viseme timeline
  const timeline = generateVisemeTimeline(t, rate);
  const timelineEndMs = timeline.length ? timeline[timeline.length - 1].time : 0;

  // Try initialize Piper TTS, else fallback to Web Speech API
  let tts: any = null;
  try {
    tts = await initializeTTS(opts?.lang);
  } catch (e) {
    // Fallback path: Web Speech API (no viseme-accurate sync, but audio plays)
    const synth = (window as any).speechSynthesis as SpeechSynthesis | undefined;
    if (synth && typeof synth.speak === "function") {
      const utter = new SpeechSynthesisUtterance(t);
      if (opts?.lang) utter.lang = opts.lang;
      if (opts?.pitch != null) utter.pitch = opts.pitch;
      utter.rate = Math.max(0.5, Math.min(2, rate));
      utter.volume = 1;
      // Basic hooks for avatar mood
      utter.onstart = () => {
        setAvatarMood(mood, "during");
        avatarTalkStart();
      };
      utter.onend = () => {
        avatarTalkStop();
        setAvatarMood("neutral", "after");
      };
      synth.cancel();
      synth.speak(utter);
      return;
    }
    // If even Web Speech API is unavailable, rethrow
    throw e;
  }

  // Dynamic import to avoid SSR
  const { sharedAudioPlayer } = await import("speech-to-speech");

  // Stop any current speech
  if (speakingLock) {
    try {
      sharedAudioPlayer.stopAndClearQueue();
    } catch (e) {
      // Ignore errors
    }
  }
  speakingLock = true;

  // Set pre-mood
  setAvatarMood(mood, "pre");

  try {
    // Synthesize text to audio
    // Wrap in try-catch to handle memory allocation errors
    let result;
    try {
      result = await tts.synthesize(t);
    } catch (synthesizeError: any) {
      // If memory allocation fails, try to clear and retry once
      if (synthesizeError?.message?.includes("memory") || 
          synthesizeError?.message?.includes("allocation")) {
        console.warn("Memory allocation failed, attempting cleanup and retry...");
        // Clear any existing audio queue
        try {
          sharedAudioPlayer.stopAndClearQueue();
        } catch {}
        // Wait a bit for memory to be freed
        await new Promise(resolve => setTimeout(resolve, 500));
        // Retry synthesis
        result = await tts.synthesize(t);
      } else {
        throw synthesizeError;
      }
    }

    // Calculate actual audio duration for proper sync
    const actualAudioDuration = (result.audio.length / result.sampleRate) * 1000;
    
    // Scale timeline to match actual audio duration
    const timelineScale = actualAudioDuration / Math.max(timelineEndMs, 1);
    const scaledTimeline = timeline.map(v => ({
      ...v,
      time: v.time * timelineScale
    }));
    const scaledTimelineEndMs = scaledTimeline.length > 0 
      ? scaledTimeline[scaledTimeline.length - 1].time 
      : actualAudioDuration;

    // Play visemes during audio playback
    let startTime: number | null = null;
    let rafId: number | null = null;
    let fillerInt: any = null;
    let isPlaying = false;
    let audioStarted = false;

    const playVisemes = () => {
      if (!isPlaying || !audioStarted || startTime === null) return;
      
      const elapsed = performance.now() - startTime;
      
      // Find current viseme based on elapsed time
      let currentViseme: KeyVal | null = null;
      for (let i = scaledTimeline.length - 1; i >= 0; i--) {
        if (scaledTimeline[i].time <= elapsed) {
          currentViseme = scaledTimeline[i];
          break;
        }
      }

      // Apply current viseme
      if (currentViseme) {
        const avatar = getAvatar();
        if (avatar?.setWeight) {
          // Reset all visemes first
          const allVisemes = [
            "jawOpen", "mouthOpen", "viseme_aa", "mouthAa",
            "mouthFunnel", "mouthPucker", "viseme_O", "viseme_U",
            "viseme_E", "viseme_I", "viseme_PP", "viseme_FF",
            "viseme_TH", "viseme_DD", "viseme_kk", "viseme_SS", "viseme_RR"
          ];
          allVisemes.forEach(v => {
            if (avatar._has?.(v)) avatar.setWeight(v, 0);
          });
          
          // Set current viseme with smooth transition
          avatar.setWeight(currentViseme.key, currentViseme.value);
        }
      }

      // Continue animation if still playing
      if (isPlaying && audioStarted) {
        rafId = requestAnimationFrame(playVisemes);
      }
    };

    // Set up callbacks to detect when audio actually starts
    if (typeof sharedAudioPlayer.setStatusCallback === "function") {
      try {
        sharedAudioPlayer.setStatusCallback((status: string) => {
          if ((status.includes("playing") || status.includes("start")) && !audioStarted) {
            audioStarted = true;
            startTime = performance.now();
            isPlaying = true;
            avatarTalkStart();
            setAvatarMood(mood, "during");
            getAvatar()?.playVisemes?.(scaledTimeline);
            rafId = requestAnimationFrame(playVisemes);
            
            // Start filler interval
            fillerInt = setInterval(() => {
              if (startTime) {
                const elapsed = performance.now() - startTime;
                if (elapsed > scaledTimelineEndMs + 150) {
                  getAvatar()?.pulseWord?.();
                }
              }
            }, 140);
          }
        });
      } catch (error) {
        // Ignore callback errors
      }
    }

    if (typeof sharedAudioPlayer.setPlayingChangeCallback === "function") {
      try {
        sharedAudioPlayer.setPlayingChangeCallback((playing: boolean) => {
          if (playing && !audioStarted) {
            // Audio just started
            audioStarted = true;
            startTime = performance.now();
            isPlaying = true;
            avatarTalkStart();
            setAvatarMood(mood, "during");
            getAvatar()?.playVisemes?.(scaledTimeline);
            rafId = requestAnimationFrame(playVisemes);
            
            // Start filler interval
            fillerInt = setInterval(() => {
              if (startTime) {
                const elapsed = performance.now() - startTime;
                if (elapsed > scaledTimelineEndMs + 150) {
                  getAvatar()?.pulseWord?.();
                }
              }
            }, 140);
          } else if (!playing && isPlaying) {
            // Cleanup when playback stops
            isPlaying = false;
            audioStarted = false;
            if (fillerInt) clearInterval(fillerInt);
            if (rafId !== null) cancelAnimationFrame(rafId);
            getAvatar()?.playVisemes?.([]);
            avatarTalkStop();
            setAvatarMood("neutral", "after");
            speakingLock = false;
          }
        });
      } catch (error) {
        // Ignore callback errors
      }
    }

    // Use sharedAudioPlayer to play audio (speech-to-speech package's built-in player)
    // This is more efficient and less laggy than manual AudioContext
    try {
      // Add audio to the queue - it will play automatically since autoPlay is true
      sharedAudioPlayer.addAudioIntoQueue(
        applyGain(result.audio, TTS_GAIN),
        result.sampleRate
      );
      
      // Wait for playback to complete using callbacks
      await new Promise<void>((resolve) => {
        let resolved = false;
        let checkCount = 0;
        const maxChecks = Math.ceil(actualAudioDuration / 50) + 40; // Add buffer
        
        // Set up callback to detect when playback finishes
        const checkCompletion = () => {
          if (!sharedAudioPlayer.isAudioPlaying()) {
            if (!resolved) {
              resolved = true;
              resolve();
            }
          }
        };
        
        // Check periodically if playback is done
        const checkInterval = setInterval(() => {
          checkCount++;
          checkCompletion();
          if (resolved || checkCount > maxChecks) {
            clearInterval(checkInterval);
            if (!resolved) {
              resolved = true;
              resolve();
            }
          }
        }, 50);
        
        // Also set a timeout as fallback based on actual audio duration
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            clearInterval(checkInterval);
            resolve();
          }
        }, actualAudioDuration + 1000);
      });
    } catch (error: any) {
      console.error("Failed to play audio with sharedAudioPlayer:", error);
      throw error;
    }

    // Final cleanup
    isPlaying = false;
    if (fillerInt) clearInterval(fillerInt);
    if (rafId !== null) cancelAnimationFrame(rafId);
    getAvatar()?.playVisemes?.([]);
    avatarTalkStop();
    setAvatarMood("neutral", "after");
    speakingLock = false;

  } catch (error) {
    console.error("TTS error:", error);
    // Cleanup on error
    try {
      const { sharedAudioPlayer } = await import("speech-to-speech");
      sharedAudioPlayer.stopAndClearQueue();
    } catch (e) {
      // Ignore
    }
    speakingLock = false;
    avatarTalkStop();
    setAvatarMood("neutral", "after");
    throw error;
  }
}
