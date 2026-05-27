// ============================================================
// 23:47 — Memory Question Engine
// Adaptive emotional questioning system.
// Detects saturation. Avoids repetition.
// Builds a rich memory profile from minimal input.
// The experience should feel like remembering, not filling a form.
// ============================================================

// ── Types ────────────────────────────────────────────────────────────────────

export type QuestionType =
  | "year" | "ownership" | "bed_type" | "room_feel" | "walls"
  | "night_presence" | "computer_central" | "background_sound"
  | "social_energy" | "external_sounds" | "memory_objects";

export type QuestionLayer = 1 | 3;

export interface MemoryQuestion {
  id:         string;
  layer:      QuestionLayer;
  text:       string;
  sub?:       string;
  type:       QuestionType;
  weight:     number;             // contribution to emotional density (0–1)
  condition?: (p: MemoryProfile) => boolean;
}

export interface MemoryProfile {
  year?:               number;
  ownership?:          string;
  bedType?:            string;
  roomFeel?:           string;
  wallColorLabel?:     string;
  wallColor?:          string;
  lightFrom?:          string;
  alwaysOn:            string[];
  music?:              string;
  nightlyPresence:     string[];
  computerCentral?:    string;
  backgroundSound?:    string;
  waitedForMessenger?: boolean;
  externalSounds:      string[];
  memoryObjects:       string[];
  placed:              PlacedItem[];
}

export interface PlacedItem {
  id:    string;
  emoji: string;
  label: string;
  zone:  string;
}

// ── Question database ─────────────────────────────────────────────────────────

export const ALL_QUESTIONS: MemoryQuestion[] = [
  // ── Layer 1: Identity of the space ──────────────────────────────────────────
  {
    id: "year", layer: 1, type: "year", weight: 0.18,
    text: "¿Cuándo fue?",
    sub:  "No hace falta el año exacto.",
  },
  {
    id: "ownership", layer: 1, type: "ownership", weight: 0.10,
    text: "¿La habitación era solo tuya?",
    sub:  "La energía del espacio cambia mucho según eso.",
  },
  {
    id: "room_feel", layer: 1, type: "room_feel", weight: 0.14,
    text: "¿Cómo se sentía el cuarto?",
    sub:  "No el tamaño real. La sensación.",
  },
  {
    id: "bed_type", layer: 1, type: "bed_type", weight: 0.09,
    text: "¿Cómo era la cama?",
    sub:  "La cama define el espacio más de lo que parece.",
  },
  {
    id: "walls", layer: 1, type: "walls", weight: 0.12,
    text: "¿Cómo eran las paredes?",
    sub:  "El color que tenías sin haberlo elegido.",
  },

  // ── Layer 3: Emotional presence ──────────────────────────────────────────────
  {
    id: "night_presence", layer: 3, type: "night_presence", weight: 0.18,
    text: "¿Qué solía quedarse encendido por la noche?",
    sub:  "Lo que hacía que no estuviera del todo oscura.",
  },
  {
    id: "computer_central", layer: 3, type: "computer_central", weight: 0.14,
    condition: (p) => p.alwaysOn.includes("pc") || p.alwaysOn.includes("msn"),
    text: "¿El ordenador era el centro de todo?",
    sub:  "Si lo apagabas, ¿qué quedaba?",
  },
  {
    id: "background_sound", layer: 3, type: "background_sound", weight: 0.13,
    text: "¿Qué sonaba cuando estabas solo?",
    sub:  "",
  },
  {
    id: "social_energy", layer: 3, type: "social_energy", weight: 0.10,
    condition: (p) =>
      p.alwaysOn.includes("msn") ||
      p.nightlyPresence.includes("messenger") ||
      (p.year != null && p.year >= 2002 && p.year <= 2010),
    text: "¿Esperabas que alguien se conectara?",
    sub:  "El Messenger, el ICQ, el Fotolog…",
  },
  {
    id: "external_sounds", layer: 3, type: "external_sounds", weight: 0.09,
    text: "¿Qué se escuchaba desde fuera?",
    sub:  "Lo que entraba aunque no quisieras.",
  },
  // Nota: la pregunta de memory_objects se gestiona en el paso dedicado `objects`
  // mediante el MemoryObjectsPicker. No se incluye aquí para no duplicarla.
];

// ── Saturation thresholds ─────────────────────────────────────────────────────

const L1_THRESHOLD = 0.45; // density needed in layer 1 to proceed to placement
const L3_THRESHOLD = 0.72; // density needed overall to stop questioning

// ── Core query functions ──────────────────────────────────────────────────────

function isAnswered(id: string, p: MemoryProfile): boolean {
  switch (id) {
    case "year":              return p.year != null;
    case "ownership":         return p.ownership != null;
    case "bed_type":          return p.bedType != null;
    case "room_feel":         return p.roomFeel != null;
    case "walls":             return p.wallColorLabel != null;
    case "night_presence":    return p.nightlyPresence.length > 0;
    case "computer_central":  return p.computerCentral != null;
    case "background_sound":  return p.backgroundSound != null;
    case "social_energy":     return p.waitedForMessenger != null;
    case "external_sounds":   return p.externalSounds.length > 0;
    case "memory_objects":    return p.memoryObjects.length > 0;
    default:                  return false;
  }
}

export function computeDensity(profile: MemoryProfile): number {
  return Math.min(1, ALL_QUESTIONS.reduce((acc, q) => {
    return acc + (isAnswered(q.id, profile) ? q.weight : 0);
  }, 0));
}

export function computeLayerDensity(profile: MemoryProfile, layer: QuestionLayer): number {
  const layerQs = ALL_QUESTIONS.filter((q) => q.layer === layer);
  const total   = layerQs.reduce((a, q) => a + q.weight, 0);
  const scored  = layerQs.reduce((a, q) => a + (isAnswered(q.id, profile) ? q.weight : 0), 0);
  return total > 0 ? scored / total : 0;
}

export function isL1Saturated(profile: MemoryProfile): boolean {
  return computeLayerDensity(profile, 1) >= L1_THRESHOLD;
}

export function isFullySaturated(profile: MemoryProfile): boolean {
  return computeDensity(profile) >= L3_THRESHOLD;
}

export function selectNextQuestion(
  profile: MemoryProfile,
  asked:   string[],
  layer:   QuestionLayer,
): MemoryQuestion | null {
  const candidates = ALL_QUESTIONS.filter((q) => {
    if (q.layer !== layer)              return false;
    if (asked.includes(q.id))           return false;
    if (isAnswered(q.id, profile))      return false;
    if (q.condition && !q.condition(profile)) return false;
    return true;
  });

  if (candidates.length === 0) return null;
  return candidates.sort((a, b) => b.weight - a.weight)[0];
}

// ── Real-time atmosphere inference ───────────────────────────────────────────

export interface AtmosphereReaction {
  glowColor:    string;   // CSS rgba for the radial gradient tint
  breathSpeed:  number;   // seconds per breath cycle
  breathDepth:  number;   // glow amplitude 0–1
  label:        string;   // short poetic description
}

export function inferAtmosphere(p: MemoryProfile): AtmosphereReaction {
  const hasMsn  = p.alwaysOn.includes("msn") || p.nightlyPresence.includes("messenger");
  const hasFan  = p.alwaysOn.includes("fan") || p.nightlyPresence.includes("fan");
  const hasTV   = p.alwaysOn.includes("tv")  || p.nightlyPresence.includes("tv");
  const hasPC   = p.alwaysOn.includes("pc");
  const onlyScreen = p.computerCentral === "si" || (hasPC && !hasMsn && !hasFan && !hasTV);
  const isSummer   = p.externalSounds.includes("pájaros") || p.externalSounds.includes("verano") || hasFan;

  if (hasMsn && hasFan && isSummer) return {
    glowColor:   "rgba(70, 140, 255, 0.10)",
    breathSpeed:  10,
    breathDepth:  0.50,
    label:        "Noche de verano con Messenger",
  };
  if (hasMsn && hasFan) return {
    glowColor:   "rgba(80, 155, 255, 0.09)",
    breathSpeed:  11,
    breathDepth:  0.46,
    label:        "Pantalla azul, ventilador de fondo",
  };
  if (hasMsn) return {
    glowColor:   "rgba(55, 120, 255, 0.08)",
    breathSpeed:  14,
    breathDepth:  0.40,
    label:        "Pantalla verde en la oscuridad",
  };
  if (hasFan && isSummer) return {
    glowColor:   "rgba(255, 195, 80, 0.08)",
    breathSpeed:   9,
    breathDepth:  0.52,
    label:        "Verano. El ventilador siempre sonando.",
  };
  if (hasTV) return {
    glowColor:   "rgba(200, 165, 90, 0.07)",
    breathSpeed:  16,
    breathDepth:  0.30,
    label:        "La tele de fondo",
  };
  if (onlyScreen) return {
    glowColor:   "rgba(28, 75, 140, 0.07)",
    breathSpeed:  20,
    breathDepth:  0.26,
    label:        "Solo la pantalla",
  };
  return {
    glowColor:   "rgba(30, 40, 82, 0.08)",
    breathSpeed:  18,
    breathDepth:  0.35,
    label:        "",
  };
}

// ── Description builder (feeds the DALL-E pipeline) ─────────────────────────

const FEEL_LABELS: Record<string, string> = {
  pequeño_acogedor:   "cuarto pequeño y acogedor",
  pequeño_agobiante:  "cuarto pequeño, algo agobiante",
  amplio_vacio:       "cuarto amplio que parecía vacío",
  normal:             "cuarto de tamaño normal",
  lleno:              "cuarto lleno de cosas",
};
const BED_LABELS: Record<string, string> = {
  individual: "cama individual",
  matrimonio: "cama de matrimonio",
  litera:     "litera",
  sofa_cama:  "sofá cama",
  colchon:    "colchón en el suelo",
};
const OWN_LABELS: Record<string, string> = {
  solo:       "habitación propia",
  compartida: "habitación compartida",
  a_veces:    "habitación a veces compartida",
  familiar:   "cuarto de uso familiar",
};
const LIGHT_LABELS: Record<string, string> = {
  izquierda:     "ventana a la izquierda, luz natural entrando sesgada",
  derecha:       "ventana a la derecha, luz de tarde",
  "detrás":      "ventana detrás del escritorio",
  tenue:         "poca luz natural, habitación algo oscura",
  solo_pantalla: "habitación oscura iluminada solo por la pantalla",
};
const NIGHT_LABELS: Record<string, string> = {
  messenger: "Messenger encendido",
  tv:        "televisor",
  winamp:    "Winamp con música",
  fan:       "ventilador oscilando",
  radio:     "radio",
  lamp:      "lámpara pequeña",
  nada:      "todo apagado",
};

export function buildDescription(profile: MemoryProfile, placed: PlacedItem[]): string {
  const parts: string[] = [];

  if (profile.wallColorLabel) parts.push(`paredes ${profile.wallColorLabel}`);
  if (profile.year)           parts.push(`año ${profile.year}`);
  if (profile.roomFeel)       parts.push(FEEL_LABELS[profile.roomFeel] ?? profile.roomFeel);
  if (profile.bedType)        parts.push(BED_LABELS[profile.bedType]   ?? profile.bedType);
  if (profile.ownership)      parts.push(OWN_LABELS[profile.ownership] ?? profile.ownership);
  if (profile.lightFrom)      parts.push(LIGHT_LABELS[profile.lightFrom] ?? "ventana");

  if (profile.alwaysOn.includes("pc"))       parts.push("ordenador encendido");
  if (profile.alwaysOn.includes("msn"))      parts.push("Messenger abierto");
  if (profile.alwaysOn.includes("fan"))      parts.push("ventilador blanco oscilante");
  if (profile.alwaysOn.includes("tv"))       parts.push("televisor encendido");
  if (profile.alwaysOn.includes("console"))  parts.push("consola de videojuegos");

  if (profile.nightlyPresence.length > 0) {
    const desc = profile.nightlyPresence
      .map((n) => NIGHT_LABELS[n])
      .filter(Boolean)
      .join(", ");
    if (desc) parts.push(`de noche quedaba: ${desc}`);
  }

  if (placed.length > 0) {
    const spatial = placed
      .map((p) => `${p.label} en ${p.zone.replace("-", " ")}`)
      .join(", ");
    parts.push(spatial);
  }

  if (profile.backgroundSound)          parts.push(`música de fondo: ${profile.backgroundSound}`);
  if (profile.externalSounds.length > 0) parts.push(`desde fuera: ${profile.externalSounds.join(", ")}`);
  if (profile.memoryObjects.length > 0)  parts.push(`objetos: ${profile.memoryObjects.join(", ")}`);

  return parts.join(", ");
}
