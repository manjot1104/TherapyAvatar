// src/components/VideoCapture.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";

type Props = {
  /** Small = tighter cap. Dono responsive hain, bas max alag. */
  size?: "small" | "large";
  autoStart?: boolean;
  className?: string;
  /** "user" = front camera (default), "environment" = rear */
  cameraFacingMode?: "user" | "environment";
  /** Extra-compact mobile width cap (px), default 140 */
  mobileMaxPx?: number;
  /** Mobile width percentage of viewport, default 36 (vw) */
  mobileVW?: number;
};

export default function VideoCapture({
  size = "large",
  autoStart = false,
  className = "",
  cameraFacingMode = "user",
  mobileMaxPx = 140,
  mobileVW = 36,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [starting, setStarting] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tighter on phones; desktop/tablet capped by max px
  const cfg =
    size === "small"
      ? { minPx: 120, vw: mobileVW, maxPx: Math.max(160, mobileMaxPx) }
      : { minPx: 140, vw: Math.max(38, mobileVW), maxPx: 200 };

  const startVideo = async () => {
    if (starting || streaming) return;
    setStarting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        videoRef.current.setAttribute("autoplay", "true");
        await videoRef.current.play().catch(() => {});
      }
      setStreaming(true);
      setError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Unable to access camera. Please check permissions.");
    } finally {
      setStarting(false);
    }
  };

  const stopVideo = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
      setStreaming(false);
    }
  };

  useEffect(() => {
    if (autoStart) startVideo();
    return () => stopVideo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, cameraFacingMode]);

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      {/* Responsive camera box (much smaller on phones) */}
      <div
        className="rounded-xl overflow-hidden shadow-md bg-black border border-white/10"
        style={{
          width: `clamp(${cfg.minPx}px, ${cfg.vw}vw, ${cfg.maxPx}px)`,
          aspectRatio: "4 / 3",
        }}
      >
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover block" />
      </div>

      {error && <p className="text-red-500 text-xs text-center px-2 max-w-[26rem]">{error}</p>}

      <div className="flex flex-wrap items-center justify-center gap-2">
        {!streaming ? (
          <button
            onClick={startVideo}
            disabled={starting}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg text-xs transition"
          >
            {starting ? "Starting…" : "Start Camera"}
          </button>
        ) : (
          <button
            onClick={stopVideo}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs transition"
          >
            Stop Camera
          </button>
        )}
      </div>
    </div>
  );
}
