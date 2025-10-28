// server/src/routes/frames.ts
import { Router } from "express";
import { z } from "zod";

export const framesRouter = Router();

const Num = z.coerce.number().finite();

const FrameSchema = z
  .object({
    ts: z.coerce.number().int(),
    gaze: z.object({
      x: Num,
      y: Num,
    }),
    aus: z
      .object({
        mouthOpen: Num.optional(),
        smile: Num.optional(),
        browRaise: Num.optional(),
      })
      .optional()
      .default({}),
    blendshapes: z
      .array(
        z.object({
          categoryName: z.string(),
          score: Num,
        })
      )
      .max(32)
      .optional(),
    raw: z.any().optional(), // optional passthrough from client
  })
  .passthrough(); // ignore any extra fields instead of 400

framesRouter.post("/", (req, res) => {
  try {
    const parsed = FrameSchema.parse(req.body);
    // Persist or log
    console.log(
      "FRAME:",
      JSON.stringify(
        {
          ts: parsed.ts,
          gaze: parsed.gaze,
          aus: parsed.aus,
          blendshapes: parsed.blendshapes?.slice(0, 4), // log fewer rows to keep console tidy
        },
        null,
        0
      )
    );
    res.json({ ok: true });
  } catch (e: any) {
    console.error("FRAME 400:", e?.errors || e?.message || e);
    res
      .status(400)
      .json({ ok: false, reason: "invalid body", detail: e?.errors || String(e) });
  }
});
