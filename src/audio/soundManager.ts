// =====================================================
// Sound Manager — sintetiza sonidos retro de forma procedural
// con WebAudio (sin assets binarios). Howler-style API.
// =====================================================

import { useAudioStore } from "../store/audio.store";

let ctx: AudioContext | null = null;

function ensureCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      const Ctor = window.AudioContext ?? (window as any).webkitAudioContext;
      ctx = new Ctor();
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => undefined);
  }
  return ctx;
}

function envelope(node: GainNode, time: number, attack: number, peak: number, release: number): void {
  node.gain.setValueAtTime(0, time);
  node.gain.linearRampToValueAtTime(peak, time + attack);
  node.gain.exponentialRampToValueAtTime(0.0001, time + attack + release);
}

interface ToneOptions {
  freq: number;
  duration: number;
  type?: OscillatorType;
  attack?: number;
  release?: number;
  peak?: number;
  detune?: number;
  delay?: number;
}

function tone(opts: ToneOptions): void {
  const c = ensureCtx();
  if (!c) return;
  const { muted, volume } = useAudioStore.getState();
  if (muted) return;
  const t0 = c.currentTime + (opts.delay ?? 0);
  const osc = c.createOscillator();
  const gain = c.createGain();
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 4200;

  osc.type = opts.type ?? "sine";
  osc.frequency.value = opts.freq;
  if (opts.detune) osc.detune.value = opts.detune;
  envelope(gain, t0, opts.attack ?? 0.005, (opts.peak ?? 0.18) * volume, opts.release ?? opts.duration);
  osc.connect(filter).connect(gain).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + (opts.attack ?? 0.005) + (opts.release ?? opts.duration) + 0.05);
}

function noiseBurst(duration = 0.25, peak = 0.08): void {
  const c = ensureCtx();
  if (!c) return;
  const { muted, volume } = useAudioStore.getState();
  if (muted) return;
  const buffer = c.createBuffer(1, c.sampleRate * duration, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = c.createBufferSource();
  src.buffer = buffer;
  const gain = c.createGain();
  gain.gain.value = peak * volume;
  const filter = c.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 800;
  src.connect(filter).connect(gain).connect(c.destination);
  src.start();
}

export const SFX = {
  /** Sonido al iniciar sesión, suave campana doble. */
  login: () => {
    tone({ freq: 660, duration: 0.45, type: "sine", peak: 0.14, release: 0.45 });
    tone({ freq: 880, duration: 0.6, type: "sine", peak: 0.12, release: 0.6, delay: 0.18 });
  },
  /** Mensaje entrante. */
  message: () => {
    tone({ freq: 740, duration: 0.18, type: "triangle", peak: 0.14, release: 0.2 });
    tone({ freq: 988, duration: 0.22, type: "triangle", peak: 0.1, release: 0.22, delay: 0.06 });
  },
  /** Mensaje enviado. */
  send: () => {
    tone({ freq: 520, duration: 0.1, type: "sine", peak: 0.08, release: 0.1 });
  },
  /** Zumbido (nudge). */
  nudge: () => {
    tone({ freq: 180, duration: 0.6, type: "sawtooth", peak: 0.18, release: 0.6 });
    tone({ freq: 90, duration: 0.6, type: "sawtooth", peak: 0.18, release: 0.6, delay: 0.05 });
    noiseBurst(0.4, 0.07);
  },
  /** Amigo se conecta. */
  online: () => {
    tone({ freq: 880, duration: 0.18, type: "sine", peak: 0.1, release: 0.2 });
    tone({ freq: 1175, duration: 0.18, type: "sine", peak: 0.08, release: 0.2, delay: 0.08 });
  },
  /** Amigo se desconecta. */
  offline: () => {
    tone({ freq: 660, duration: 0.18, type: "sine", peak: 0.08, release: 0.2 });
    tone({ freq: 440, duration: 0.22, type: "sine", peak: 0.07, release: 0.24, delay: 0.06 });
  },
  /** Hover ligero. */
  hover: () => {
    tone({ freq: 1500, duration: 0.04, type: "sine", peak: 0.04, release: 0.05 });
  },
  /** Cambio de época. */
  era: () => {
    tone({ freq: 320, duration: 0.5, type: "sine", peak: 0.1, release: 0.5 });
    tone({ freq: 480, duration: 0.6, type: "sine", peak: 0.1, release: 0.6, delay: 0.12 });
    tone({ freq: 720, duration: 0.7, type: "sine", peak: 0.08, release: 0.7, delay: 0.24 });
  },
  /** Modem dial-up corto y simbólico. */
  modem: () => {
    [400, 720, 980, 540, 1180, 720].forEach((f, i) =>
      tone({ freq: f, duration: 0.18, type: "square", peak: 0.05, release: 0.18, delay: i * 0.13 })
    );
    noiseBurst(1.2, 0.04);
  },
};
