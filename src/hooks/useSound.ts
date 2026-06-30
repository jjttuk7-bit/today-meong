import { useEffect, useRef } from "react";
import { AIParams, ThemeId, MusicId } from "../types";

export function useSound() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterVolumeRef = useRef<GainNode | null>(null);
  const sourceNodesRef = useRef<AudioNode[]>([]);
  const intervalIdsRef = useRef<NodeJS.Timeout[]>([]);
  const isPlayingRef = useRef<boolean>(false);

  // White and Pink Noise Buffer creation
  const createPinkNoiseBuffer = (ctx: AudioContext) => {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      data[i] *= 0.11; // estimate
      b6 = white * 0.115926;
    }
    return buffer;
  };

  const createWhiteNoiseBuffer = (ctx: AudioContext) => {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  };

  const stopAll = () => {
    // Clear intervals
    intervalIdsRef.current.forEach((id) => clearInterval(id));
    intervalIdsRef.current = [];

    // Stop and disconnect source nodes
    sourceNodesRef.current.forEach((node) => {
      try {
        if ("stop" in node) {
          (node as any).stop();
        }
        node.disconnect();
      } catch (e) {
        // Safe fail
      }
    });
    sourceNodesRef.current = [];
    isPlayingRef.current = false;
  };

  const initSynth = (theme: ThemeId, params: AIParams, musicId: MusicId = "off") => {
    stopAll();

    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const ctx = audioCtxRef.current;

    if (ctx.state === "suspended") {
      ctx.resume();
    }

    // Set up master volume node with fade-in
    const masterVolume = ctx.createGain();
    masterVolume.gain.setValueAtTime(0, ctx.currentTime);
    const targetVolume = params.ambientNoiseLevel !== undefined ? params.ambientNoiseLevel : 0.4;
    masterVolume.gain.linearRampToValueAtTime(targetVolume, ctx.currentTime + 3.0); // Smooth 3s fade-in
    masterVolume.connect(ctx.destination);
    masterVolumeRef.current = masterVolume;

    isPlayingRef.current = true;

    // 0-A. Music Therapy: Solfeggio Sound Resonance Layer
    if (musicId && musicId !== "off") {
      const targetFreq = parseInt(musicId);
      if (!isNaN(targetFreq)) {
        try {
          // Play a beautiful dual-detuned healing drone (warm sub-octave)
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const oscGain = ctx.createGain();
          
          osc1.type = "sine";
          osc1.frequency.setValueAtTime(targetFreq / 2, ctx.currentTime); // Half frequency for rich, comforting bass
          
          osc2.type = "sine";
          osc2.frequency.setValueAtTime(targetFreq / 2 + 0.45, ctx.currentTime); // Slight detuning for beautiful lush chorus

          // Extremely slow organic breathe-in/breathe-out volume LFO
          const volLfo = ctx.createOscillator();
          volLfo.type = "sine";
          volLfo.frequency.setValueAtTime(0.04, ctx.currentTime); // Extremely slow (25s cycle)
          
          const volLfoGain = ctx.createGain();
          volLfoGain.gain.setValueAtTime(0.015, ctx.currentTime); // Small swell depth
          
          oscGain.gain.setValueAtTime(0.045, ctx.currentTime); // Very soft background level
          
          volLfo.connect(volLfoGain);
          volLfoGain.connect(oscGain.gain);
          
          osc1.connect(oscGain);
          osc2.connect(oscGain);
          oscGain.connect(masterVolume);
          
          osc1.start();
          osc2.start();
          volLfo.start();
          
          sourceNodesRef.current.push(osc1, osc2, volLfo);
        } catch (e) {
          console.warn("Solfeggio Sound Healing layer initialization skipped:", e);
        }
      }
    }

    // 0. Premium Healing Layer: Binaural Beats (6Hz Theta wave for deep mental rest)
    const playBinauralBeats = (baseFreq: number, beatFreq: number, volumeLevel: number) => {
      try {
        const oscL = ctx.createOscillator();
        const oscR = ctx.createOscillator();
        const gainL = ctx.createGain();
        const gainR = ctx.createGain();
        
        oscL.type = "sine";
        oscL.frequency.setValueAtTime(baseFreq, ctx.currentTime);
        gainL.gain.setValueAtTime(volumeLevel, ctx.currentTime);

        oscR.type = "sine";
        oscR.frequency.setValueAtTime(baseFreq + beatFreq, ctx.currentTime);
        gainR.gain.setValueAtTime(volumeLevel, ctx.currentTime);

        if (ctx.createStereoPanner) {
          const panL = ctx.createStereoPanner();
          const panR = ctx.createStereoPanner();
          panL.pan.setValueAtTime(-0.85, ctx.currentTime);
          panR.pan.setValueAtTime(0.85, ctx.currentTime);

          oscL.connect(gainL).connect(panL).connect(masterVolume);
          oscR.connect(gainR).connect(panR).connect(masterVolume);
        } else {
          oscL.connect(gainL).connect(masterVolume);
          oscR.connect(gainR).connect(masterVolume);
        }

        oscL.start();
        oscR.start();
        sourceNodesRef.current.push(oscL, oscR);
      } catch (e) {
        console.warn("Binaural beats initialization skipped:", e);
      }
    };

    // Low, soothing 100Hz carrier frequency with a 6Hz difference (Theta wave)
    playBinauralBeats(100, 6, 0.05);

    // Helper to generate pink noise loop with custom filter and gain
    const playNoiseLoop = (filterType: BiquadFilterType, filterFreq: number, q: number, gainLevel: number) => {
      const bufferSource = ctx.createBufferSource();
      bufferSource.buffer = createPinkNoiseBuffer(ctx);
      bufferSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = filterType;
      filter.frequency.setValueAtTime(filterFreq, ctx.currentTime);
      filter.Q.setValueAtTime(q, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(gainLevel, ctx.currentTime);

      bufferSource.connect(filter);
      filter.connect(gain);
      gain.connect(masterVolume);

      bufferSource.start();
      sourceNodesRef.current.push(bufferSource);
      return { source: bufferSource, filter, gain };
    };

    // Theme Specific Audio Synthesizer Design
    if (theme === "fire") {
      // 1. Fire rumble (lowpass filtered pink noise)
      playNoiseLoop("lowpass", 70, 1.0, 0.45);

      // 2. Fire crackling pops (scheduled via setInterval with 3D spatial panning)
      const triggerCrackling = () => {
        if (!isPlayingRef.current || !audioCtxRef.current) return;
        const c = audioCtxRef.current;
        const osc = c.createOscillator();
        const gain = c.createGain();
        const filter = c.createBiquadFilter();
        const panner = c.createStereoPanner ? c.createStereoPanner() : null;

        osc.type = "triangle";
        // Base frequency parameterized by AI pitch
        const basePitch = (params.pitch || 85) * 8;
        osc.frequency.setValueAtTime(basePitch + Math.random() * 1200, c.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, c.currentTime + 0.02);

        filter.type = "highpass";
        filter.frequency.setValueAtTime(1800, c.currentTime);

        gain.gain.setValueAtTime(0.003 + Math.random() * 0.012, c.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.025);

        osc.connect(filter);
        filter.connect(gain);

        if (panner) {
          // Pan crackles all around the bonfire 3D stage
          panner.pan.setValueAtTime((Math.random() * 2 - 1) * 0.8, c.currentTime);
          gain.connect(panner);
          panner.connect(masterVolume);
        } else {
          gain.connect(masterVolume);
        }

        osc.start();
        osc.stop(c.currentTime + 0.03);
      };

      // Base crackle rate modulated by AI speed and custom crackling rate
      const baseInterval = 250 / (params.soundSpeed || 0.8);
      const intervalId = setInterval(() => {
        // Spark probability
        if (Math.random() < 0.65) {
          triggerCrackling();
        }
        // Occasional double crackle
        if (Math.random() < 0.2) {
          setTimeout(triggerCrackling, 60 + Math.random() * 80);
        }
      }, baseInterval);

      intervalIdsRef.current.push(intervalId);

    } else if (theme === "water") {
      // 1. Soft underwater water wash
      const ambientWater = playNoiseLoop("bandpass", 280, 1.2, 0.25);

      // Modulate ambient water lowpass/bandpass slowly
      const waterLfo = ctx.createOscillator();
      waterLfo.type = "sine";
      waterLfo.frequency.setValueAtTime(0.08, ctx.currentTime); // very slow oscillation
      const waterLfoGain = ctx.createGain();
      waterLfoGain.gain.setValueAtTime(80, ctx.currentTime);

      waterLfo.connect(waterLfoGain);
      waterLfoGain.connect(ambientWater.filter.frequency);
      waterLfo.start();
      sourceNodesRef.current.push(waterLfo);

      // 2. Rising bubble pops with stereophonic width
      const triggerBubble = () => {
        if (!isPlayingRef.current || !audioCtxRef.current) return;
        const c = audioCtxRef.current;
        const osc = c.createOscillator();
        const gain = c.createGain();
        const panner = c.createStereoPanner ? c.createStereoPanner() : null;

        osc.type = "sine";
        const baseFreq = (params.pitch || 110) * 1.6; // ~170Hz - 400Hz
        const startFreq = baseFreq + Math.random() * 80;
        const endFreq = startFreq * (1.6 + Math.random() * 0.6); // upward sweep

        osc.frequency.setValueAtTime(startFreq, c.currentTime);
        osc.frequency.exponentialRampToValueAtTime(endFreq, c.currentTime + 0.12);

        gain.gain.setValueAtTime(0, c.currentTime);
        gain.gain.linearRampToValueAtTime(0.008 + Math.random() * 0.015, c.currentTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.14);

        osc.connect(gain);

        if (panner) {
          panner.pan.setValueAtTime((Math.random() * 2 - 1) * 0.7, c.currentTime);
          gain.connect(panner);
          panner.connect(masterVolume);
        } else {
          gain.connect(masterVolume);
        }

        osc.start();
        osc.stop(c.currentTime + 0.15);
      };

      const bubbleInterval = 400 / (params.soundSpeed || 1.0);
      const intervalId = setInterval(() => {
        if (Math.random() < 0.5) {
          triggerBubble();
        }
        if (Math.random() < 0.25) {
          setTimeout(triggerBubble, 150 + Math.random() * 200);
        }
      }, bubbleInterval);

      intervalIdsRef.current.push(intervalId);

    } else if (theme === "wave") {
      // 1. Sea wave rumble (lowpass filtered pink noise)
      const baseWave = playNoiseLoop("lowpass", 200, 1.0, 0.3);

      // Create wave L/R panner to physically roll the sea tide from left to right
      const wavePanner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      if (wavePanner) {
        try {
          baseWave.gain.disconnect();
          baseWave.gain.connect(wavePanner);
          wavePanner.connect(masterVolume);
        } catch (e) {
          // safe pass
        }
      }

      // 2. Periodic wave roller (modulate gain & filter dynamically to simulate crashing surf)
      let direction = 1; // 1 = swelling, -1 = receding
      let volume = 0.05;
      let filterFreq = 150;

      const wavePeriod = 8000 / (params.soundSpeed || 0.7); // 6-11s wave cycle
      const updateInterval = 100; // update state every 100ms
      const steps = wavePeriod / updateInterval / 2; // steps to go up or down

      const intervalId = setInterval(() => {
        if (!isPlayingRef.current || !masterVolumeRef.current) return;

        if (direction === 1) {
          volume += 0.35 / steps;
          filterFreq += 350 / steps;
          if (volume >= 0.4) direction = -1;
        } else {
          volume -= 0.35 / steps;
          filterFreq -= 350 / steps;
          if (volume <= 0.05) direction = 1;
        }

        // Clamp values safely
        const targetVol = Math.max(0.03, Math.min(0.5, volume));
        const targetFreq = Math.max(120, Math.min(600, filterFreq));

        try {
          baseWave.gain.gain.linearRampToValueAtTime(targetVol, ctx.currentTime + 0.1);
          baseWave.filter.frequency.linearRampToValueAtTime(targetFreq, ctx.currentTime + 0.1);
          
          if (wavePanner) {
            // Roll pan from -0.75 (left) to 0.75 (right) based on volume swelling
            const panVal = ((volume - 0.05) / 0.35) * 1.5 - 0.75;
            wavePanner.pan.linearRampToValueAtTime(panVal, ctx.currentTime + 0.1);
          }
        } catch (e) {
          // safe fail
        }
      }, updateInterval);

      intervalIdsRef.current.push(intervalId);

    } else if (theme === "cloud") {
      // Celestial ambient synth drone!
      const basePitch = params.pitch || 150;

      // Create 4 detuned harmonizing oscillators for a lush, therapeutic pad chord
      const chords = [1.0, 1.25, 1.5, 2.0]; // major-like peaceful drone
      chords.forEach((multiplier, index) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

        osc.type = "sine";
        // Slightly detuned
        const detune = (Math.random() * 2 - 1) * 1.5;
        osc.frequency.setValueAtTime(basePitch * multiplier + detune, ctx.currentTime);

        // Soft slow volume LFO per oscillator
        oscGain.gain.setValueAtTime(0.06, ctx.currentTime);

        osc.connect(oscGain);

        if (panner) {
          panner.pan.setValueAtTime((index % 2 === 0 ? -0.6 : 0.6) * (0.3 + Math.random() * 0.4), ctx.currentTime);
          oscGain.connect(panner);
          panner.connect(masterVolume);
        } else {
          oscGain.connect(masterVolume);
        }

        osc.start();
        sourceNodesRef.current.push(osc);

        // Slow modulation of drone volumes
        const padLfo = ctx.createOscillator();
        padLfo.type = "sine";
        padLfo.frequency.setValueAtTime(0.05 + index * 0.02, ctx.currentTime);
        const padLfoGain = ctx.createGain();
        padLfoGain.gain.setValueAtTime(0.03, ctx.currentTime);

        padLfo.connect(padLfoGain);
        padLfoGain.connect(oscGain.gain);
        padLfo.start();
        sourceNodesRef.current.push(padLfo);
      });

      // Add a tiny bit of high-pitched filtered noise for soft wind
      const breeze = playNoiseLoop("bandpass", 1500, 0.8, 0.08);

      // Slowly sweep the breeze filter frequency
      const windLfo = ctx.createOscillator();
      windLfo.type = "sine";
      windLfo.frequency.setValueAtTime(0.04, ctx.currentTime);
      const windLfoGain = ctx.createGain();
      windLfoGain.gain.setValueAtTime(400, ctx.currentTime);

      windLfo.connect(windLfoGain);
      windLfoGain.connect(breeze.filter.frequency);
      windLfo.start();
      sourceNodesRef.current.push(windLfo);

    } else if (theme === "rain") {
      // 1. Steady background shower (filtered white/pink noise)
      playNoiseLoop("bandpass", 1250, 0.75, 0.35);

      // 2. Tapping water splatter clicks in 3D surround sound
      const triggerRaindrop = () => {
        if (!isPlayingRef.current || !audioCtxRef.current) return;
        const c = audioCtxRef.current;
        const osc = c.createOscillator();
        const gain = c.createGain();
        const filter = c.createBiquadFilter();
        const panner = c.createStereoPanner ? c.createStereoPanner() : null;

        osc.type = "sine";
        const basePitch = (params.pitch || 140) * 11;
        osc.frequency.setValueAtTime(basePitch + Math.random() * 1500, c.currentTime);

        filter.type = "bandpass";
        filter.frequency.setValueAtTime(2600 + Math.random() * 600, c.currentTime);
        filter.Q.setValueAtTime(2.0, c.currentTime);

        gain.gain.setValueAtTime(0.002 + Math.random() * 0.007, c.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.015);

        osc.connect(filter);
        filter.connect(gain);

        if (panner) {
          // Drops fall randomly left and right
          panner.pan.setValueAtTime((Math.random() * 2 - 1) * 0.95, c.currentTime);
          gain.connect(panner);
          panner.connect(masterVolume);
        } else {
          gain.connect(masterVolume);
        }

        osc.start();
        osc.stop(c.currentTime + 0.018);
      };

      // Raindrop frequency modulated by AI speed/density
      const rainInterval = 180 / (params.soundSpeed || 1.2);
      const intervalId = setInterval(() => {
        if (Math.random() < 0.85) {
          triggerRaindrop();
        }
        if (Math.random() < 0.4) {
          setTimeout(triggerRaindrop, 40 + Math.random() * 80);
        }
      }, rainInterval);

      intervalIdsRef.current.push(intervalId);
    }
  };

  const setVolume = (level: number) => {
    if (masterVolumeRef.current && audioCtxRef.current) {
      masterVolumeRef.current.gain.linearRampToValueAtTime(
        Math.max(0, Math.min(1.0, level)),
        audioCtxRef.current.currentTime + 0.1
      );
    }
  };

  const fadeOutAndStop = (callback?: () => void) => {
    if (masterVolumeRef.current && audioCtxRef.current) {
      const c = audioCtxRef.current;
      masterVolumeRef.current.gain.linearRampToValueAtTime(0, c.currentTime + 2.5); // 2.5s fade-out
      setTimeout(() => {
        stopAll();
        if (callback) callback();
      }, 2600);
    } else {
      stopAll();
      if (callback) callback();
    }
  };

  // Perform proper cleanup on unmount
  useEffect(() => {
    return () => {
      stopAll();
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    };
  }, []);

  return {
    initSynth,
    stopAll,
    fadeOutAndStop,
    setVolume,
    isPlaying: isPlayingRef.current,
  };
}
