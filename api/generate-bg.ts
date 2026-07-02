import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getOrCreateBackground } from "../lib/openai.js";

// gpt-image-1 generation can take 10-30s; allow up to 60s (Hobby plan max).
export const config = { maxDuration: 60 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const { theme, moodQuick } = body;

  if (!theme) {
    return res.status(400).json({ error: "theme is required" });
  }

  try {
    const { image, cached } = await getOrCreateBackground({ theme, moodQuick });
    res.setHeader("Cache-Control", "public, max-age=86400");
    return res.status(200).json({ image, cached });
  } catch (error) {
    console.error("OpenAI background image error:", error);
    // 503 signals the client to keep the pure generative-canvas look.
    return res.status(503).json({ error: "image_unavailable" });
  }
}
