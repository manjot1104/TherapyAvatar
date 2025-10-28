// simple but robust energy-based VAD using WebAudio AnalyserNode
export type VADOpts = {
  // FFT window (must be power of 2)
  fftSize?: number;            // default 1024

  // Gating
  minVoiceMs?: number;         // min continuous loudness to start speech (default 140ms)
  silenceMs?: number;          // continuous quiet to end speech (default 900ms)

  // Initial (fallback) thresholds; will be adapted by noise floor
  startThreshold?: number;     // default 0.02 (energy 0..1)
  stopThreshold?: number;      // default 0.012

  // EMA smoothing for energy (0..1; higher = smoother/slower)
  energySmoothing?: number;    // default 0.2

  // How aggressively to push thresholds above noise floor
  noiseMargin?: number;        // default 1.8 (multiplier over floor)
  maxThreshold?: number;       // default 0.12 (don't go crazy)

  // If provided and returns true, VAD will be idle (e.g., while TTS speaks)
  isBlocked?: () => boolean;

  // Callbacks
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;    // fires when we transition to silence
  onEnergy?: (v: number) => void; // visual meter, post-smoothing energy
  onDebug?: (info: {
    rms: number; ema: number; noise: number;
    effStart: number; effStop: number; speaking: boolean;
  }) => void;
};

export function startVAD(
  audioCtx: AudioContext,
  stream: MediaStream,
  opts: VADOpts = {}
) {
  const cfg = {
    fftSize: 1024,
    minVoiceMs: 140,
    silenceMs: 900,
    startThreshold: 0.02,
    stopThreshold: 0.012,
    energySmoothing: 0.2,
    noiseMargin: 1.8,
    maxThreshold: 0.12,
    isBlocked: undefined as (() => boolean) | undefined,
    onSpeechStart: undefined as (() => void) | undefined,
    onSpeechEnd: undefined as (() => void) | undefined,
    onEnergy: undefined as ((v: number) => void) | undefined,
    onDebug: undefined as ((info: any) => void) | undefined,
    ...opts,
  };

  // WebAudio graph
  const src = audioCtx.createMediaStreamSource(stream);
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = cfg.fftSize;
  src.connect(analyser);

  const time = new Float32Array(analyser.fftSize);

  // State
  let speaking = false;
  let voiceAccumMs = 0;
  let silenceAccumMs = 0;

  // Energy tracking
  let ema = 0;         // smoothed RMS
  let noise = 0.0025;  // learned noise floor (very low initial)
  const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

  // timing
  let rafId = 0;
  let last = performance.now();

  // expose a few runtime adjustments
  const state = {
    get speaking() { return speaking; },
    get noise() { return noise; },
    get ema() { return ema; },
    setThresholds(start: number, stop: number) {
      cfg.startThreshold = start;
      cfg.stopThreshold = stop;
    }
  };

  const tick = () => {
    const now = performance.now();
    const dt = now - last; // ms since last frame
    last = now;

    // Pull PCM & compute RMS with DC offset removal
    analyser.getFloatTimeDomainData(time);
    let mean = 0;
    for (let i = 0; i < time.length; i++) mean += time[i];
    mean /= time.length;

    let sumSq = 0;
    for (let i = 0; i < time.length; i++) {
      const x = time[i] - mean; // remove DC
      sumSq += x * x;
    }
    const rms = Math.sqrt(sumSq / time.length); // typical room ~0..0.02

    // EMA smoothing (prevents jitter)
    const alpha = clamp01(cfg.energySmoothing);
    ema = alpha * ema + (1 - alpha) * rms;

    // Learn noise floor whenever not speaking & not blocked
    const blocked = cfg.isBlocked?.() === true;
    if (!speaking && !blocked) {
      // slow approach to current energy; very small step so it doesn't jump to speech
      noise = 0.995 * noise + 0.005 * ema;
    }

    // Effective thresholds (adaptive)
    const effStart = Math.min(cfg.maxThreshold, Math.max(cfg.startThreshold, noise * cfg.noiseMargin));
    const effStop  = Math.min(cfg.maxThreshold, Math.max(cfg.stopThreshold,  noise * (cfg.noiseMargin * 0.6)));

    // Optional: meter + debug
    cfg.onEnergy?.(ema);
    cfg.onDebug?.({ rms, ema, noise, effStart, effStop, speaking });

    if (blocked) {
      // While blocked (e.g., TTS speaking), reset accumulators so we don't trigger
      voiceAccumMs = 0;
      silenceAccumMs = 0;
    } else if (!speaking) {
      // waiting for speech start
      if (ema > effStart) {
        voiceAccumMs += dt;
        if (voiceAccumMs >= cfg.minVoiceMs) {
          speaking = true;
          silenceAccumMs = 0;
          cfg.onSpeechStart?.();
        }
      } else {
        voiceAccumMs = Math.max(0, voiceAccumMs - dt * 0.5); // gentle decay
      }
    } else {
      // in speech, wait for sustained silence
      if (ema < effStop) {
        silenceAccumMs += dt;
        if (silenceAccumMs >= cfg.silenceMs) {
          speaking = false;
          voiceAccumMs = 0;
          cfg.onSpeechEnd?.();
        }
      } else {
        silenceAccumMs = Math.max(0, silenceAccumMs - dt * 0.5); // gentle decay
      }
    }

    rafId = requestAnimationFrame(tick);
  };

  last = performance.now();
  rafId = requestAnimationFrame(tick);

  return {
    stop() {
      cancelAnimationFrame(rafId);
      try { src.disconnect(); analyser.disconnect(); } catch {}
    },
    getState() { return state; }
  };
}
