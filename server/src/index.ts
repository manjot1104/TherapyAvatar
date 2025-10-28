import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import { WebSocketServer, WebSocket } from "ws";
import OpenAI from "openai";

import respondRouter from "./routes/respond.js";
import { eventsRouter } from "./routes/events.js";
import { framesRouter } from "./routes/frames.js";
const app = express();
const PORT = process.env.PORT || 4000;

/* ---------------- Middleware ---------------- */
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173"],
}));
app.use(express.json({ limit: "2mb" }));

/* ---------------- Routers ---------------- */
app.use("/respond", respondRouter);
app.use("/events", eventsRouter);
app.use("/frames", framesRouter);

/* ---------------- Upload setup ---------------- */
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname) || ".webm"}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /audio\/(webm|mp4|mpeg|mp3|wav|x-m4a|aac|ogg|3gpp)/i.test(file.mimetype);
    if (!ok) return cb(new Error(`Unsupported audio type: ${file.mimetype}`));
    cb(null, true);
  },
});

/* ---------------- OpenAI Client ---------------- */
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/* ---------------- Health Route ---------------- */
app.get("/", (_req: Request, res: Response) => {
  res.send("✅ Therapy Avatar Backend is running successfully 🚀");
});

/* ---------------- Audio Transcription ---------------- */
app.post("/transcribe", upload.single("audio"), async (req: Request, res: Response) => {
  let audioPath: string | null = null;
  try {
    if (!req.file) return res.status(400).json({ error: "No audio file uploaded" });

    audioPath = req.file.path;
    const stream = fs.createReadStream(audioPath);

    const transcription = await openai.audio.transcriptions.create({
      file: stream as any,
      model: "whisper-1",
    });

    res.json({ text: transcription.text ?? "" });
  } catch (err) {
    console.error("❌ Transcription error:", err);
    res.status(500).json({ error: "Transcription failed" });
  } finally {
    if (audioPath && fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
  }
});

/* ---------------- Error Handler ---------------- */
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof multer.MulterError)
    return res.status(400).json({ error: `Upload error: ${err.message}` });

  if (err?.message?.startsWith("Unsupported audio type"))
    return res.status(415).json({ error: err.message });

  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

export const wss = new WebSocketServer({ port: 4050 });

wss.on("connection", (ws: WebSocket) => {
  console.log("✅ Client connected");

  ws.on("message", (message: WebSocket.RawData) => {
    try {
      const data = JSON.parse(message.toString());
      if (!data.metrics || typeof data.metrics.attention !== "number") return;

      const engagementScore = Math.max(0, Math.min(1, data.metrics.attention * (1 - data.metrics.blink)));

      wss.clients.forEach((client: WebSocket) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ ...data, engagementScore }));
        }
      });
    } catch (err) {
      console.error("WebSocket message error:", err);
    }
  });

  ws.on("close", () => console.log("Client disconnected"));
});



/* ---------------- Start Server ---------------- */
app.listen(PORT, () => console.log(`✅ Server started on http://localhost:${PORT}`));
