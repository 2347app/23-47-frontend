// ============================================================
// 23:47 — Memory Reconstruction Flow Engine
// NOT a room configurator. A guided autobiographical memory experience.
// The user remembers. The space emerges.
// ============================================================

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useRoomBreathing } from "../hooks/useRoomBreathing";

// ── Types ────────────────────────────────────────────────────────────────────

type Step = "entry" | "question" | "placement" | "snapshot" | "generating" | "reveal";

interface MemoryData {
  year?:           number;
  lightFrom?:      "izquierda" | "derecha" | "detrás" | "tenue" | "solo_pantalla";
  wallColor?:      string;
  wallColorLabel?: string;
  alwaysOn:        string[];
  music?:          string;
  placed:          PlacedItem[];
  freeNotes?:      string;
}

interface PlacedItem {
  id:    string;
  emoji: string;
  label: string;
  zone:  RoomZone;
}

type RoomZone =
  | "top-left" | "top-center" | "top-right"
  | "mid-left" | "mid-center" | "mid-right"
  | "bot-left" | "bot-center" | "bot-right";

// ── Questions ─────────────────────────────────────────────────────────────────

const QUESTIONS = [
  {
    id: "year",
    text: "¿Cuándo fue?",
    sub: "No hace falta recordar el año exacto.",
    type: "year",
  },
  {
    id: "light",
    text: "¿Por dónde entraba la luz?",
    sub: "Cierra los ojos un momento.",
    type: "light",
  },
  {
    id: "walls",
    text: "¿Cómo eran las paredes?",
    sub: "El color que tenías sin haberlo elegido.",
    type: "walls",
  },
  {
    id: "objects",
    text: "¿Qué siempre estaba encendido?",
    sub: "Lo que siempre hacía ruido o luz.",
    type: "objects",
  },
  {
    id: "music",
    text: "¿Qué sonaba de fondo?",
    sub: "O el silencio si era silencio.",
    type: "music",
  },
] as const;

// ── Memory snapshots triggered by user choices ────────────────────────────────

const SNAPSHOTS: Record<string, string> = {
  year_2000:   "En el 2000 todo parecía nuevo y lleno de promesas.",
  year_2005:   "Esos años en que el internet era todavía una aventura.",
  year_2010:   "2010. Las últimas tardes analógicas antes de que todo cambiara.",
  light_izq:   "La luz entraba sesgada por las mañanas, dejando una raya en el suelo.",
  light_der:   "Por las tardes, la habitación se llenaba de ese naranja que no se puede fotografiar.",
  light_pan:   "La pantalla era la única luz. El resto del cuarto desaparecía.",
  walls_azul:  "Ese azul no lo elegiste tú. Simplemente era el que había.",
  walls_blanc: "Blanco. Limpio. Y a veces un poco frío en invierno.",
  obj_pc:      "El ordenador siempre encendido. El ventilador siempre sonando.",
  obj_msn:     "Messenger. El sonido de la campanita. La pantalla verde.",
  music_fondo: "La música no era para escucharla. Era para que el silencio no fuera silencio.",
};

// ── Placeable room objects ─────────────────────────────────────────────────────

const ROOM_ITEMS = [
  { id: "window",   emoji: "🪟", label: "Ventana"    },
  { id: "bed",      emoji: "🛏",  label: "Cama"       },
  { id: "desk",     emoji: "🗄",  label: "Escritorio" },
  { id: "computer", emoji: "🖥",  label: "Ordenador"  },
  { id: "door",     emoji: "🚪",  label: "Puerta"     },
  { id: "tv",       emoji: "📺",  label: "Tele"       },
];

const ROOM_ZONES: RoomZone[] = [
  "top-left", "top-center", "top-right",
  "mid-left", "mid-center", "mid-right",
  "bot-left", "bot-center", "bot-right",
];

const BACK_ZONES:  RoomZone[] = ["top-left", "top-center", "top-right"];
const FLOOR_ZONES: RoomZone[] = ["mid-left", "mid-center", "mid-right", "bot-left", "bot-center", "bot-right"];

const ZONE_LABELS: Record<RoomZone, string> = {
  "top-left": "esquina izquierda del fondo",
  "top-center": "fondo",
  "top-right": "esquina derecha del fondo",
  "mid-left": "izquierda",
  "mid-center": "centro",
  "mid-right": "derecha",
  "bot-left": "esquina izquierda cerca de la puerta",
  "bot-center": "entrada",
  "bot-right": "esquina derecha cerca de la puerta",
};

// ── Atmosphere inference ──────────────────────────────────────────────────────

function inferDescription(memory: MemoryData): string {
  const parts: string[] = [];

  if (memory.wallColor)   parts.push(`paredes ${memory.wallColorLabel ?? memory.wallColor}`);
  if (memory.year)        parts.push(`año ${memory.year}`);
  if (memory.lightFrom) {
    const lightMap: Record<string, string> = {
      izquierda:    "ventana a la izquierda que dejaba entrar luz natural",
      derecha:      "ventana a la derecha con luz de tarde",
      "detrás":     "ventana detrás del escritorio, luz desde atrás",
      tenue:        "habitación con poca luz natural",
      solo_pantalla: "habitación oscura iluminada solo por la pantalla del ordenador",
    };
    parts.push(lightMap[memory.lightFrom] ?? "ventana");
  }

  const deskPlaced = memory.placed.find((p) => p.id === "desk");
  const pcPlaced   = memory.placed.find((p) => p.id === "computer");
  const bedPlaced  = memory.placed.find((p) => p.id === "bed");

  if (deskPlaced) parts.push(`escritorio en ${ZONE_LABELS[deskPlaced.zone]}`);
  if (pcPlaced)   parts.push(`ordenador en ${ZONE_LABELS[pcPlaced.zone]}`);
  if (bedPlaced)  parts.push(`cama en ${ZONE_LABELS[bedPlaced.zone]}`);

  if (memory.alwaysOn.includes("pc"))        parts.push("ordenador encendido");
  if (memory.alwaysOn.includes("msn"))       parts.push("Messenger abierto");
  if (memory.alwaysOn.includes("tv"))        parts.push("televisor");
  if (memory.alwaysOn.includes("fan"))       parts.push("ventilador blanco encendido");
  if (memory.alwaysOn.includes("console"))   parts.push("consola de videojuegos");

  if (memory.music && memory.music.trim()) {
    parts.push(`música de fondo: ${memory.music.trim()}`);
  }

  return parts.join(", ");
}

// ── Transition config ─────────────────────────────────────────────────────────

const fadeIn = {
  initial:   { opacity: 0, y: 8 },
  animate:   { opacity: 1, y: 0 },
  exit:      { opacity: 0, y: -8 },
  transition: { duration: 0.7, ease: "easeOut" },
};

const slowFade = {
  initial:   { opacity: 0 },
  animate:   { opacity: 1 },
  exit:      { opacity: 0 },
  transition: { duration: 1.2, ease: "easeInOut" },
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export function MemoryReconstructionPage() {
  const navigate   = useNavigate();
  const [step, setStep]         = useState<Step>("entry");
  const [qIndex, setQIndex]     = useState(0);
  const [memory, setMemory]     = useState<MemoryData>({ alwaysOn: [], placed: [] });
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [pickedItem, setPickedItem] = useState<typeof ROOM_ITEMS[number] | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const breathValue = useRoomBreathing(18, 0.35);
  const snapshotTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showSnapshot = useCallback((text: string) => {
    setSnapshot(text);
    if (snapshotTimer.current) clearTimeout(snapshotTimer.current);
    snapshotTimer.current = setTimeout(() => setSnapshot(null), 4000);
  }, []);

  const advanceQuestion = useCallback((updatedMemory: MemoryData) => {
    if (qIndex < QUESTIONS.length - 1) {
      setQIndex((i) => i + 1);
    } else {
      setStep("placement");
    }
    setMemory(updatedMemory);
  }, [qIndex]);

  const generate = useCallback(async () => {
    setStep("generating");
    const description = inferDescription(memory);
    try {
      const { data } = await api.post(
        "/ai/room/reconstruct",
        { input: description, apply: true, forceImage: true },
        { timeout: 90000 },
      );
      setImageUrl(data.imageUrl ?? data.room?.background ?? null);
      setStep("reveal");
      setTimeout(() => setRevealed(true), 300);
    } catch {
      setStep("placement");
    }
  }, [memory]);

  // ── ENTRY ───────────────────────────────────────────────────────────────────

  if (step === "entry") {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
        style={{ background: "#050508" }}>
        <BreathingRoom breathValue={breathValue} />
        <motion.div
          className="relative z-10 flex flex-col items-center gap-8 px-6 text-center"
          {...slowFade}
        >
          <p className="text-xs tracking-[0.3em] text-white/25 uppercase">23:47</p>
          <h1
            className="font-light leading-snug text-white/70"
            style={{ fontSize: "clamp(1.4rem, 5vw, 2.2rem)" }}
          >
            Vamos a reconstruir<br />tu habitación.
          </h1>
          <p className="max-w-xs text-sm text-white/30 leading-relaxed">
            No hace falta recordarlo todo.<br />
            El espacio volverá solo.
          </p>
          <motion.button
            className="mt-4 rounded-full border border-white/10 px-8 py-3 text-sm text-white/50
                       transition-colors hover:border-white/25 hover:text-white/75"
            onClick={() => setStep("question")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
          >
            Empezar a recordar
          </motion.button>
          <motion.button
            className="text-xs text-white/20 hover:text-white/40 transition-colors"
            onClick={() => navigate("/app/room")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.6 }}
          >
            volver
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // ── QUESTIONS ───────────────────────────────────────────────────────────────

  if (step === "question") {
    const q = QUESTIONS[qIndex];
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden px-6"
        style={{ background: "#050508" }}>
        <BreathingRoom breathValue={breathValue} dim />
        <SnapshotOverlay text={snapshot} />
        <div className="relative z-10 w-full max-w-md">
          <AnimatePresence mode="wait">
            <motion.div key={q.id} {...fadeIn} className="flex flex-col gap-6">
              <div className="mb-2">
                <p className="text-xs text-white/25 tracking-widest uppercase mb-3">
                  {qIndex + 1} / {QUESTIONS.length}
                </p>
                <h2 className="text-2xl font-light text-white/80 leading-snug">{q.text}</h2>
                <p className="mt-1 text-sm text-white/30 italic">{q.sub}</p>
              </div>

              <QuestionInput
                question={q as typeof QUESTIONS[number]}
                memory={memory}
                onAnswer={(updated, snapKey) => {
                  if (snapKey && SNAPSHOTS[snapKey]) showSnapshot(SNAPSHOTS[snapKey]);
                  advanceQuestion(updated);
                }}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ── PLACEMENT ───────────────────────────────────────────────────────────────

  if (step === "placement") {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-between overflow-hidden py-8 px-4"
        style={{ background: "#050508" }}>
        <BreathingRoom breathValue={breathValue} dim />
        <SnapshotOverlay text={snapshot} />

        <motion.div {...fadeIn} className="relative z-10 text-center">
          <h2 className="text-xl font-light text-white/70">¿Cómo estaba distribuida?</h2>
          <p className="mt-1 text-sm text-white/30 italic">Toca una zona para colocar. Sin exactitud.</p>
        </motion.div>

        {/* Isometric 3D room */}
        <motion.div {...fadeIn} className="relative z-10 w-full max-w-sm">
          <IsometricRoom
            placed={memory.placed}
            pickedItem={pickedItem}
            onZoneClick={(zone) => {
              if (!pickedItem) return;
              const newPlaced = [
                ...memory.placed.filter((p) => p.id !== pickedItem.id && p.zone !== zone),
                { ...pickedItem, zone },
              ];
              setMemory((m) => ({ ...m, placed: newPlaced }));
              setPickedItem(null);
              if (pickedItem.id === "computer" && zone.includes("top")) {
                showSnapshot("La pantalla y la ventana en el mismo campo de visión. Eso define todo.");
              }
              if (pickedItem.id === "bed") {
                showSnapshot("La cama siempre en el mismo sitio. Desde ahí se veía todo.");
              }
            }}
          />
          <p className="mt-1 text-center text-xs text-white/20">
            {pickedItem ? (
              <span className="text-white/50">Toca donde lo recuerdas: {pickedItem.emoji} {pickedItem.label}</span>
            ) : (
              "Selecciona un objeto abajo y colócalo"
            )}
          </p>
        </motion.div>

        {/* Item picker */}
        <motion.div {...fadeIn} className="relative z-10 w-full max-w-sm">
          <div className="flex flex-wrap justify-center gap-2">
            {ROOM_ITEMS.filter((item) => !memory.placed.find((p) => p.id === item.id)).map((item) => (
              <button
                key={item.id}
                onClick={() => setPickedItem(pickedItem?.id === item.id ? null : item)}
                className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm
                           transition-all active:scale-95"
                style={{
                  borderColor: pickedItem?.id === item.id ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.12)",
                  color:       pickedItem?.id === item.id ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.35)",
                  background:  pickedItem?.id === item.id ? "rgba(255,255,255,0.08)" : "transparent",
                }}
              >
                <span>{item.emoji}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-6 flex justify-center gap-4">
            <button
              className="text-xs text-white/25 hover:text-white/50 transition-colors"
              onClick={generate}
            >
              {memory.placed.length === 0 ? "Saltar distribución →" : "Reconstruir →"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── GENERATING ──────────────────────────────────────────────────────────────

  if (step === "generating") {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center"
        style={{ background: "#050508" }}>
        <BreathingRoom breathValue={breathValue} />
        <motion.div {...slowFade} className="relative z-10 flex flex-col items-center gap-6 text-center px-6">
          <div
            className="rounded-full border border-white/10"
            style={{ width: 4, height: 4, background: "rgba(255,255,255,0.3)", animation: "pulse 2s infinite" }}
          />
          <p className="text-sm text-white/30 font-light">La habitación está volviendo.</p>
          <p className="text-xs text-white/15 italic">Un momento.</p>
        </motion.div>
      </div>
    );
  }

  // ── REVEAL ──────────────────────────────────────────────────────────────────

  if (step === "reveal") {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
        style={{ background: "#050508" }}>
        {imageUrl ? (
          <>
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0, filter: "blur(20px)" }}
              animate={{ opacity: revealed ? 1 : 0, filter: revealed ? "blur(0px)" : "blur(20px)" }}
              transition={{ duration: 2.4, ease: "easeOut" }}
            >
              <img
                src={imageUrl}
                className="h-full w-full object-cover"
                alt="Tu habitación"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%)",
                }}
              />
            </motion.div>
            <motion.div
              className="relative z-10 flex flex-col items-center gap-6 text-center px-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: revealed ? 1 : 0 }}
              transition={{ delay: 1.8, duration: 1.2 }}
            >
              <p className="text-sm font-light text-white/70 italic">Aquí era.</p>
              <button
                className="rounded-full border border-white/20 px-6 py-2 text-sm text-white/50
                           hover:border-white/40 hover:text-white/80 transition-colors"
                onClick={() => navigate("/app/room")}
              >
                Ir a mi habitación
              </button>
            </motion.div>
          </>
        ) : (
          <motion.div {...slowFade} className="relative z-10 text-center px-6">
            <p className="text-sm text-white/40">La habitación se ha guardado.</p>
            <button
              className="mt-6 text-xs text-white/25 hover:text-white/50"
              onClick={() => navigate("/app/room")}
            >
              Ver mi habitación →
            </button>
          </motion.div>
        )}
      </div>
    );
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

// ── Breathing empty room background ──────────────────────────────────────────

function BreathingRoom({ breathValue, dim }: { breathValue: number; dim?: boolean }) {
  return (
    <>
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 40%,
            rgba(30,40,80, ${(0.08 + breathValue * 0.06) * (dim ? 0.5 : 1)}) 0%,
            rgba(5,5,8,1) 70%)`,
          transition: "background 2s ease",
        }}
      />
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: "linear-gradient(180deg, transparent 55%, rgba(5,5,8,0.9) 100%)",
        }}
      />
    </>
  );
}

// ── Snapshot overlay ─────────────────────────────────────────────────────────

function SnapshotOverlay({ text }: { text: string | null }) {
  return (
    <AnimatePresence>
      {text && (
        <motion.div
          className="pointer-events-none fixed top-8 left-1/2 z-50 -translate-x-1/2 px-6"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-center text-sm italic text-white/35 max-w-xs leading-relaxed">
            {text}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Question input router ─────────────────────────────────────────────────────

type QuestionDef = typeof QUESTIONS[number];

function QuestionInput({
  question,
  memory,
  onAnswer,
}: {
  question:  QuestionDef;
  memory:    MemoryData;
  onAnswer:  (updated: MemoryData, snapKey?: string) => void;
}) {
  switch (question.type) {
    case "year":    return <YearQuestion    memory={memory} onAnswer={onAnswer} />;
    case "light":   return <LightQuestion   memory={memory} onAnswer={onAnswer} />;
    case "walls":   return <WallsQuestion   memory={memory} onAnswer={onAnswer} />;
    case "objects": return <ObjectsQuestion memory={memory} onAnswer={onAnswer} />;
    case "music":   return <MusicQuestion   memory={memory} onAnswer={onAnswer} />;
    default:        return null;
  }
}

// ── Year question ─────────────────────────────────────────────────────────────

const YEAR_OPTIONS = [
  { label: "Antes del 2000", year: 1998 },
  { label: "2000 – 2004",    year: 2002 },
  { label: "2005 – 2008",    year: 2006 },
  { label: "2009 – 2012",    year: 2010 },
  { label: "Después",        year: 2013 },
];

function YearQuestion({ memory, onAnswer }: { memory: MemoryData; onAnswer: (u: MemoryData, s?: string) => void }) {
  return (
    <div className="grid grid-cols-1 gap-2">
      {YEAR_OPTIONS.map((opt) => (
        <MemoryButton
          key={opt.year}
          label={opt.label}
          selected={memory.year === opt.year}
          onClick={() => onAnswer({ ...memory, year: opt.year }, opt.year >= 2005 && opt.year < 2009 ? "year_2005" : opt.year >= 2009 ? "year_2010" : "year_2000")}
        />
      ))}
    </div>
  );
}

// ── Light question ─────────────────────────────────────────────────────────────

const LIGHT_OPTIONS: { value: MemoryData["lightFrom"]; label: string; emoji: string }[] = [
  { value: "izquierda",     label: "Por la izquierda",               emoji: "←" },
  { value: "derecha",       label: "Por la derecha",                  emoji: "→" },
  { value: "detrás",        label: "Detrás del escritorio",           emoji: "↑" },
  { value: "tenue",         label: "Poca luz, siempre un poco oscura", emoji: "🌫" },
  { value: "solo_pantalla", label: "Solo la pantalla iluminaba",      emoji: "🖥" },
];

function LightQuestion({ memory, onAnswer }: { memory: MemoryData; onAnswer: (u: MemoryData, s?: string) => void }) {
  return (
    <div className="grid grid-cols-1 gap-2">
      {LIGHT_OPTIONS.map((opt) => (
        <MemoryButton
          key={opt.value}
          label={`${opt.emoji}  ${opt.label}`}
          selected={memory.lightFrom === opt.value}
          onClick={() => onAnswer(
            { ...memory, lightFrom: opt.value },
            opt.value === "izquierda" ? "light_izq" : opt.value === "solo_pantalla" ? "light_pan" : "light_der",
          )}
        />
      ))}
    </div>
  );
}

// ── Walls question ─────────────────────────────────────────────────────────────

const WALL_OPTIONS = [
  { color: "#f0ede8", label: "Blancas / crema",    snap: "walls_blanc" },
  { color: "#aac4e0", label: "Azul claro",          snap: "walls_azul"  },
  { color: "#c5d9c0", label: "Verde suave",         snap: ""            },
  { color: "#e8e0c8", label: "Beige / amarillento", snap: ""            },
  { color: "#d0b8b8", label: "Rosa o melocotón",    snap: ""            },
  { color: "#888",    label: "No lo recuerdo",      snap: ""            },
];

function WallsQuestion({ memory, onAnswer }: { memory: MemoryData; onAnswer: (u: MemoryData, s?: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {WALL_OPTIONS.map((opt) => (
        <button
          key={opt.label}
          onClick={() => onAnswer({ ...memory, wallColor: opt.color, wallColorLabel: opt.label }, opt.snap || undefined)}
          className="flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all active:scale-95"
          style={{
            borderColor: memory.wallColorLabel === opt.label ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.08)",
            color:       memory.wallColorLabel === opt.label ? "rgba(255,255,255,0.8)"  : "rgba(255,255,255,0.4)",
            background:  memory.wallColorLabel === opt.label ? "rgba(255,255,255,0.06)" : "transparent",
          }}
        >
          <span
            className="inline-block h-4 w-4 flex-shrink-0 rounded-full border border-white/20"
            style={{ background: opt.color }}
          />
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ── Objects question ──────────────────────────────────────────────────────────

const OBJECT_OPTIONS = [
  { id: "pc",      emoji: "🖥",  label: "Ordenador"    },
  { id: "msn",     emoji: "💬",  label: "Messenger"    },
  { id: "tv",      emoji: "📺",  label: "Televisión"   },
  { id: "fan",     emoji: "🌀",  label: "Ventilador"   },
  { id: "console", emoji: "🎮",  label: "Consola"      },
  { id: "radio",   emoji: "📻",  label: "Radio / mp3"  },
];

function ObjectsQuestion({ memory, onAnswer }: { memory: MemoryData; onAnswer: (u: MemoryData, s?: string) => void }) {
  const [selected, setSelected] = useState<string[]>(memory.alwaysOn);

  const toggle = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2">
        {OBJECT_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => toggle(opt.id)}
            className="flex items-center gap-2 rounded-xl border px-4 py-3 text-sm transition-all active:scale-95"
            style={{
              borderColor: selected.includes(opt.id) ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.08)",
              color:       selected.includes(opt.id) ? "rgba(255,255,255,0.8)"  : "rgba(255,255,255,0.35)",
              background:  selected.includes(opt.id) ? "rgba(255,255,255,0.07)" : "transparent",
            }}
          >
            <span className="text-base">{opt.emoji}</span>
            {opt.label}
          </button>
        ))}
      </div>
      <button
        className="self-end text-xs text-white/25 hover:text-white/50 transition-colors"
        onClick={() => onAnswer(
          { ...memory, alwaysOn: selected },
          selected.includes("msn") ? "obj_msn" : selected.includes("pc") ? "obj_pc" : undefined,
        )}
      >
        Continuar →
      </button>
    </div>
  );
}

// ── Music question ─────────────────────────────────────────────────────────────

const MUSIC_SUGGESTIONS = [
  "Fondo Flamenco", "Reggaetón", "Rock en español", "Pop español",
  "Electrónica", "Hip-hop", "Silencio", "La tele de fondo",
];

function MusicQuestion({ memory, onAnswer }: { memory: MemoryData; onAnswer: (u: MemoryData, s?: string) => void }) {
  const [value, setValue] = useState(memory.music ?? "");

  return (
    <div className="flex flex-col gap-4">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Escríbelo o elige abajo..."
        className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-3
                   text-sm text-white/70 placeholder-white/20 outline-none
                   focus:border-white/25 transition-colors"
      />
      <div className="flex flex-wrap gap-2">
        {MUSIC_SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setValue(s)}
            className="rounded-full border border-white/8 px-3 py-1 text-xs text-white/30
                       hover:border-white/20 hover:text-white/55 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
      <button
        className="self-end text-xs text-white/25 hover:text-white/50 transition-colors"
        onClick={() => onAnswer({ ...memory, music: value || undefined }, value ? "music_fondo" : undefined)}
      >
        Continuar →
      </button>
    </div>
  );
}

// ── Reusable memory button ────────────────────────────────────────────────────

function MemoryButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl border px-5 py-3 text-left text-sm transition-all active:scale-[0.99]"
      style={{
        borderColor: selected ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.08)",
        color:       selected ? "rgba(255,255,255,0.8)"  : "rgba(255,255,255,0.4)",
        background:  selected ? "rgba(255,255,255,0.06)" : "transparent",
      }}
    >
      {label}
    </button>
  );
}

// ── Isometric 3D room zone button ─────────────────────────────────────────────

function RoomZoneButton({
  zone, placed, pickedItem, onZoneClick,
}: {
  zone:        RoomZone;
  placed:      PlacedItem[];
  pickedItem:  typeof ROOM_ITEMS[number] | null;
  onZoneClick: (zone: RoomZone) => void;
}) {
  const item   = placed.find((p) => p.zone === zone);
  const active = !!pickedItem;
  return (
    <button
      onClick={() => active && onZoneClick(zone)}
      style={{
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
        background:      item   ? "rgba(255,255,255,0.08)" : active ? "rgba(255,255,255,0.02)" : "transparent",
        border:          item   ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(255,255,255,0.05)",
        cursor:          active ? "crosshair" : "default",
        transition:      "background 0.2s",
      }}
    >
      {item   ? <span style={{ fontSize: 22, lineHeight: 1 }}>{item.emoji}</span>
       : active ? <span style={{ fontSize: 11, color: "rgba(255,255,255,0.18)" }}>+</span>
       : null}
    </button>
  );
}

// ── Isometric 3D CSS room ─────────────────────────────────────────────────────

function IsometricRoom({
  placed, pickedItem, onZoneClick,
}: {
  placed:      PlacedItem[];
  pickedItem:  typeof ROOM_ITEMS[number] | null;
  onZoneClick: (zone: RoomZone) => void;
}) {
  const W = 250, H = 138, D = 158;
  const shared = { placed, pickedItem, onZoneClick };

  return (
    <div style={{ perspective: "700px", perspectiveOrigin: "50% 28%", width: "100%" }}>
      <div
        style={{
          position:        "relative",
          width:            W,
          height:           H,
          margin:           "20px auto 52px",
          transformStyle:   "preserve-3d",
          transform:        "rotateX(-22deg) rotateY(16deg)",
        }}
      >
        {/* Back wall — window, TV, wall items */}
        <div
          style={{
            position:              "absolute",
            inset:                 0,
            display:               "grid",
            gridTemplateColumns:   "1fr 1fr 1fr",
            gap:                   1,
            background:            "rgba(22,28,56,0.9)",
            border:                "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {BACK_ZONES.map((z) => <RoomZoneButton key={z} zone={z} {...shared} />)}
        </div>

        {/* Floor — desk, bed, computer, furniture */}
        <div
          style={{
            position:              "absolute",
            width:                  W,
            height:                 D,
            top:                    H,
            left:                   0,
            transformOrigin:        "top center",
            transform:              "rotateX(-90deg)",
            display:               "grid",
            gridTemplateColumns:   "1fr 1fr 1fr",
            gridTemplateRows:      "1fr 1fr",
            gap:                    1,
            background:            "rgba(14,18,40,0.9)",
            border:                "1px solid rgba(255,255,255,0.05)",
          }}
        >
          {FLOOR_ZONES.map((z) => <RoomZoneButton key={z} zone={z} {...shared} />)}
        </div>

        {/* Right side wall — decorative depth */}
        <div
          style={{
            position:        "absolute",
            width:            Math.round(D * 0.52),
            height:           H,
            top:              0,
            left:             W,
            transformOrigin: "left center",
            transform:       "rotateY(90deg)",
            background:      "rgba(17,21,46,0.85)",
            border:          "1px solid rgba(255,255,255,0.05)",
          }}
        />

        {/* Ceiling strip — depth cue */}
        <div
          style={{
            position:        "absolute",
            width:            W,
            height:           Math.round(D * 0.32),
            top:              0,
            left:             0,
            transformOrigin: "top center",
            transform:       "rotateX(90deg)",
            background:      "rgba(26,32,58,0.55)",
            border:          "1px solid rgba(255,255,255,0.04)",
          }}
        />
      </div>
    </div>
  );
}
