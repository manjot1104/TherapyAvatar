import { Router } from "express";
import OpenAI from "openai";

const router = Router();

const SYSTEM_PROMPT = `You are a friendly therapy companion for children with autism.
Speak in short, simple sentences (max 8 words).
Talk slowly, warm tone. Repeat when needed.
Focus on greetings, emotions, routines, and turn-taking.
Avoid jokes, sarcasm, metaphors, adult topics.
Never make medical claims. Ask one question at a time.`;

router.post("/", async (req, res) => {
  try {
    // 👇 create the client *here*, after envs are loaded
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

    const { text, kbHint, module } = req.body || {};
    const messages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      ...(kbHint ? [{ role: "assistant" as const, content: String(kbHint) }] : []),
      { role: "user" as const, content: String(text ?? "").slice(0, 240) },
    ];

    const llm = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.3,
      messages,
    });

    const assistantText = llm.choices[0]?.message?.content || "Okay.";
    return res.json({ text: assistantText, speakClient: true, module: module || "greeting" });
  } catch (err) {
    console.error("[respond error]", err);
    res.status(500).json({ error: "respond_failed" });
  }
});

export default router;
