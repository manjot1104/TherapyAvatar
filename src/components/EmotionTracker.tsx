// src/components/EmotionTracker.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * Minimal, robust emotion tracker wrapper around MediaPipe Tasks (FaceLandmarker).
 * - Lazy-loads @mediapipe/tasks-vision on client
 * - Waits for <video> readiness (dimensions + HAVE_CURRENT_DATA)
 * - Throttles detectForVideo calls
 * - Cleans up landmarker and RAF loops on unmount
 */

type FaceLandmarkerType = {
  setOptions: (opts: any) => void;
  detectForVideo: (video: HTMLVideoElement, ts: number) => any;
  close: () => void;
};

export default function EmotionTracker({
  width = 160,
  height = 120,
  onEmotion,
}: {
  width?: number;
  height?: number;
  onEmotion?: (e: { label: string; confidence: number }) => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const landmarkerRef = useRef<FaceLandmarkerType | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastDetectRef = useRef<number>(0);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "running">("idle");

  useEffect(() => {
    let cancelled = false;

    async function setup() {
      setStatus("loading");

      // 1) Get camera
      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
      } catch (err) {
        console.warn("EmotionTracker: camera permission/availability issue:", err);
        return;
      }
      if (cancelled) return;

      const video = videoRef.current!;
      video.srcObject = stream;
      try {
        await video.play();
      } catch {/* ignore */ }

      // 2) Wait until video has frames and dimensions
      await waitForVideoReady(video);

      if (cancelled) return;

      // 3) Load mediapipe tasks-vision (client-only)
      const vision = await import("@mediapipe/tasks-vision");
      const { FilesetResolver, FaceLandmarker } = vision;

      // NOTE: Using the official mediapipe hosted assets
      const fileset = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      // Create landmarker
      const lm: FaceLandmarkerType = await (FaceLandmarker as any).createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "CPU", // XNNPACK will still show an INFO once; it’s fine.
        },
        runningMode: "VIDEO",
        numFaces: 1,
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: false,
      });

      if (cancelled) {
        try { lm.close(); } catch {}
        return;
      }

      landmarkerRef.current = lm;
      setReady(true);
      setStatus("running");

      // 4) Start loop (throttled)
      const DETECT_EVERY_MS = 120; // ~8 FPS, smooth enough & cool CPU/GPU
      const loop = () => {
        rafRef.current = requestAnimationFrame(loop);

        const now = performance.now();

        // Throttle
        if (now - lastDetectRef.current < DETECT_EVERY_MS) return;

        // Guards
        if (!landmarkerRef.current) return;
        const vid = videoRef.current;
        if (!vid) return;
        if (vid.readyState < 2 || vid.videoWidth === 0 || vid.videoHeight === 0) return;

        // Detect
        try {
          const res = landmarkerRef.current.detectForVideo(vid, now);
          if (res?.faceBlendshapes?.length) {
            const blend = res.faceBlendshapes[0]?.categories ?? [];
            // quick & dirty "emotion" heuristic from blendshapes
            const happy =
              getScore(blend, "mouthSmileLeft") * 0.5 +
              getScore(blend, "mouthSmileRight") * 0.5 +
              getScore(blend, "cheekPuff") * 0.2;

            const surprised =
              getScore(blend, "jawOpen") * 0.6 +
              getScore(blend, "mouthStretch") * 0.4;

            const angry =
              getScore(blend, "browDownLeft") * 0.5 +
              getScore(blend, "browDownRight") * 0.5 +
              getScore(blend, "eyeSquintLeft") * 0.3 +
              getScore(blend, "eyeSquintRight") * 0.3;

            const fear =
              getScore(blend, "jawOpen") * 0.3 +
              getScore(blend, "eyeWideLeft") * 0.5 +
              getScore(blend, "eyeWideRight") * 0.5;

            const neutral = Math.max(0, 1 - (happy + surprised + angry + fear) / 3);

            const scores = [
              { label: "happy", confidence: clamp(happy) },
              { label: "surprise", confidence: clamp(surprised) },
              { label: "angry", confidence: clamp(angry) },
              { label: "fear", confidence: clamp(fear) },
              { label: "neutral", confidence: clamp(neutral) },
            ].sort((a, b) => b.confidence - a.confidence);

            if (onEmotion) onEmotion(scores[0]);
          }
        } catch {
          // Swallow occasional errors (tab backgrounded, context lost, etc.)
        } finally {
          lastDetectRef.current = now;
        }
      };

      rafRef.current = requestAnimationFrame(loop);
    }

    setup();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      try {
        landmarkerRef.current?.close();
      } catch {}
      landmarkerRef.current = null;

      // Stop camera
      const v = videoRef.current;
      const stream = (v?.srcObject as MediaStream) || null;
      stream?.getTracks()?.forEach((t) => t.stop());
      if (v) v.srcObject = null;
    };
  }, [onEmotion]);

  return (
    <div className="relative">
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        width={width}
        height={height}
        className="block w-[160px] h-[120px] md:w-[200px] md:h-[150px] object-cover rounded-xl"
      />
      <div className="absolute bottom-1 right-2 text-[10px] px-1.5 py-0.5 rounded bg-black/50 text-white">
        {status === "running" ? "LIVE" : status.toUpperCase()}
      </div>
    </div>
  );
}

/* ---------------- helpers ---------------- */

function getScore(blend: any[], name: string) {
  const it = blend.find((c) => c.categoryName === name);
  return it ? Number(it.score ?? 0) : 0;
}
function clamp(x: number) {
  return Math.max(0, Math.min(1, x));
}
function waitForVideoReady(video: HTMLVideoElement): Promise<void> {
  return new Promise((resolve) => {
    const ok = () =>
      video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0;
    if (ok()) return resolve();
    const onCanPlay = () => {
      if (ok()) {
        cleanup();
        resolve();
      }
    };
    const onLoadedMeta = () => {
      if (ok()) {
        cleanup();
        resolve();
      }
    };
    const cleanup = () => {
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("loadedmetadata", onLoadedMeta);
    };
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("loadedmetadata", onLoadedMeta);
  });
}
