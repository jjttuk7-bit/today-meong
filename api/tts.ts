import type { VercelRequest, VercelResponse } from "@vercel/node";
import { synthesizeSpeech, keyStatus } from "../lib/openai.js";

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
    const { audio, contentType, engine } = await synthesizeSpeech({ text, voice, instructions });
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    // X-TTS-Engine lets you verify (via the Network tab or curl -I) which backend
    // actually produced the audio: "elevenlabs" or "openai".
    res.setHeader("X-TTS-Engine", engine);
    return res.status(200).send(audio);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("TTS error:", message);
    // 503 signals the client to gracefully fall back to browser speechSynthesis.
    // keys[] booleans (no secrets) reveal whether the deployment sees the API keys.
    return res.status(503).json({ error: "tts_unavailable", detail: message, keys: keyStatus() });
  }
}
