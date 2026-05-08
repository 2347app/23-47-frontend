// =====================================================
// Ambient Engine — atmósferas de audio procedurales
// Genera sonido ambiental continuo sin assets binarios.
// Comparte estado con el audio.store (mute / volume).
// =====================================================

import { useAudioStore } from "../store/audio.store";

export type AmbientType = "rain" | "crt" | "warm" | "neon" | "calm" | "wind" | "none";

interface ActiveLayer {
  gainNode: GainNode;
  sources: (AudioBufferSourceNode | OscillatorNode)[];
}

class AmbientEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentLayer: ActiveLayer | null = null;
  private currentType: AmbientType = "none";
  private pendingType: AmbientType = "none";

  constructor() {
    if (typeof window === "undefined") return;
    document.addEventListener(
      "pointerdown",
      () => {
        if (this.ctx?.state === "suspended") {
          this.ctx.resume().then(() => this.applyPending()).catch(() => {});
        } else if (!this.ctx && this.pendingType !== "none") {
          this.setAmbient(this.pendingType);
        }
      },
      { passive: true }
    );
  }

  private ensureCtx(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      try {
        const Ctor = (window as any).AudioContext ?? (window as any).webkitAudioContext;
        if (!Ctor) return null;
        const ctx = new Ctor() as AudioContext;
        this.ctx = ctx;
        this.masterGain = ctx.createGain();
        this.masterGain.connect(ctx.destination);
      } catch {
        return null;
      }
    }
    return this.ctx;
  }

  // ── Noise generators ────────────────────────────────────────

  private makeWhiteNoise(c: AudioContext, seconds = 4): AudioBufferSourceNode {
    const sr = c.sampleRate;
    const buf = c.createBuffer(1, sr * seconds, sr);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    return src;
  }

  private makeBrownNoise(c: AudioContext, seconds = 4): AudioBufferSourceNode {
    const sr = c.sampleRate;
    const buf = c.createBuffer(2, sr * seconds, sr);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      let b = 0;
      for (let i = 0; i < d.length; i++) {
        b = (b + 0.02 * (Math.random() * 2 - 1)) / 1.02;
        d[i] = b * 3.5;
      }
    }
    const src = c.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    return src;
  }

  // ── Ambient layer builders ───────────────────────────────────

  private buildRain(c: AudioContext, master: GainNode): ActiveLayer {
    const layer = c.createGain();
    layer.gain.value = 0;
    layer.connect(master);
    const sources: (AudioBufferSourceNode | OscillatorNode)[] = [];

    const n1 = this.makeWhiteNoise(c);
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1800;
    bp.Q.value = 0.4;
    const g1 = c.createGain();
    g1.gain.value = 0.3;
    n1.connect(bp).connect(g1).connect(layer);
    n1.start();
    sources.push(n1);

    const n2 = this.makeWhiteNoise(c);
    const hp = c.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 5000;
    const g2 = c.createGain();
    g2.gain.value = 0.06;
    n2.connect(hp).connect(g2).connect(layer);
    n2.start();
    sources.push(n2);

    const n3 = this.makeBrownNoise(c);
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 220;
    const g3 = c.createGain();
    g3.gain.value = 0.12;
    n3.connect(lp).connect(g3).connect(layer);
    n3.start();
    sources.push(n3);

    return { gainNode: layer, sources };
  }

  private buildCRT(c: AudioContext, master: GainNode): ActiveLayer {
    const layer = c.createGain();
    layer.gain.value = 0;
    layer.connect(master);
    const sources: (AudioBufferSourceNode | OscillatorNode)[] = [];

    const osc = c.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = 60;
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 240;
    const g1 = c.createGain();
    g1.gain.value = 0.022;
    osc.connect(lp).connect(g1).connect(layer);
    osc.start();
    sources.push(osc);

    const noise = this.makeWhiteNoise(c);
    const hp = c.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 7500;
    const g2 = c.createGain();
    g2.gain.value = 0.016;
    noise.connect(hp).connect(g2).connect(layer);
    noise.start();
    sources.push(noise);

    return { gainNode: layer, sources };
  }

  private buildWarm(c: AudioContext, master: GainNode): ActiveLayer {
    const layer = c.createGain();
    layer.gain.value = 0;
    layer.connect(master);
    const sources: (AudioBufferSourceNode | OscillatorNode)[] = [];

    [55, 110, 165].forEach((f, i) => {
      const osc = c.createOscillator();
      osc.type = "sine";
      osc.frequency.value = f;
      const lfo = c.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = 0.04 + i * 0.015;
      const lfoG = c.createGain();
      lfoG.gain.value = 1.2;
      lfo.connect(lfoG).connect(osc.frequency);
      const g = c.createGain();
      g.gain.value = 0.038 / (i + 1);
      osc.connect(g).connect(layer);
      osc.start();
      lfo.start();
      sources.push(osc, lfo);
    });

    const noise = this.makeWhiteNoise(c);
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 3200;
    bp.Q.value = 1.5;
    const gn = c.createGain();
    gn.gain.value = 0.012;
    noise.connect(bp).connect(gn).connect(layer);
    noise.start();
    sources.push(noise);

    return { gainNode: layer, sources };
  }

  private buildCalm(c: AudioContext, master: GainNode): ActiveLayer {
    const layer = c.createGain();
    layer.gain.value = 0;
    layer.connect(master);
    const sources: (AudioBufferSourceNode | OscillatorNode)[] = [];

    [220, 330, 440, 494].forEach((f, i) => {
      const osc = c.createOscillator();
      osc.type = "sine";
      osc.frequency.value = f;
      osc.detune.value = i % 2 === 0 ? 3 : -3;
      const lfo = c.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = 0.025 + i * 0.01;
      const lfoG = c.createGain();
      lfoG.gain.value = 1.8;
      lfo.connect(lfoG).connect(osc.frequency);
      const g = c.createGain();
      g.gain.value = 0.02 / (1 + i * 0.25);
      osc.connect(g).connect(layer);
      osc.start();
      lfo.start();
      sources.push(osc, lfo);
    });

    return { gainNode: layer, sources };
  }

  private buildNeon(c: AudioContext, master: GainNode): ActiveLayer {
    const layer = c.createGain();
    layer.gain.value = 0;
    layer.connect(master);
    const sources: (AudioBufferSourceNode | OscillatorNode)[] = [];

    const buzz = c.createOscillator();
    buzz.type = "sawtooth";
    buzz.frequency.value = 120;
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 380;
    const g1 = c.createGain();
    g1.gain.value = 0.018;
    buzz.connect(lp).connect(g1).connect(layer);
    buzz.start();
    sources.push(buzz);

    [110, 220].forEach((f, i) => {
      const o = c.createOscillator();
      o.type = "sine";
      o.frequency.value = f;
      const g = c.createGain();
      g.gain.value = 0.016 / (i + 1);
      o.connect(g).connect(layer);
      o.start();
      sources.push(o);
    });

    return { gainNode: layer, sources };
  }

  private buildWind(c: AudioContext, master: GainNode): ActiveLayer {
    const layer = c.createGain();
    layer.gain.value = 0;
    layer.connect(master);
    const sources: (AudioBufferSourceNode | OscillatorNode)[] = [];

    const n1 = this.makeBrownNoise(c);
    const lpW = c.createBiquadFilter();
    lpW.type = "lowpass";
    lpW.frequency.value = 550;
    const lfo = c.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.08;
    const lfoG = c.createGain();
    lfoG.gain.value = 200;
    lfo.connect(lfoG).connect(lpW.frequency);
    const g1 = c.createGain();
    g1.gain.value = 0.22;
    n1.connect(lpW).connect(g1).connect(layer);
    n1.start();
    lfo.start();
    sources.push(n1, lfo);

    const n2 = this.makeWhiteNoise(c);
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 900;
    bp.Q.value = 0.35;
    const g2 = c.createGain();
    g2.gain.value = 0.04;
    n2.connect(bp).connect(g2).connect(layer);
    n2.start();
    sources.push(n2);

    return { gainNode: layer, sources };
  }

  // ── Core logic ───────────────────────────────────────────────

  private applyPending(): void {
    const c = this.ctx;
    const master = this.masterGain;
    if (!c || !master || c.state === "suspended") return;

    const type = this.pendingType;
    if (type === this.currentType) return;

    if (this.currentLayer) {
      const old = this.currentLayer;
      old.gainNode.gain.setTargetAtTime(0, c.currentTime, 0.9);
      setTimeout(() => {
        old.sources.forEach((s) => {
          try {
            (s as OscillatorNode | AudioBufferSourceNode).stop();
          } catch {}
        });
        old.gainNode.disconnect();
      }, 5000);
    }

    this.currentType = type;

    if (type === "none") {
      this.currentLayer = null;
      return;
    }

    let layer: ActiveLayer;
    switch (type) {
      case "rain": layer = this.buildRain(c, master); break;
      case "crt":  layer = this.buildCRT(c, master);  break;
      case "warm": layer = this.buildWarm(c, master); break;
      case "calm": layer = this.buildCalm(c, master); break;
      case "neon": layer = this.buildNeon(c, master); break;
      case "wind": layer = this.buildWind(c, master); break;
      default: return;
    }

    const { muted, volume } = useAudioStore.getState();
    const target = muted ? 0 : volume * 0.42;
    layer.gainNode.gain.setValueAtTime(0, c.currentTime);
    layer.gainNode.gain.setTargetAtTime(target, c.currentTime, 1.8);
    this.currentLayer = layer;
  }

  // ── Public API ───────────────────────────────────────────────

  setAmbient(type: AmbientType): void {
    this.pendingType = type;
    const c = this.ensureCtx();
    if (!c) return;
    if (c.state === "suspended") {
      c.resume().then(() => this.applyPending()).catch(() => {});
    } else {
      this.applyPending();
    }
  }

  updateVolume(): void {
    if (!this.currentLayer || !this.ctx) return;
    const { muted, volume } = useAudioStore.getState();
    const target = muted ? 0 : volume * 0.42;
    this.currentLayer.gainNode.gain.setTargetAtTime(target, this.ctx.currentTime, 0.3);
  }

  stop(): void {
    if (!this.currentLayer || !this.ctx) return;
    const layer = this.currentLayer;
    this.currentLayer = null;
    this.currentType = "none";
    this.pendingType = "none";
    layer.gainNode.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
    setTimeout(() => {
      layer.sources.forEach((s) => {
        try {
          (s as OscillatorNode | AudioBufferSourceNode).stop();
        } catch {}
      });
      layer.gainNode.disconnect();
    }, 2500);
  }
}

export const ambientEngine = new AmbientEngine();
