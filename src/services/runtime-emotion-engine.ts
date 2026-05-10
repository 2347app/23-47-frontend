// ============================================================
// 23:47 — Runtime Emotion Engine
// Translates RoomDNA into visual + audio parameters.
// DNA → EmotionalProfile → living room atmosphere.
// ============================================================

import type { AmbientType } from "../audio/ambientEngine";
import type { RoomDNA } from "../store/room-dna.store";

export interface EmotionalProfile {
  // Lighting
  brightness:        number;   // 0.55–1.10 CSS brightness
  glowColor:         string;   // radial glow rgba
  glowIntensity:     number;   // 0–1 modulates glow opacity
  warmthOverlay:     string;   // breathing tint color
  // Motion
  breathingSpeed:    number;   // seconds per full breath cycle
  breathingDepth:    number;   // 0–1 oscillation magnitude
  // Audio
  ambientType:       AmbientType;
  audioVolumeMod:    number;   // multiplier applied to master volume
  // Visual density
  vignetteStrength:  number;   // 0.45–0.90
  noiseLevel:        number;   // CRT grain opacity
  // Whispers
  whisperIntervalMs: number;   // ms between ambient memory whispers
}

export function calculateEmotionalProfile(dna: RoomDNA): EmotionalProfile {
  const {
    nightProfile,
    emotionalTemperature: temp,
    socialEnergy,
    comfortStyle,
    emotionalDensity,
    internetCulture,
    musicIdentity,
  } = dna;

  // ── Brightness ──────────────────────────────────────────────
  let brightness = 0.82;
  if      (nightProfile === "nocturnal")  brightness -= 0.18;
  else if (nightProfile === "late_night") brightness -= 0.10;
  else if (nightProfile === "day_person") brightness += 0.08;
  if (temp === "cold") brightness -= 0.08;
  if (temp === "hot")  brightness += 0.10;
  brightness = Math.max(0.55, Math.min(1.10, brightness));

  // ── Glow color ───────────────────────────────────────────────
  let glowColor = "rgba(40, 60, 200, 0.16)";
  if      (temp === "hot")                          glowColor = "rgba(210, 80, 20, 0.20)";
  else if (temp === "warm")                         glowColor = "rgba(200, 120, 40, 0.18)";
  else if (temp === "cold")                         glowColor = "rgba(20, 60, 220, 0.24)";
  else if (comfortStyle === "warm_chaotic")         glowColor = "rgba(190, 100, 30, 0.18)";
  if (musicIdentity.includes("flamenco") || musicIdentity.includes("reggaeton")) {
    glowColor = "rgba(210, 140, 20, 0.20)";
  }

  // ── Glow intensity ───────────────────────────────────────────
  let glowIntensity = 0.50;
  if (nightProfile === "nocturnal" || nightProfile === "late_night") glowIntensity = 0.80;
  if (socialEnergy === "isolated")    glowIntensity = Math.min(1.0, glowIntensity + 0.20);
  if (emotionalDensity === "low")     glowIntensity = Math.max(0.25, glowIntensity - 0.20);

  // ── Warmth overlay (breathing tint) ─────────────────────────
  let warmthOverlay = "rgba(80, 80, 180, 1)";
  if (temp === "warm" || temp === "hot") warmthOverlay = "rgba(180, 100, 30, 1)";
  else if (temp === "cold")              warmthOverlay = "rgba(20, 40, 180, 1)";

  // ── Breathing ────────────────────────────────────────────────
  let breathingSpeed = 14;
  let breathingDepth = 0.40;
  if      (nightProfile === "nocturnal")  { breathingSpeed = 20; breathingDepth = 0.60; }
  else if (nightProfile === "late_night") { breathingSpeed = 16; breathingDepth = 0.52; }
  else if (nightProfile === "day_person") { breathingSpeed = 10; breathingDepth = 0.28; }
  if (emotionalDensity === "high") breathingDepth = Math.min(0.72, breathingDepth + 0.18);
  if (emotionalDensity === "low")  breathingDepth = Math.max(0.18, breathingDepth - 0.12);

  // ── Ambient sound type ───────────────────────────────────────
  let ambientType: AmbientType = "crt";
  if      (nightProfile === "nocturnal"  && temp === "cold")              ambientType = "rain";
  else if (nightProfile === "late_night" && socialEnergy === "isolated")  ambientType = "rain";
  else if (temp === "warm" || temp === "hot")                             ambientType = "warm";
  else if (socialEnergy === "social" || socialEnergy === "medium_high")   ambientType = "calm";
  else if (comfortStyle === "chaotic" || emotionalDensity === "high")     ambientType = "neon";
  else if (nightProfile === "evening")                                     ambientType = "calm";
  if (musicIdentity.includes("flamenco")) ambientType = "warm";
  if (internetCulture === "emule" || internetCulture === "p2p_music")    ambientType = "crt";

  // ── Audio volume mod ─────────────────────────────────────────
  let audioVolumeMod = 0.75;
  if (socialEnergy === "isolated")   audioVolumeMod = 0.52;
  if (nightProfile === "nocturnal")  audioVolumeMod = Math.min(audioVolumeMod, 0.45);
  if (temp === "hot")                audioVolumeMod = 0.90;

  // ── Vignette ─────────────────────────────────────────────────
  let vignetteStrength = 0.65;
  if      (nightProfile === "nocturnal")  vignetteStrength = 0.88;
  else if (nightProfile === "late_night") vignetteStrength = 0.78;
  else if (temp === "warm" && socialEnergy !== "isolated") vignetteStrength = 0.50;

  // ── CRT grain ────────────────────────────────────────────────
  let noiseLevel = 0.045;
  if (emotionalDensity === "high") noiseLevel = 0.075;
  else if (emotionalDensity === "low")  noiseLevel = 0.022;

  // ── Whisper interval ─────────────────────────────────────────
  let whisperIntervalMs = 150_000; // 2.5 min
  if (socialEnergy === "isolated")   whisperIntervalMs = 120_000; // 2 min
  if (nightProfile === "nocturnal")  whisperIntervalMs = 90_000;  // 1.5 min
  if (emotionalDensity === "low")    whisperIntervalMs = 210_000; // 3.5 min

  return {
    brightness,
    glowColor,
    glowIntensity,
    warmthOverlay,
    breathingSpeed,
    breathingDepth,
    ambientType,
    audioVolumeMod,
    vignetteStrength,
    noiseLevel,
    whisperIntervalMs,
  };
}

// ── Whisper pools by internet culture / musical identity ─────────────────

const WHISPERS: Record<string, string[]> = {
  msn_messenger: [
    "Todavía quedaban contactos conectados.",
    "El sonido de alguien que se conecta a las 2am.",
    "¿Qué ponías en el nick aquella semana?",
    "Esa canción que ponías en el estado personal.",
  ],
  tuenti: [
    "Un muro lleno de cosas que ya no están.",
    "Cuántas fotos con flash en la cara.",
    "Esperabas ese evento del fin de semana con todo.",
  ],
  fotolog: [
    "Los comentarios que esperabas con el aliento contenido.",
    "Una foto de perfil que ya no existe en ningún servidor.",
  ],
  emule: [
    "Descargando algo que tardará tres días.",
    "Una conexión de 256k como cordón umbilical al mundo.",
    "Esa canción que tardó 48 horas en llegar.",
  ],
  habbo_hotel: [
    "Un avatar con muebles que le costaron mucho conseguir.",
    "Monedas que valían horas de vida real.",
  ],
  linkin_park: [
    "Hybrid Theory en bucle cuando nadie miraba.",
    "Eso que escuchabas con el volumen bajo.",
  ],
  my_chemical_romance: [
    "Emo antes de que existiera esa palabra.",
    "La letra que sabías de memoria aunque no la entendieras.",
  ],
  ps2: [
    "El ventilador del PS2 como ruido de fondo del hogar.",
    "Partidas guardadas que ya no existen en ningún sitio.",
    "La Memory Card. Todo en la Memory Card.",
  ],
  counter_strike: [
    "El sonido del disparo con el que empezaba cada noche.",
    "Esa partida que duró hasta las 4am.",
  ],
  winamp: [
    "Una skin de Winamp que tardaste horas en encontrar.",
    "La visualización que ponías como fondo de pantalla.",
  ],
  default: [
    "Alguien vivió aquí intensamente.",
    "El tiempo aquí se movía diferente.",
    "Todo esto existió de verdad.",
    "Esa habitación te conocía mejor que nadie.",
    "Aquí eras el único espectador.",
    "Quedan cosas sin resolver en esta habitación.",
  ],
};

export function getWhisperPool(dna: RoomDNA): string[] {
  const culturePool = WHISPERS[dna.internetCulture] ?? [];
  const musicKey = Object.keys(WHISPERS).find(
    (k) => k !== "default" && dna.musicIdentity.toLowerCase().includes(k.replace(/_/g, " "))
  );
  const musicPool = musicKey ? (WHISPERS[musicKey] ?? []) : [];
  const combined = [...culturePool, ...musicPool, ...(WHISPERS.default ?? [])];
  // Deduplicate
  return [...new Set(combined)].slice(0, 10);
}
