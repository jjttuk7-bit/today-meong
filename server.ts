import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { analyzeMood, synthesizeSpeech, generateBackground } from "./lib/openai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// REST API for Mood Analysis using OpenAI API
app.post("/api/analyze-mood", async (req, res) => {
  const { theme, moodText, moodQuick, lang = "ko" } = req.body;

  if (!theme) {
    return res.status(400).json({ error: "theme is required" });
  }

  const result = await analyzeMood({ theme, moodText, moodQuick, lang });
  return res.json(result);
});

// REST API for narration Text-to-Speech using OpenAI TTS
app.post("/api/tts", async (req, res) => {
  const { text, voice, instructions } = req.body;

  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "text is required" });
  }

  try {
    const { audio, contentType } = await synthesizeSpeech({ text, voice, instructions });
    res.set("Content-Type", contentType);
    res.set("Cache-Control", "public, max-age=86400");
    return res.send(audio);
  } catch (error) {
    console.error("OpenAI TTS error:", error);
    // 503 signals the client to gracefully fall back to browser speechSynthesis.
    return res.status(503).json({ error: "tts_unavailable" });
  }
});

// REST API for AI ambient background image using OpenAI gpt-image-1
app.post("/api/generate-bg", async (req, res) => {
  const { theme, moodQuick } = req.body;

  if (!theme) {
    return res.status(400).json({ error: "theme is required" });
  }

  try {
    const { dataUrl } = await generateBackground({ theme, moodQuick });
    res.set("Cache-Control", "public, max-age=86400");
    return res.json({ image: dataUrl });
  } catch (error) {
    console.error("OpenAI background image error:", error);
    // 503 signals the client to keep the pure generative-canvas look.
    return res.status(503).json({ error: "image_unavailable" });
  }
});

// Serve frontend SPA
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
