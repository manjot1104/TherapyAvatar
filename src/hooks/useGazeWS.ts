import { useEffect, useState } from "react";

export interface Metrics {
  gaze: { x: number; y: number };
  blink: number;
  attention: number;
  aus?: any;
  blendshapes?: any;
  engagementScore?: number;
}

const WS_URL = typeof window !== "undefined" ? (process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4050") : "";

export default function useGazeWS() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    if (!WS_URL) return;
    let mounted = true;
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => console.log("✅ WebSocket connected");
    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        // server broadcasts { sessionId, ts, metrics, engagementScore? }
        const receivedMetrics = data.metrics ?? data;
        const engagementScore = data.engagementScore ?? receivedMetrics.attention ?? null;
        const m: Metrics = {
          gaze: receivedMetrics.gaze ?? { x: 0, y: 0 },
          blink: typeof receivedMetrics.blink === "number" ? receivedMetrics.blink : 0,
          attention: typeof receivedMetrics.attention === "number" ? receivedMetrics.attention : 0,
          aus: receivedMetrics.aus,
          blendshapes: receivedMetrics.blendshapes,
          engagementScore: typeof engagementScore === "number" ? engagementScore : undefined,
        };
        if (mounted) setMetrics(m);
      } catch (err) {
        console.error("WS parse error", err);
      }
    };
    ws.onerror = (e) => console.warn("WS error", e);
    ws.onclose = () => console.log("WS closed");

    return () => { mounted = false; try { ws.close(); } catch {} };
  }, []);

  return metrics;
}
