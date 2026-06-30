import type { VercelRequest, VercelResponse } from "@vercel/node";
import { synthesizeSpeech } from "../lib/openai.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const { text, voice, instructions } = body;

  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "text is required" });
  }

  try {
    const { audio, contentType } = await synthesizeSpeech({ text, voice, instructions });
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    return res.status(200).send(audio);
  } catch (error) {
    console.error("OpenAI TTS error:", error);
    // 503 signals the client to gracefully fall back to browser speechSynthesis.
    return res.status(503).json({ error: "tts_unavailable" });
  }
}
