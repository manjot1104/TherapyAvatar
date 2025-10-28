// src/components/AudioRecorder.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { respond } from "@/lib/api";
import { speakInBrowser } from "@/lib/speak";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Props = {
  onAssistant?: (text: string) => void;
  onProcessingChange?: (v: boolean) => void;
  onSetLastAssistant?: (t: string) => void;
  // NEW: user transcript callback to log turns in Session Summary
  onUserTranscript?: (text: string) => void;
};

export default function AudioRecorder({
  onAssistant,
  onProcessingChange,
  onSetLastAssistant,
  onUserTranscript,
}: Props) {
  const [unlocked, setUnlocked] = useState(false);
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState<string>("Tap mic to start");
  const [transcript, setTranscript] = useState<string>("");
  const [energy, setEnergy] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const meterRAF = useRef<number | null>(null);
  const srcNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);

  useEffect(() => {
    onProcessingChange?.(processing);
  }, [processing, onProcessingChange]);

  useEffect(() => {
    return () => {
      cleanupStream();
    };
  }, []);

  function cleanupStream() {
    if (meterRAF.current) cancelAnimationFrame(meterRAF.current);
    try {
      srcNodeRef.current?.disconnect();
      analyserRef.current?.disconnect();
    } catch {}
    srcNodeRef.current = null;
    analyserRef.current = null;

    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  async function openMic() {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1,
        sampleRate: 48000,
      } as MediaTrackConstraints,
    });
    streamRef.current = stream;

    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)({
        sampleRate: 48000,
      } as AudioContextOptions);
    }
    try {
      await audioCtxRef.current.resume();
    } catch {}

    // level meter
    const ctx = audioCtxRef.current!;
    const src = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    src.connect(analyser);
    srcNodeRef.current = src;
    analyserRef.current = analyser;

    const time = new Float32Array(analyser.fftSize);
    const loop = () => {
      analyser.getFloatTimeDomainData(time);
      let sum = 0;
      for (let i = 0; i < time.length; i++) sum += time[i] * time[i];
      const rms = Math.sqrt(sum / time.length);
      setEnergy(rms);
      meterRAF.current = requestAnimationFrame(loop);
    };
    meterRAF.current = requestAnimationFrame(loop);

    return stream;
  }

  function startRecorder(stream: MediaStream) {
    const mimeType =
      MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "";
    const mr = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    mediaRecorderRef.current = mr;
    audioChunksRef.current = [];
    mr.ondataavailable = (e) => {
      if (e.data?.size) audioChunksRef.current.push(e.data);
    };
    mr.start();
  }

  function stopRecorder(): Promise<void> {
    return new Promise((resolve) => {
      const mr = mediaRecorderRef.current;
      if (!mr) return resolve();
      if (mr.state === "inactive") return resolve();
      mr.addEventListener("stop", () => resolve(), { once: true });
      try {
        mr.stop();
      } catch {
        resolve();
      }
    });
  }

  async function handleToggle() {
    if (processing) return;
    if (!recording) {
      // start
      try {
        if (!unlocked) setUnlocked(true);
        setStatus("Opening mic…");
        const stream = await openMic();
        startRecorder(stream);
        setRecording(true);
        setStatus("Listening… tap to stop");
      } catch (e) {
        console.error("start error:", e);
        setStatus("Mic failed. Check permissions.");
        cleanupStream();
      }
    } else {
      // stop
      setRecording(false);
      setStatus("Processing…");
      try {
        await stopRecorder();
        await processChunk();
      } catch (e) {
        console.error("stop/process error:", e);
        setStatus("Error; ready again.");
      } finally {
        cleanupStream();
      }
    }
  }

  async function processChunk() {
    setProcessing(true);
    onProcessingChange?.(true);
    try {
      const chunks = audioChunksRef.current;
      if (!chunks.length) {
        setStatus("No audio captured. Try again.");
        return;
      }

      const actualType =
        mediaRecorderRef.current?.mimeType ||
        (chunks[0] as any).type ||
        "audio/webm";
      const ext = actualType.includes("mp4") ? "m4a" : "webm";

      const form = new FormData();
      form.append(
        "audio",
        new Blob(chunks, { type: actualType }),
        `utterance.${ext}`
      );

      setStatus("Transcribing…");
      const res = await fetch(`${API_BASE}/transcribe`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error(`ASR failed (${res.status})`);

      const data = await res.json();
      const userText = String(data?.text ?? "").trim();
      setTranscript(userText || "(no transcription)");

      // NEW: emit user transcript to parent (for SessionSummary logging)
      if (userText) {
        onUserTranscript?.(userText);
      }

      if (!userText) {
        setStatus("Ready. Tap mic.");
        return;
      }

      setStatus("Thinking…");
      const kbHint = `It’s okay. Take your time. Let’s try: "Hello".`;
      const r = await respond(userText, kbHint, "greeting");
      const reply = r?.text || "";
      onAssistant?.(reply);
      onSetLastAssistant?.(reply);

      await sleep(120);
      setStatus("Speaking…");
      if (reply) await speakInBrowser(reply, { rate: 0.95 });
      setStatus("Ready. Tap mic.");
    } catch (e) {
      console.error("processChunk error:", e);
      setStatus("Error; ready again.");
    } finally {
      setProcessing(false);
      onProcessingChange?.(false);
      audioChunksRef.current = [];
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Mic bubble */}
      <button
        onClick={handleToggle}
        className={`relative h-14 w-14 rounded-full grid place-items-center shadow-lg transition
        ${recording ? "bg-rose-600" : "bg-emerald-600"} text-white`}
        aria-label={recording ? "Stop recording" : "Start recording"}
      >
        {/* pulse ring by energy */}
        <span
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            boxShadow: `0 0 ${Math.min(24, 4 + energy * 320)}px rgba(0,0,0,.25)`,
          }}
        />
        <svg viewBox="0 0 24 24" className="h-7 w-7">
          {recording ? (
            // stop square
            <rect x="7" y="7" width="10" height="10" rx="2" />
          ) : (
            // mic icon
            <path d="M12 14a3 3 0 0 0 3-3V7a3 3 0 1 0-6 0v4a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0M12 19v3m-4 0h8" />
          )}
        </svg>
      </button>

      {/* status + meter */}
      <span className="text-xs text-gray-700">{status}</span>
      <div className="w-48 h-1.5 bg-gray-200 rounded overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-[width] duration-75"
          style={{ width: `${Math.min(100, Math.round(energy * 900))}%` }}
        />
      </div>

      <p className="text-xs text-gray-700 max-w-xl text-center">
        🎙️ <b>Heard:</b> {transcript || "(…waiting)"}
      </p>
    </div>
  );
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
