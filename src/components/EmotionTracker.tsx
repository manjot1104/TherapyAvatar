"use client";

import React, { useEffect, useRef, useState } from "react";

/** -------- Settings -------- */
const MP_TASKS_VERSION = "0.10.3";
const MP_WASM_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_TASKS_VERSION}/wasm`;
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const WS_URL   = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4050";

/** Simple engagement: gaze near center + eyes open */
function computeEngagement(gaze: { x: number; y: number }, blinkRatio: number) {
  const gazeScore = 1 - Math.min(1, Math.abs(gaze.x) + Math.abs(gaze.y)); // 0..1
  const eyesOpen  = Math.max(0, Math.min(1, 1 - blinkRatio));             // 1=open
  return +(0.7 * gazeScore + 0.3 * eyesOpen).toFixed(2);
}

type Props = {
  /** Shown output canvas (CSS px). Rendered at 2x for crispness. */
  width?: number;
  height?: number;
  /** Don’t draw landmarks (lower CPU). */
  noDots?: boolean;
  /** Session id to tag metrics with. */
  sessionId?: string;
};

export default function EmotionTracker({
  width = 320,
  height = 240,
  noDots = false,
  sessionId = "demo",
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const landmarkerRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);

  // WS with auto-reconnect
  const wsRef = useRef<WebSocket | null>(null);
  const wsRetryRef = useRef<number>(1000);

  const [status, setStatus] = useState("Starting…");
  const [fps, setFps] = useState(0);
  const lastSendRef = useRef<number>(0);

  /* ---------------- WS connect (auto-reconnect) ---------------- */
  useEffect(() => {
    let closed = false;

    function connect() {
      try {
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          wsRetryRef.current = 1000;
          // console.log("[gaze] WS connected");
        };
        ws.onclose = () => {
          if (closed) return;
          // exponential-ish backoff
          const delay = Math.min(15000, wsRetryRef.current);
          wsRetryRef.current = Math.min(15000, Math.round(wsRetryRef.current * 1.7));
          setTimeout(connect, delay);
        };
        ws.onerror = () => {
          try { ws.close(); } catch {}
        };
      } catch {
        // retry later
        const delay = Math.min(15000, wsRetryRef.current);
        wsRetryRef.current = Math.min(15000, Math.round(wsRetryRef.current * 1.7));
        setTimeout(connect, delay);
      }
    }

    connect();
    return () => {
      closed = true;
      try { wsRef.current?.close(); } catch {}
      wsRef.current = null;
    };
  }, []);

  /* ---------------- Camera + FaceLandmarker loop ---------------- */
  useEffect(() => {
    let running = true;
    let visible = !document.hidden;

    const onVis = () => {
      visible = !document.hidden;
      // When hidden, pause the loop to save CPU
      if (!visible && rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      } else if (visible && !rafRef.current) {
        rafRef.current = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    const cleanups: Array<() => void> = [() => document.removeEventListener("visibilitychange", onVis)];

    let W = width, H = height;
    let ctx: CanvasRenderingContext2D | null = null;
    let lastTime = performance.now();

    async function init() {
      try {
        setStatus("Requesting camera…");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width, height },
          audio: false,
        });
        if (!running) return;

        const video = videoRef.current!;
        video.srcObject = stream;
        try { await video.play(); } catch {} // Safari sometimes rejects; the canvas still works

        setStatus("Loading face model…");
        const mp = await import("@mediapipe/tasks-vision");
        const fileset = await mp.FilesetResolver.forVisionTasks(MP_WASM_URL);

        const landmarker = await mp.FaceLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: MODEL_URL },
          numFaces: 1,
          runningMode: "VIDEO",
          outputFaceBlendshapes: true,
        });
        landmarkerRef.current = landmarker;

        // canvas setup (2x backing for crisp small widget)
        const canvas = canvasRef.current!;
        const scale = 2;
        W = video.videoWidth || width;
        H = video.videoHeight || height;
        canvas.width = W * scale;
        canvas.height = H * scale;
        canvas.style.width = `${W}px`;
        canvas.style.height = `${H}px`;

        ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("No 2D context");
        ctx.setTransform(scale, 0, 0, scale, 0, 0);

        setStatus("Tracking…");
        rafRef.current = requestAnimationFrame(loop);

        // cleanup: stop camera
        cleanups.push(() => {
          const s = video.srcObject as MediaStream | null;
          s?.getTracks().forEach((t) => t.stop());
          video.srcObject = null;
        });
        // cleanup: model
        cleanups.push(() => landmarker.close?.());
      } catch (err) {
        console.error("[EmotionTracker] init error:", err);
        setStatus("Camera/model failed (permissions or network).");
      }
    }

    const loop = () => {
      if (!running || !ctx) return;

      const now = performance.now();
      const dt = now - lastTime;
      lastTime = now;
      setFps((prev) => (dt > 0 ? Math.round(1000 / dt) : prev));

      const video = videoRef.current!;
      // mirror draw
      ctx.save();
      ctx.clearRect(0, 0, W, H);
      ctx.scale(-1, 1);
      ctx.drawImage(video, -W, 0, W, H);
      ctx.restore();

      let result: any = null;
      try { result = landmarkerRef.current?.detectForVideo(video, now); } catch {}

      if (result?.faceLandmarks?.length) {
        const lm = result.faceLandmarks[0];

        if (!noDots) {
          ctx.fillStyle = "rgba(255,255,255,0.9)";
          for (const p of lm) {
            const x = (1 - p.x) * W; // mirrored
            const y = p.y * H;
            ctx.beginPath(); ctx.arc(x, y, 1.2, 0, Math.PI * 2); ctx.fill();
          }
        }

        const gaze = roughGaze(lm);
        const blink = computeBlink(lm);
        const attention = computeEngagement(gaze, blink);

        // send every ~300ms
        if (now - lastSendRef.current > 300) {
          lastSendRef.current = now;
          const payload = {
            sessionId,
            ts: Date.now(),
            metrics: { gaze, blink, attention },
          };

          // Prefer WS, fallback to HTTP
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            try { wsRef.current.send(JSON.stringify(payload)); } catch {}
          } else {
            fetch(`${API_BASE}/frames`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ts: payload.ts,
                gaze: payload.metrics.gaze,
                aus: { }, // optional, you can map more later
                blendshapes: (result.faceBlendshapes?.[0]?.categories || [])
                  .slice(0, 8)
                  .map((c: any) => ({ categoryName: c.categoryName, score: +c.score.toFixed(3) })),
              }),
              keepalive: true,
            }).catch(() => {});
          }
        }
      }

      if (document.hidden) {
        rafRef.current = null;
        return; // paused by visibility handler
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    init();

    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      for (const c of cleanups) try { c(); } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height, noDots, sessionId]);

  return (
    <div
      className="relative rounded-lg overflow-hidden border-4 border-white shadow-lg"
      style={{ width, height }}
    >
      <video ref={videoRef} className="hidden" playsInline muted />
      <canvas ref={canvasRef} className="w-full h-full bg-black" />
      <div className="absolute top-1 left-1 bg-white/80 rounded px-2 text-[10px] font-semibold text-slate-700">
        {status} • {fps ? `${fps} fps` : ""}
      </div>
    </div>
  );
}

/* ---------------- helpers ---------------- */

function roughGaze(lm: any[]) {
  const L_OUT = lm[33], L_IN = lm[133], R_IN = lm[362], R_OUT = lm[263];
  if (!L_OUT || !L_IN || !R_IN || !R_OUT) return { x: 0, y: 0 };
  const eyeCenterX = (L_OUT.x + L_IN.x + R_IN.x + R_OUT.x) / 4;
  const gazeX = (0.5 - eyeCenterX) * 2; // -1..+1
  const L_UP = lm[159], L_DN = lm[145], R_UP = lm[386], R_DN = lm[374];
  let gazeY = 0;
  if (L_UP && L_DN && R_UP && R_DN) {
    const ly = (L_UP.y + L_DN.y) / 2;
    const ry = (R_UP.y + R_DN.y) / 2;
    gazeY = ((ly + ry) / 2 - 0.5) * 2; // -1..+1
  }
  return { x: +gazeX.toFixed(3), y: +gazeY.toFixed(3) };
}

/** Eye-aspect ratio proxy: vertical / horizontal (smaller => blink) */
function computeBlink(lm: any[]) {
  const L_EYE = [lm[159], lm[145], lm[33], lm[133]];
  const R_EYE = [lm[386], lm[374], lm[362], lm[263]];
  const d = (a: any, b: any) => Math.hypot(a.x - b.x, a.y - b.y);
  let l = 0, r = 0;
  if (L_EYE.every(Boolean)) l = d(L_EYE[0], L_EYE[1]) / Math.max(1e-6, d(L_EYE[2], L_EYE[3]));
  if (R_EYE.every(Boolean)) r = d(R_EYE[0], R_EYE[1]) / Math.max(1e-6, d(R_EYE[2], R_EYE[3]));
  return +(((l + r) / 2)).toFixed(2);
}
