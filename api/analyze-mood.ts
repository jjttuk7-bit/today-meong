import type { VercelRequest, VercelResponse } from "@vercel/node";
import { analyzeMood } from "../lib/openai.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const { theme, moodText, moodQuick, lang = "ko" } = body;

  if (!theme) {
    return res.status(400).json({ error: "theme is required" });
  }

  const result = await analyzeMood({ theme, moodText, moodQuick, lang });
  return res.status(200).json(result);
}
