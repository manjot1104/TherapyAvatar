"use client";

import React, { useEffect, useRef, useState } from "react";

type Props = {
  size?: "small" | "large";
  autoStart?: boolean;
  className?: string;
};

export default function VideoCapture({ size = "large", autoStart = false, className = "" }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [starting, setStarting] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const WH = size === "small" ? { w: 160, h: 112 } : { w: 320, h: 224 };

  const startVideo = async () => {
    if (starting || streaming) return;
    setStarting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
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
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setStreaming(false);
    }
  };

  useEffect(() => {
    if (autoStart) startVideo();
    return () => stopVideo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div
        className="rounded-xl overflow-hidden shadow-md bg-black"
        style={{ width: WH.w, height: WH.h }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}

      <div className="flex gap-2">
        {!streaming ? (
          <button
            onClick={startVideo}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs transition"
          >
            Start Camera
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
