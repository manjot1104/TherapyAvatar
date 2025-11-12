// src/components/SessionSummary.tsx
"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useEffect,
  useState,
} from "react";
import jsPDF from "jspdf";
import autoTable, { RowInput } from "jspdf-autotable";
import { createClient } from "@/lib/supabase/browser-client";

/* ===========================
   1) Types
   =========================== */

type Emotion = "happy" | "neutral" | "sad" | "angry" | "fear" | "surprise" | "disgust";
type Speaker = "child" | "therapist" | "assistant" | "parent";

export type Turn = {
  id: string;
  timestamp: string;          // ISO string (UTC)
  speaker: Speaker;
  text: string;
  emotion?: Emotion;          // optional
  attention?: number;         // 0..1
};

export type SessionMeta = {
  sessionId: string;
  sessionTitle?: string;
  clientName?: string;
  therapistName?: string;
  sessionDateISO?: string; 
  childId?: string;   
};

type Aggregates = {
  totalTurns: number;
  durationMin: number | null;
  wordsTotal: number;
  wordsBySpeaker: Record<Speaker, number>;
  turnsBySpeaker: Record<Speaker, number>;
  emotionCounts: Record<Emotion, number>;
  emotionPct: Record<Emotion, number>;
  avgAttention: number | null;
};

export type SavePDFResult = {
  session_id: string;
  url?: string | null;
};

type SessionContextShape = {
  turns: Turn[];
  meta: SessionMeta;
  setMeta: (m: Partial<SessionMeta>) => void;
  addTurn: (t: Omit<Turn, "id" | "timestamp"> & { id?: string; timestamp?: string }) => void;
  clear: () => void;
  aggregates: Aggregates;
  downloadPDF: () => void;
  savePDFToCloud: () => Promise<SavePDFResult | null>;
  saving: boolean;
};

/* ===========================
   2) Deterministic formatting (UTC)
   =========================== */

function formatISODate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function formatISOTime(iso: string) {
  const d = new Date(iso);
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

/* ===========================
   3) Aggregation
   =========================== */

const countWords = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);
const pctStr = (v: number | null, d = 0) => (v == null ? "—" : `${(v * 100).toFixed(d)}%`);

function aggregate(turns: Turn[]): Aggregates {
  const speakers: Speaker[] = ["child", "therapist", "assistant", "parent"];
  const emotions: Emotion[] = ["happy", "neutral", "sad", "angry", "fear", "surprise", "disgust"];

  const totalTurns = turns.length;

  let durationMin: number | null = null;
  if (totalTurns >= 2) {
    const start = new Date(turns[0].timestamp).getTime();
    const end = new Date(turns[turns.length - 1].timestamp).getTime();
    durationMin = Math.max(0, end - start) / (1000 * 60);
  }

  const wordsBySpeaker = Object.fromEntries(speakers.map(s => [s, 0])) as Record<Speaker, number>;
  const turnsBySpeaker = Object.fromEntries(speakers.map(s => [s, 0])) as Record<Speaker, number>;
  let wordsTotal = 0;

  for (const t of turns) {
    const w = countWords(t.text);
    wordsTotal += w;
    wordsBySpeaker[t.speaker] += w;
    turnsBySpeaker[t.speaker] += 1;
  }

  const emotionCounts = Object.fromEntries(emotions.map(e => [e, 0])) as Record<Emotion, number>;
  let labeled = 0;
  for (const t of turns) {
    if (t.emotion) {
      emotionCounts[t.emotion] += 1;
      labeled++;
    }
  }
  const emotionPct = Object.fromEntries(
    emotions.map(e => [e, labeled ? emotionCounts[e] / labeled : 0])
  ) as Record<Emotion, number>;

  const att = turns.map(t => t.attention).filter((x): x is number => typeof x === "number");
  const avgAttention = att.length ? att.reduce((a, b) => a + b, 0) / att.length : null;

  return { totalTurns, durationMin, wordsTotal, wordsBySpeaker, turnsBySpeaker, emotionCounts, emotionPct, avgAttention };
}


function toTurnDTOs(turns: Turn[]): Array<{
  idx: number; ts: string; speaker: string; text: string; emotion?: string; attention?: number;
}> {
  return turns
    .slice()
    .sort((a, b) => +new Date(a.timestamp) - +new Date(b.timestamp))
    .map((t, i) => ({
      idx: i,
      ts: t.timestamp,
      speaker: t.speaker,
      text: t.text,
      emotion: t.emotion,
      attention: typeof t.attention === "number" ? t.attention : undefined,
    }));
}

/* ===========================
   4) PDF builder
   =========================== */

function buildPDF(meta: SessionMeta, turns: Turn[], ag: Aggregates) {
  const {
    sessionId,
    sessionTitle = "Therapy Session Summary",
    clientName = "Client",
    therapistName = "Therapist",
    sessionDateISO,
  } = meta;

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;
  const pageW = doc.internal.pageSize.getWidth();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(sessionTitle, margin, 50);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    `Client: ${clientName}   |   Therapist: ${therapistName}   |   Date: ${formatISODate(
      sessionDateISO
    )}   |   Session ID: ${sessionId}`,
    margin,
    68
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Key Metrics", margin, 100);
  doc.setFont("helvetica", "normal");

  const metrics: [string, string][] = [
    ["Total Turns", String(ag.totalTurns)],
    ["Session Duration", ag.durationMin == null ? "—" : `${ag.durationMin.toFixed(1)} min`],
    ["Total Words", String(ag.wordsTotal)],
    ["Avg. Attention", pctStr(ag.avgAttention, 0)],
  ];

  autoTable(doc, {
    startY: 110,
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 5 },
    head: [["Metric", "Value"]],
    body: metrics,
    margin: { left: margin, right: margin },
  });

  const speakerRows: RowInput[] = Object.entries(ag.turnsBySpeaker).map(([spk, turns]) => [
    spk,
    String(turns),
    String(ag.wordsBySpeaker[spk as Speaker] ?? 0),
  ]);

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 20,
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 5 },
    head: [["Speaker", "Turns", "Words"]],
    body: speakerRows,
    margin: { left: margin, right: margin },
  });

  const emotionRows: RowInput[] = Object.entries(ag.emotionCounts).map(([emo, count]) => [
    emo,
    String(count),
    pctStr(ag.emotionPct[emo as Emotion], 0),
  ]);

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 20,
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 5 },
    head: [["Emotion", "Count", "Share"]],
    body: emotionRows,
    margin: { left: margin, right: margin },
  });

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 20,
    theme: "striped",
    styles: { fontSize: 9, cellPadding: 5, overflow: "linebreak" },
    head: [["Time (UTC)", "Speaker", "Emotion", "Attention", "Text"]],
    body: turns.map((t) => [
      formatISOTime(t.timestamp),
      t.speaker,
      t.emotion ?? "—",
      typeof t.attention === "number" ? pctStr(t.attention, 0) : "—",
      t.text,
    ]),
    margin: { left: margin, right: margin },
    didDrawPage: () => {
      const str = `Page ${doc.getCurrentPageInfo().pageNumber}`;
      doc.setFontSize(9);
      doc.text(str, pageW - margin, doc.internal.pageSize.getHeight() - 20, { align: "right" });
    },
  });

  return doc;
}

function downloadPDFFile(meta: SessionMeta, turns: Turn[], ag: Aggregates) {
  const doc = buildPDF(meta, turns, ag);
  const safeClient = (meta.clientName || "client").replace(/\s+/g, "_");
  doc.save(`session_${safeClient}_${meta.sessionId.slice(0, 6)}.pdf`);
}

/* ===========================
   5) Context + Provider (SSR-safe)
   =========================== */

const SessionCtx = createContext<SessionContextShape | null>(null);

export function SessionProvider({
  children,
  initialMeta,
}: {
  children: React.ReactNode;
  initialMeta?: Partial<SessionMeta>;
}) {
  const supabase = createClient();

  // SSR-safe defaults — NO random / date at render time
  const [meta, setMetaState] = useState<SessionMeta>({
    sessionId: initialMeta?.sessionId ?? "SSN-PENDING",
    sessionTitle: initialMeta?.sessionTitle ?? "Session Summary & Report",
    clientName: initialMeta?.clientName ?? "Client",
    therapistName: initialMeta?.therapistName ?? "Therapist",
    sessionDateISO: initialMeta?.sessionDateISO ?? "1970-01-01T00:00:00.000Z",
  });

  // On first client mount, fill actual values if missing + auto-fill client name
  useEffect(() => {
    (async () => {
      setMetaState((prev) => {
        const next = { ...prev };
        if (next.sessionId === "SSN-PENDING") next.sessionId = makeClientId();
        if (!initialMeta?.sessionDateISO || next.sessionDateISO === "1970-01-01T00:00:00.000Z") {
          next.sessionDateISO = new Date().toISOString();
        }
        return next;
      });

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          let name: string | null = null;
          const { data: prof } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .maybeSingle();

          name =
            prof?.full_name ||
            (user.user_metadata as any)?.full_name ||
            (user.email ? user.email.split("@")[0] : null);

          if (name) setMetaState((p) => ({ ...p, clientName: name }));
        }
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [turns, setTurns] = useState<Turn[]>([]);
  const [saving, setSaving] = useState(false);

  const addTurn = useCallback(
    (t: Omit<Turn, "id" | "timestamp"> & { id?: string; timestamp?: string }) => {
      const id = t.id ?? makeClientId(); // client only
      const timestamp = t.timestamp ?? new Date().toISOString(); // client only
      setTurns((prev) => {
        const next = [...prev, { ...t, id, timestamp } as Turn];
        next.sort((a, b) => +new Date(a.timestamp) - +new Date(b.timestamp));
        return next;
      });
    },
    []
  );

  const setMeta = useCallback((m: Partial<SessionMeta>) => {
    setMetaState((prev) => ({ ...prev, ...m }));
  }, []);

  const clear = useCallback(() => setTurns([]), []);
  const aggregates = useMemo(() => aggregate(turns), [turns]);
  const downloadPDF = useCallback(() => downloadPDFFile(meta, turns, aggregates), [meta, turns, aggregates]);

  // Save to Cloud (Storage + DB via /api/reports) — returns typed result
  const savePDFToCloud = useCallback(async (): Promise<SavePDFResult | null> => {
    setSaving(true);
    try {
      const doc = buildPDF(meta, turns, aggregates);
      const blob = doc.output("blob"); // application/pdf
      const fd = new FormData();
      fd.append("file", new File([blob], `${meta.sessionId}.pdf`, { type: "application/pdf" }));
      fd.append("session_id", meta.sessionId);
      fd.append("title", meta.sessionTitle || "Session Summary & Report");

      const res = await fetch("/api/reports", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Upload failed");
      }
      return {
        session_id: data.session_id as string,
        url: (data?.url as string | null | undefined) ?? null,
      };
    } finally {
      setSaving(false);
    }
  }, [meta, turns, aggregates]);

  const value: SessionContextShape = {
    turns,
    meta,
    setMeta,
    addTurn,
    clear,
    aggregates,
    downloadPDF,
    savePDFToCloud,
    saving,
  };

  return <SessionCtx.Provider value={value}>{children}</SessionCtx.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionCtx);
  if (!ctx) throw new Error("useSession must be used inside <SessionProvider>");
  return ctx;
}

function makeClientId() {
  // called only on client (in effects/handlers)
  return "SSN-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

/* ===========================
   6) UI
   =========================== */

export default function SessionSummary() {
  const { meta, setMeta, aggregates, turns, downloadPDF, clear, savePDFToCloud, saving } = useSession();

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">
            {meta.sessionTitle} <span className="font-normal">— #{meta.sessionId}</span>
          </h1>
          <p className="text-sm text-gray-600">
            <b>Client:</b> {meta.clientName} &nbsp;|&nbsp; <b>Therapist:</b> {meta.therapistName} &nbsp;|&nbsp; <b>Date:</b> {formatISODate(meta.sessionDateISO)}
          </p>
        </div>

        <div className="flex gap-2">
          <button onClick={downloadPDF} className="px-3 py-2 rounded-lg border hover:shadow" title="Download PDF">
            Download PDF
          </button>
          <button
            onClick={async () => {
              try {
                const res = await savePDFToCloud();
                if (res?.url) window.open(res.url, "_blank");
              } catch (e: any) {
                alert(e?.message || "Failed to save report");
              }
            }}
            disabled={saving}
            className="px-3 py-2 rounded-lg border hover:shadow disabled:opacity-60"
            title="Save to Supabase"
          >
            {saving ? "Saving…" : "Save to Cloud"}
          </button>
          <button onClick={clear} className="px-3 py-2 rounded-lg border hover:shadow" title="Clear">
            Clear
          </button>
        </div>
      </div>

      {/* Meta quick edit */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
        <input
          className="border rounded-lg p-2"
          placeholder="Client name"
          defaultValue={meta.clientName}
          onBlur={(e) => setMeta({ clientName: e.target.value })}
        />
        <input
          className="border rounded-lg p-2"
          placeholder="Therapist name"
          defaultValue={meta.therapistName}
          onBlur={(e) => setMeta({ therapistName: e.target.value })}
        />
        <input
          className="border rounded-lg p-2"
          placeholder="Session title"
          defaultValue={meta.sessionTitle}
          onBlur={(e) => setMeta({ sessionTitle: e.target.value })}
        />
        <input
          className="border rounded-lg p-2"
          type="date"
          defaultValue={formatISODate(meta.sessionDateISO)}
          onBlur={(e) => {
            const v = e.target.value ? new Date(e.target.value + "T00:00:00.000Z").toISOString() : undefined;
            setMeta({ sessionDateISO: v });
          }}
        />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="Total Turns" value={aggregates.totalTurns} />
        <Stat
          label="Duration"
          value={aggregates.durationMin == null ? "—" : `${aggregates.durationMin.toFixed(1)} min`}
        />
        <Stat label="Total Words" value={aggregates.wordsTotal} />
        <Stat label="Avg. Attention" value={pctStr(aggregates.avgAttention)} />
      </div>

      {/* Speaker breakdown */}
      <Section title="Speaker Breakdown">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-2">Speaker</th>
              <th className="py-2 pr-2">Turns</th>
              <th className="py-2 pr-2">Words</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(aggregates.turnsBySpeaker).map(([spk, cnt]) => (
              <tr key={spk} className="border-b">
                <td className="py-2 pr-2 capitalize">{spk}</td>
                <td className="py-2 pr-2">{cnt}</td>
                <td className="py-2 pr-2">{aggregates.wordsBySpeaker[spk as Speaker] ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* Emotions */}
      <Section title="Emotion Breakdown">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-2">Emotion</th>
              <th className="py-2 pr-2">Count</th>
              <th className="py-2 pr-2">Share</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(aggregates.emotionCounts).map(([emo, count]) => (
              <tr key={emo} className="border-b">
                <td className="py-2 pr-2 capitalize">{emo}</td>
                <td className="py-2 pr-2">{count}</td>
                <td className="py-2 pr-2">{pctStr(aggregates.emotionPct[emo as Emotion])}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-gray-500 mt-2">* Share is over only emotion-labeled turns.</p>
      </Section>

      {/* Turn log */}
      <Section title="Turn Log">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-2">Time (UTC)</th>
                <th className="py-2 pr-2">Speaker</th>
                <th className="py-2 pr-2">Emotion</th>
                <th className="py-2 pr-2">Attention</th>
                <th className="py-2 pr-2">Text</th>
              </tr>
            </thead>
            <tbody>
              {turns.map((t) => (
                <tr key={t.id} className="border-b align-top">
                  <td className="py-2 pr-2 whitespace-nowrap">{formatISOTime(t.timestamp)}</td>
                  <td className="py-2 pr-2 capitalize">{t.speaker}</td>
                  <td className="py-2 pr-2 capitalize">{t.emotion ?? "—"}</td>
                  <td className="py-2 pr-2">{typeof t.attention === "number" ? pctStr(t.attention) : "—"}</td>
                  <td className="py-2 pr-2">{t.text}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="p-3 rounded-xl border bg-white">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="text-base md:text-lg font-semibold mb-2">{title}</h2>
      <div className="rounded-xl border bg-white p-3">{children}</div>
    </section>
  );
}
