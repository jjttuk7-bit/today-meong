import React, { useEffect, useRef, useState } from "react";
import { ThemeId, AIParams, BreathingId, ColorId } from "../types";

interface VisualizerProps {
  theme: ThemeId;
  params: AIParams;
  isPaused: boolean;
  breathingId: BreathingId;
  breathePhase: "inhale" | "hold" | "exhale" | "hold_empty";
  colorId: ColorId;
  backgroundImage?: string | null;
}

export function Visualizer({ theme, params, isPaused, breathingId, breathePhase, colorId, backgroundImage }: VisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [bgLoaded, setBgLoaded] = useState(false);
  const animationRef = useRef<number | null>(null);

  // Track whether an AI background image is present without re-initialising the
  // particle scene; the draw loop reads this each frame.
  const hasBgRef = useRef<boolean>(!!backgroundImage);
  useEffect(() => {
    hasBgRef.current = !!backgroundImage;
    if (!backgroundImage) setBgLoaded(false);
  }, [backgroundImage]);

  // Constants modulated by AIParams and Chromotherapy
  const speed = params.speedMultiplier || 1.0;
  const density = params.density || 1.0;
  const glow = params.glow || 0.8;

  // Custom Chromotherapy color selections mapping
  const colors = (() => {
    if (colorId === "green") {
      return ["#021408", "#082a15", "#114f29"];
    } else if (colorId === "blue") {
      return ["#020b18", "#061e3d", "#0c3a75"];
    } else if (colorId === "violet") {
      return ["#0b0415", "#1b0b30", "#3a1663"];
    }
    return params.colors && params.colors.length >= 2 ? params.colors : ["#0b0f19", "#02040a"];
  })();

  // Cache dimensions & handle resize dynamically using ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });

      if (canvasRef.current) {
        canvasRef.current.width = width * window.devicePixelRatio;
        canvasRef.current.height = height * window.devicePixelRatio;
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Visualizer main animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0 || dimensions.height === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Scaling for high DPI screens
    ctx.resetTransform();
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = dimensions.width;
    const height = dimensions.height;

    // Initialization of theme elements
    let particles: any[] = [];
    let waves: any[] = [];
    let clouds: any[] = [];
    let raindrops: any[] = [];
    let ripples: any[] = [];
    let backgroundStars: any[] = [];
    let smokeParticles: any[] = [];
    let glassDrops: any[] = [];

    // Helper to dynamically shift fire sparks colors during Chromotherapy
    const getEmberColor = () => {
      if (colorId === "green") {
        return Math.random() < 0.2 ? "#adff2f" : Math.random() < 0.5 ? "#50c878" : "#20b2aa";
      } else if (colorId === "blue") {
        return Math.random() < 0.2 ? "#00ffff" : Math.random() < 0.5 ? "#1e90ff" : "#87cefa";
      } else if (colorId === "violet") {
        return Math.random() < 0.2 ? "#ff00ff" : Math.random() < 0.5 ? "#da70d6" : "#dda0dd";
      }
      return Math.random() < 0.2 ? "#ffaa00" : Math.random() < 0.5 ? "#fc4a1a" : "#f7b733";
    };

    // Initialize Fire (with Smoke)
    const initFire = () => {
      const pCount = Math.floor(120 * density);
      for (let i = 0; i < pCount; i++) {
        particles.push({
          x: width / 2 + (Math.random() * 80 - 40),
          y: height + Math.random() * 100,
          vx: (Math.random() * 1.5 - 0.75) * speed,
          vy: -(1.5 + Math.random() * 2.5) * speed,
          size: (3 + Math.random() * 12) * glow,
          alpha: 0.3 + Math.random() * 0.7,
          life: 0,
          maxLife: 80 + Math.random() * 120,
          color: getEmberColor(),
          wobbleSpeed: 0.02 + Math.random() * 0.03,
          wobbleAmp: 10 + Math.random() * 25,
        });
      }

      // Initialize warm smoke
      const sCount = Math.floor(25 * density);
      for (let i = 0; i < sCount; i++) {
        smokeParticles.push({
          x: width / 2 + (Math.random() * 60 - 30),
          y: height - 10,
          vx: (Math.random() * 0.4 - 0.2) * speed,
          vy: -(0.5 + Math.random() * 0.8) * speed,
          size: 15 + Math.random() * 25,
          alpha: 0.03 + Math.random() * 0.06,
          life: 0,
          maxLife: 150 + Math.random() * 100,
        });
      }
    };

    // Initialize Water (with sweeping caustics rays)
    const initWater = () => {
      waves = [
        { phase: 0, frequency: 0.003, amplitude: 25 * speed, speed: 0.01 * speed, color: colors[0], opacity: 0.2 },
        { phase: Math.PI / 3, frequency: 0.005, amplitude: 15 * speed, speed: 0.015 * speed, color: colors[1] || colors[0], opacity: 0.15 },
        { phase: Math.PI / 1.5, frequency: 0.004, amplitude: 20 * speed, speed: 0.008 * speed, color: "#ffffff", opacity: 0.06 }
      ];

      // Setup rising water bubbles
      const bubbleCount = Math.floor(40 * density);
      for (let i = 0; i < bubbleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: height + Math.random() * 120,
          vy: -(0.4 + Math.random() * 1.0) * speed,
          size: 1.5 + Math.random() * 7,
          alpha: 0.08 + Math.random() * 0.4,
          life: 0,
          maxLife: 220 + Math.random() * 300,
          swaySpeed: 0.008 + Math.random() * 0.012,
          swayAmp: 10 + Math.random() * 25,
        });
      }
    };

    // Initialize Wave
    const initWave = () => {
      waves = [{
        progress: 0,
        direction: 1, // 1 = in, -1 = out
        speed: 0.002 * speed,
        foamParticles: []
      }];

      // Shimmer sand stars
      const sandCount = Math.floor(65 * density);
      for (let i = 0; i < sandCount; i++) {
        backgroundStars.push({
          x: Math.random() * width,
          y: height * 0.55 + Math.random() * (height * 0.45),
          size: 0.5 + Math.random() * 1.5,
          alpha: 0.1 + Math.random() * 0.4,
          twinkleSpeed: 0.01 + Math.random() * 0.02,
        });
      }
    };

    // Initialize Cloud (with starry space dust)
    const initCloud = () => {
      const starCount = Math.floor(130 * density);
      for (let i = 0; i < starCount; i++) {
        backgroundStars.push({
          x: Math.random() * width,
          y: Math.random() * height * 0.8,
          size: 0.5 + Math.random() * 2,
          alpha: 0.1 + Math.random() * 0.8,
          twinkle: 0.005 + Math.random() * 0.015,
        });
      }

      // Overlapping floating vector cloud layers
      const cloudCount = Math.floor(8 * density);
      for (let i = 0; i < cloudCount; i++) {
        clouds.push({
          x: Math.random() * width,
          y: height * 0.15 + Math.random() * (height * 0.45),
          vx: (0.1 + Math.random() * 0.25) * speed,
          scale: 0.6 + Math.random() * 1.0,
          alpha: 0.15 + Math.random() * 0.25,
          circles: [
            { rx: 0, ry: 0, r: 40 + Math.random() * 20 },
            { rx: -35, ry: 10, r: 30 + Math.random() * 15 },
            { rx: 35, ry: 10, r: 30 + Math.random() * 15 },
            { rx: -60, ry: 18, r: 20 + Math.random() * 10 },
            { rx: 60, ry: 18, r: 20 + Math.random() * 10 },
          ]
        });
      }
    };

    // Initialize Rain (with sliding foreground glass raindrops)
    const initRain = () => {
      const rainCount = Math.floor(160 * density);
      for (let i = 0; i < rainCount; i++) {
        raindrops.push({
          x: Math.random() * width,
          y: Math.random() * -height,
          vy: (5 + Math.random() * 6) * speed,
          vx: -(1 + Math.random() * 2) * speed, // wind blow diagonal
          length: 10 + Math.random() * 20,
          alpha: 0.15 + Math.random() * 0.35,
          splashY: height * 0.6 + Math.random() * (height * 0.4), // ground pool
        });
      }

      // Sliding screen droplets (condensation effect)
      const glassCount = Math.floor(18 * density);
      for (let i = 0; i < glassCount; i++) {
        glassDrops.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: 1.2 + Math.random() * 2.2,
          vy: 0.15 + Math.random() * 0.3,
          alpha: 0.2 + Math.random() * 0.3,
          life: 0,
          maxLife: 200 + Math.random() * 150,
        });
      }
    };

    // Setup depending on theme
    if (theme === "fire") initFire();
    else if (theme === "water") initWater();
    else if (theme === "wave") initWave();
    else if (theme === "cloud") initCloud();
    else if (theme === "rain") initRain();

    // Pre-render a small film-grain noise tile once for a cinematic texture
    const grainTile = document.createElement("canvas");
    grainTile.width = 180;
    grainTile.height = 180;
    const gctx = grainTile.getContext("2d");
    if (gctx) {
      const noise = gctx.createImageData(grainTile.width, grainTile.height);
      for (let i = 0; i < noise.data.length; i += 4) {
        const v = Math.random() * 255;
        noise.data[i] = v;
        noise.data[i + 1] = v;
        noise.data[i + 2] = v;
        noise.data[i + 3] = 255;
      }
      gctx.putImageData(noise, 0, 0);
    }

    // Drawing loops
    let currentBreatheScale = 0.5;

    const draw = () => {
      // 1. Render ambient backing layer.
      if (hasBgRef.current) {
        // An AI photo sits behind the canvas: clear to transparency and lay down
        // only a soft, eye-friendly dark veil so the image shows through while
        // particles and text stay readable.
        ctx.clearRect(0, 0, width, height);
        const veil = ctx.createLinearGradient(0, 0, 0, height);
        veil.addColorStop(0, "rgba(3, 4, 9, 0.42)");
        veil.addColorStop(0.5, "rgba(3, 4, 9, 0.18)");
        veil.addColorStop(1, "rgba(2, 3, 7, 0.6)");
        ctx.fillStyle = veil;
        ctx.fillRect(0, 0, width, height);
      } else {
        // No image: paint the full ambient gradient as before.
        const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, colors[2] || "#080b12");
        bgGrad.addColorStop(0.5, colors[1] || colors[0]);
        bgGrad.addColorStop(1, colors[0]);
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // Skip dynamic updates if paused, but keep redrawing scene
      const animateStep = !isPaused;

      // 2. High-Fidelity Sensory Coherence: Interpolate breathe scale to follow the real-time breathe phase
      let targetScale = 0.0;
      if (breathePhase === "inhale" || breathePhase === "hold") {
        targetScale = 1.0;
      } else {
        targetScale = 0.0;
      }
      
      const lerpSpeed = breathePhase === "inhale" ? 0.015 : breathePhase === "exhale" ? 0.012 : 0.02;
      currentBreatheScale += (targetScale - currentBreatheScale) * lerpSpeed;
      const breatheScale = currentBreatheScale;
      // Synthesize a slow cycle time for calculations that depend on wave/time
      const breatheTime = Date.now() * 0.0005;

      // --- THEME 1: FIRE ---
      if (theme === "fire") {
        ctx.save();
        // Fire glow overlay (modulates dynamically based on breath intake!)
        const flareGlow = width * (0.45 + breatheScale * 0.25) * glow;
        const glowGrad = ctx.createRadialGradient(width / 2, height - 30, 10, width / 2, height - 30, flareGlow);
        glowGrad.addColorStop(0, `${colors[0]}77`);
        glowGrad.addColorStop(0.3, "rgba(252, 74, 26, 0.15)");
        glowGrad.addColorStop(1, "transparent");
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, width, height);

        // Render soft rising smoke particles
        smokeParticles.forEach((s) => {
          ctx.beginPath();
          ctx.fillStyle = "rgba(100, 105, 120, 0.2)";
          ctx.globalAlpha = s.alpha * (1 - s.life / s.maxLife);
          ctx.arc(s.x + Math.sin(s.life * 0.02) * 15, s.y, s.size * (1 + s.life / s.maxLife * 0.5), 0, Math.PI * 2);
          ctx.fill();

          if (animateStep) {
            s.y += s.vy * (0.8 + breatheScale * 0.4); // Smoke rises faster on inhalation
            s.x += s.vx;
            s.life++;

            if (s.life >= s.maxLife || s.y < -50) {
              s.x = width / 2 + (Math.random() * 80 - 40);
              s.y = height + Math.random() * 20;
              s.life = 0;
              s.alpha = 0.03 + Math.random() * 0.05;
              s.size = 15 + Math.random() * 25;
            }
          }
        });

        // Draw fire logs silhouette
        ctx.fillStyle = "#0c0503";
        ctx.beginPath();
        ctx.moveTo(width / 2 - 90, height);
        ctx.quadraticCurveTo(width / 2 - 40, height - 25, width / 2 + 50, height);
        ctx.moveTo(width / 2 + 90, height);
        ctx.quadraticCurveTo(width / 2 + 45, height - 30, width / 2 - 50, height);
        ctx.closePath();
        ctx.fill();

        // Update and Draw Ember Particles (additive blending for real bloom)
        ctx.globalCompositeOperation = "lighter";
        particles.forEach((p) => {
          ctx.beginPath();
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha * (1 - p.life / p.maxLife);

          // Flame glow blur filter simulation
          ctx.shadowBlur = p.size * (1.2 + breatheScale * 0.8);
          ctx.shadowColor = p.color;

          // Float trajectory
          const xOffset = Math.sin(p.life * p.wobbleSpeed) * p.wobbleAmp * (p.life / p.maxLife);
          ctx.arc(p.x + xOffset, p.y, p.size * (1 - p.life / p.maxLife * 0.5), 0, Math.PI * 2);
          ctx.fill();

          if (animateStep) {
            // Embers accelerate up with breath intake
            p.y += p.vy * (0.7 + breatheScale * 0.6);
            p.x += p.vx;
            p.life++;

            // Recycle embers
            if (p.life >= p.maxLife || p.y < -50) {
              p.x = width / 2 + (Math.random() * 120 - 60);
              p.y = height + Math.random() * 50;
              p.vx = (Math.random() * 1.2 - 0.6) * speed;
              p.vy = -(1.5 + Math.random() * 2.2) * speed;
              p.life = 0;
              p.alpha = 0.3 + Math.random() * 0.7;
              p.size = (3 + Math.random() * 10) * glow;
              p.color = getEmberColor();
            }
          }
        });
        ctx.restore();
      }

      // --- THEME 2: WATER ---
      else if (theme === "water") {
        ctx.save();
        // Rays of light (caustics) from top, sweeping horizontally and pulsing with breath
        const rayCount = 6;
        for (let r = 0; r < rayCount; r++) {
          const rayAngle = Math.sin(Date.now() * 0.0005 + r) * 0.15;
          const startX = width * (0.2 + (r / rayCount) * 0.6) + Math.cos(Date.now() * 0.0004) * 40;
          const rayWidth = 60 + Math.sin(Date.now() * 0.001 + r) * 20;

          const rayGlowGrad = ctx.createLinearGradient(startX, 0, startX + Math.tan(rayAngle) * height, height);
          const rayAlpha = (0.04 + Math.sin(Date.now() * 0.0008 + r) * 0.02 + breatheScale * 0.03) * glow;
          rayGlowGrad.addColorStop(0, `rgba(255, 255, 255, ${rayAlpha})`);
          rayGlowGrad.addColorStop(0.5, `rgba(255, 255, 255, ${rayAlpha * 0.4})`);
          rayGlowGrad.addColorStop(1, "rgba(255, 255, 255, 0)");

          ctx.fillStyle = rayGlowGrad;
          ctx.beginPath();
          ctx.moveTo(startX - rayWidth / 2, 0);
          ctx.lineTo(startX + rayWidth / 2, 0);
          ctx.lineTo(startX + Math.tan(rayAngle) * height + rayWidth, height);
          ctx.lineTo(startX + Math.tan(rayAngle) * height - rayWidth, height);
          ctx.closePath();
          ctx.fill();
        }

        // Render Water Wave Layers
        waves.forEach((w) => {
          ctx.fillStyle = w.color;
          ctx.globalAlpha = w.opacity * (0.85 + breatheScale * 0.3); // Wave brightness pulses with breath
          ctx.beginPath();
          ctx.moveTo(0, height);

          for (let x = 0; x <= width; x += 15) {
            // Wave amplitude peaks as you breathe in
            const dynamicAmp = w.amplitude * (0.7 + breatheScale * 0.6);
            const waveY = height * 0.35 + Math.sin(x * w.frequency + w.phase) * dynamicAmp;
            ctx.lineTo(x, waveY);
          }
          ctx.lineTo(width, height);
          ctx.closePath();
          ctx.fill();

          if (animateStep) {
            w.phase += w.speed;
          }
        });

        // Bubbles drawing
        particles.forEach((p) => {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255, 255, 255, ${p.alpha})`;
          ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.25})`;
          ctx.lineWidth = 1;
          const xOffset = Math.sin(p.life * p.swaySpeed) * p.swayAmp;
          ctx.arc(p.x + xOffset, p.y, p.size, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fill();

          // Sparkle specular reflection highlights
          ctx.beginPath();
          ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
          ctx.arc(p.x + xOffset - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.2, 0, Math.PI * 2);
          ctx.fill();

          if (animateStep) {
            p.y += p.vy * (0.8 + breatheScale * 0.5); // Bubbles rise faster on inhalation
            p.life++;

            if (p.life >= p.maxLife || p.y < -30) {
              p.x = Math.random() * width;
              p.y = height + Math.random() * 50;
              p.life = 0;
              p.alpha = 0.08 + Math.random() * 0.45;
            }
          }
        });
        ctx.restore();
      }

      // --- THEME 3: WAVE (PERFECT SENSORY COHERENCE WITH BREATH SINE) ---
      else if (theme === "wave") {
        ctx.save();
        // 1. Draw sand beach background base
        const sandGrad = ctx.createLinearGradient(0, height * 0.5, 0, height);
        sandGrad.addColorStop(0, "#080c18");
        sandGrad.addColorStop(0.5, "#15100f");
        sandGrad.addColorStop(1, "#211a14");
        ctx.fillStyle = sandGrad;
        ctx.fillRect(0, 0, width, height);

        // Shimmer beach sands
        backgroundStars.forEach((s) => {
          ctx.beginPath();
          ctx.fillStyle = "#ffffff";
          ctx.globalAlpha = s.alpha * (0.6 + Math.sin(Date.now() * s.twinkleSpeed) * 0.4);
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fill();
        });

        const wave = waves[0];
        if (wave) {
          // Drive shoreline wave depth DIRECTLY using the breathing scale!
          // Wave swells forward on Inhale, and ebbs backward on Exhale.
          // This creates magical psychological sync with the user's breathing rhythm.
          if (animateStep) {
            // Align progress directly to breatheScale
            wave.progress = breatheScale;
            // Determine direction for foam creation
            const cosVal = Math.cos(breatheTime);
            wave.direction = cosVal > 0 ? 1 : -1; // positive slope = incoming tide
          }

          const targetY = height * 0.52 + (height * 0.40) * wave.progress;

          // Wave water gradient
          const waterGrad = ctx.createLinearGradient(0, targetY, 0, height);
          waterGrad.addColorStop(0, "rgba(215, 245, 255, 0.35)"); // Clear shoreline foam
          waterGrad.addColorStop(0.06, "rgba(52, 178, 198, 0.55)"); // Turquoise water body
          waterGrad.addColorStop(0.45, "rgba(18, 32, 54, 0.7)"); // Dark deep sea
          waterGrad.addColorStop(1, "rgba(10, 14, 25, 0.9)");

          ctx.beginPath();
          ctx.moveTo(0, height);

          // Draw wave line with dynamic noise
          for (let x = 0; x <= width + 20; x += 20) {
            const noise = Math.sin(x * 0.007 + wave.progress * 8) * 18 +
                          Math.sin(x * 0.025 + wave.progress * 4) * 8;
            const y = targetY + noise * (1 - wave.progress * 0.35);
            ctx.lineTo(x, y);
          }
          ctx.lineTo(width, height);
          ctx.closePath();
          ctx.fillStyle = waterGrad;
          ctx.globalAlpha = 0.95;
          ctx.fill();

          // Sparkle foam splashes on shoreline swell
          if (animateStep && Math.random() < 0.5) {
            const fCount = Math.floor(5 * density);
            for (let f = 0; f < fCount; f++) {
              wave.foamParticles.push({
                x: Math.random() * width,
                y: targetY + (Math.random() * 24 - 12),
                vx: (Math.random() * 1.5 - 0.75) * speed,
                vy: (Math.random() * 0.6 - 0.3),
                size: 1.2 + Math.random() * 4.5,
                life: 0,
                maxLife: 40 + Math.random() * 50
              });
            }
          }

          // Draw foams (additive blending for soft glowing sea spray)
          ctx.globalCompositeOperation = "lighter";
          wave.foamParticles.forEach((f: any) => {
            ctx.beginPath();
            ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
            ctx.globalAlpha = 0.65 * (1 - f.life / f.maxLife);
            ctx.shadowBlur = f.size * 2;
            ctx.shadowColor = "rgba(200, 235, 255, 0.8)";
            ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
            ctx.fill();

            if (animateStep) {
              f.x += f.vx;
              f.y += f.vy + (wave.direction * 0.8);
              f.life++;
            }
          });
          ctx.globalCompositeOperation = "source-over";

          // Clean dead foam
          if (animateStep) {
            wave.foamParticles = wave.foamParticles.filter((f: any) => f.life < f.maxLife);
          }
        }
        ctx.restore();
      }

      // --- THEME 4: CLOUD ---
      else if (theme === "cloud") {
        ctx.save();
        // Draw starry nebula background (additive blending for soft glow)
        ctx.globalCompositeOperation = "lighter";
        backgroundStars.forEach((s) => {
          ctx.beginPath();
          ctx.fillStyle = "#ffffff";
          ctx.globalAlpha = s.alpha * (0.4 + Math.sin(Date.now() * s.twinkle) * 0.6);
          ctx.shadowBlur = s.size * 2.5;
          ctx.shadowColor = "rgba(180, 200, 255, 0.9)";
          ctx.arc(s.x, s.y, s.size * (0.85 + breatheScale * 0.3), 0, Math.PI * 2); // Star size pulses with breathing
          ctx.fill();
        });
        ctx.globalCompositeOperation = "source-over";
        ctx.shadowBlur = 0;

        // Draw cloud formations
        clouds.forEach((c) => {
          ctx.fillStyle = "#ffffff";
          // Clouds are slightly thicker/clearer when fully inhaled
          ctx.globalAlpha = c.alpha * (0.8 + breatheScale * 0.3);

          ctx.save();
          ctx.translate(c.x, c.y);
          // Gently scale clouds matching the breathing flow
          const dynamicScale = c.scale * (0.95 + breatheScale * 0.1);
          ctx.scale(dynamicScale, dynamicScale);

          // Render cloud bubbles using paths
          ctx.beginPath();
          c.circles.forEach((circ: any) => {
            ctx.arc(circ.rx, circ.ry, circ.r, 0, Math.PI * 2);
          });
          ctx.closePath();
          ctx.fill();

          ctx.restore();

          if (animateStep) {
            c.x += c.vx;
            // Wrap around screen boundaries
            if (c.x - 150 * c.scale > width) {
              c.x = -150 * c.scale;
              c.y = height * 0.15 + Math.random() * (height * 0.45);
            }
          }
        });
        ctx.restore();
      }

      // --- THEME 5: RAIN ---
      else if (theme === "rain") {
        ctx.save();
        // Rain puddles reflections shimmer (modulating with breath)
        const puddleGrad = ctx.createRadialGradient(width / 2, height, 10, width / 2, height, width * 0.8);
        puddleGrad.addColorStop(0, `rgba(20, 25, 42, ${0.45 + breatheScale * 0.2})`);
        puddleGrad.addColorStop(1, "transparent");
        ctx.fillStyle = puddleGrad;
        ctx.fillRect(0, 0, width, height);

        // Draw Falling Raindrops
        ctx.strokeStyle = "rgba(174, 194, 224, 0.38)";
        ctx.lineWidth = 1.2;
        ctx.lineCap = "round";

        raindrops.forEach((r) => {
          ctx.beginPath();
          ctx.globalAlpha = r.alpha;
          ctx.moveTo(r.x, r.y);
          ctx.lineTo(r.x + r.vx * 0.6, r.y + r.vy * 0.6); // draw stroke
          ctx.stroke();

          if (animateStep) {
            r.y += r.vy;
            r.x += r.vx;

            // Check puddle ripple splash hits
            if (r.y >= r.splashY) {
              // Add a ripple
              if (Math.random() < 0.55 && ripples.length < 40) {
                ripples.push({
                  x: r.x,
                  y: r.splashY,
                  radius: 0.5,
                  maxRadius: 10 + Math.random() * 20,
                  alpha: 0.3 + Math.random() * 0.4,
                  speed: 0.2 + Math.random() * 0.3,
                });
              }

              // Reset raindrop
              r.x = Math.random() * width;
              r.y = Math.random() * -100;
              r.vy = (5 + Math.random() * 6) * speed;
              r.vx = -(1 + Math.random() * 2) * speed;
              r.alpha = 0.15 + Math.random() * 0.35;
              r.splashY = height * 0.65 + Math.random() * (height * 0.35);
            }
          }
        });

        // Draw ripples splash
        ripples.forEach((rip) => {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(180, 205, 235, ${rip.alpha * (1 - rip.radius / rip.maxRadius)})`;
          ctx.lineWidth = 0.8;
          ctx.ellipse(rip.x, rip.y, rip.radius, rip.radius * 0.3, 0, 0, Math.PI * 2); // perspective ellipse
          ctx.stroke();

          if (animateStep) {
            rip.radius += rip.speed;
          }
        });

        // Draw Sliding Screen Glass Droplets (Premium Window condensation)
        glassDrops.forEach((g) => {
          ctx.beginPath();
          ctx.fillStyle = `rgba(255, 255, 255, ${g.alpha})`;
          ctx.arc(g.x, g.y, g.size, 0, Math.PI * 2);
          ctx.fill();

          // Subtle reflection sparkle
          ctx.beginPath();
          ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
          ctx.arc(g.x - g.size * 0.3, g.y - g.size * 0.3, g.size * 0.25, 0, Math.PI * 2);
          ctx.fill();

          if (animateStep) {
            g.y += g.vy * (0.8 + breatheScale * 0.4); // condensation slides down matching wind/breath sweep
            g.life++;

            if (g.life >= g.maxLife || g.y > height + 10) {
              g.x = Math.random() * width;
              g.y = Math.random() * -50;
              g.life = 0;
              g.size = 1.2 + Math.random() * 2.2;
              g.alpha = 0.2 + Math.random() * 0.3;
            }
          }
        });

        if (animateStep) {
          // Cleanup dead ripples
          ripples = ripples.filter((rip) => rip.radius < rip.maxRadius);
        }
        ctx.restore();
      }

      // --- CINEMATIC POST-PROCESSING (applies to all themes) ---
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      ctx.shadowBlur = 0;

      // Vignette: gently darken the edges to draw the eye inward
      const vignette = ctx.createRadialGradient(
        width / 2,
        height / 2,
        Math.min(width, height) * 0.32,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.78
      );
      vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
      vignette.addColorStop(1, "rgba(0, 0, 0, 0.5)");
      ctx.globalAlpha = 1;
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      // Film grain: subtle animated texture so flat areas never look sterile
      if (gctx) {
        ctx.globalCompositeOperation = "overlay";
        ctx.globalAlpha = 0.035;
        const ox = Math.floor(Math.random() * grainTile.width);
        const oy = Math.floor(Math.random() * grainTile.height);
        for (let gx = -ox; gx < width; gx += grainTile.width) {
          for (let gy = -oy; gy < height; gy += grainTile.height) {
            ctx.drawImage(grainTile, gx, gy);
          }
        }
      }
      ctx.restore();

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions, theme, colors, isPaused, speed, density, glow, breathingId, breathePhase, colorId]);

  return (
    <div id="visualizer-container" ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden select-none">
      {/* AI-generated ambient backdrop (behind the generative canvas). Fades in
          on load; the canvas above lays a translucent veil so it stays calm. */}
      {backgroundImage && (
        <img
          src={backgroundImage}
          alt=""
          aria-hidden="true"
          onLoad={() => setBgLoaded(true)}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[2500ms] ease-out"
          style={{ opacity: bgLoaded ? 1 : 0 }}
        />
      )}
      <canvas id="generative-visual-canvas" ref={canvasRef} className="relative w-full h-full block" />
    </div>
  );
}
