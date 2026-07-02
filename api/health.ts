import type { VercelRequest, VercelResponse } from "@vercel/node";
import { keyStatus } from "../lib/openai.js";

// Lightweight diagnostic: reports which API credentials the running deployment
// can see (booleans only — never the key values). Open in a browser at
// /api/health to verify env vars are actually wired into this deployment.
export default function handler(_req: VercelRequest, res: VercelResponse) {
  const keys = keyStatus();
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({
    ok: true,
    keys,
    tts: keys.elevenlabs ? "elevenlabs" : keys.openai ? "openai" : "browser-fallback",
    hint: keys.elevenlabs
      ? "ElevenLabs key detected — narration should use it."
      : keys.openai
        ? "Only OpenAI key detected — narration uses OpenAI TTS (ELEVENLABS_API_KEY not visible to this deployment)."
        : "No TTS key visible to this deployment. Add keys in Vercel → Settings → Environment Variables, then REDEPLOY.",
  });
}
