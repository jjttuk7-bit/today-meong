<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/2d90391d-50e8-47c9-abff-605968e1bc14

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `OPENAI_API_KEY` in [.env.local](.env.local) to your OpenAI API key
3. Run the app:
   `npm run dev`

The OpenAI key powers the mood analysis (`gpt-4o-mini`), the meditation voice
narration (`gpt-4o-mini-tts`), and the AI ambient background image
(`gpt-image-1`). Without a key the app still runs: mood analysis uses built-in
fallback params, narration falls back to the browser's built-in speech
synthesis, and the background falls back to the pure generative canvas.

The meditation canvas itself was also upgraded with additive-blend bloom on
glowing particles, an edge vignette, and subtle film grain for a more cinematic,
immersive look. The AI background (one image per theme, cached for the browser
session) is layered behind the canvas, which lays a soft translucent veil over it.

## Deploy on Vercel

The backend runs as serverless functions in [`api/`](api) (`/api/analyze-mood`,
`/api/tts`), so no extra config is needed. **Add `OPENAI_API_KEY` in your Vercel
project's Environment Variables** (Settings → Environment Variables) and redeploy
so the live site uses OpenAI for mood analysis and voice narration.

Locally, the same endpoints are served by the Express dev server in
[`server.ts`](server.ts); both share the logic in [`lib/openai.ts`](lib/openai.ts).
