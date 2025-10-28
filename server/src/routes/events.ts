// server/src/routes/events.ts
import { Router } from "express";
export const eventsRouter = Router();

eventsRouter.post("/", async (req, res) => {
  try {
    // TODO: validate + insert into DB (sessions/mastery_events)
    // For MVP, just echo:
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to log event" });
  }
});
