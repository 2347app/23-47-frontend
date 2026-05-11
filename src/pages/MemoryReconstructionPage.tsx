// ============================================================
// 23:47 — Memory Reconstruction Core System
// The room is not the product. The reconstruction is.
// The user remembers. The space emerges.
// ============================================================

import { useState, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useRoomBreathing } from "../hooks/useRoomBreathing";
import {
  type MemoryProfile,
  type MemoryQuestion,
  type AtmosphereReaction,
  selectNextQuestion,
  isL1Saturated,
  isFullySaturated,
  inferAtmosphere,
  buildDescription,
  computeDensity,
} from "../services/memory-question-engine";

// ── Types ────────────────────────────────────────────────────────────────────

type Step = "entry" | "questions_l1" | "placement" | "questions_l3" | "objects" | "generating" | "reveal";

type RoomZone =
  | "top-left" | "top-center" | "top-right"
  | "mid-left" | "mid-center" | "mid-right"
  | "bot-left" | "bot-center" | "bot-right";

interface PlacedItem {
  id:    string;
  emoji: string;
  label: string;
  zone:  RoomZone;
}

const EMPTY_PROFILE: MemoryProfile = {
  alwaysOn: [], nightlyPresence: [], externalSounds: [], memoryObjects: [], placed: [],
};

// ── Questions ─────────────────────────────────────────────────────────────────


// ── Memory snapshots triggered by user choices ────────────────────────────────

const SNAPSHOTS: Record<string, string> = {
  year_before_2000: "Antes del 2000. El internet era todavía un rumor.",
  year_2002:   "Principios de los 2000. Las primeras conexiones lentas.",
  year_2006:   "Esos años en que el internet era todavía una aventura.",
  year_2010:   "2010. Las últimas tardes analógicas antes de que todo cambiara.",
  year_2013:   "Ya era otra época. Pero la habitación aún guarda algo.",
  solo:        "Tuya. Solo tuya. Eso cambia cómo recuerdas el espacio.",
  pequeño_acogedor: "Pequeño pero tuyo. El tamaño no importaba tanto.",
  lleno:       "Lleno de cosas. Cada objeto en su sitio. Todo importaba.",
  walls_azul:  "Ese azul no lo elegiste tú. Simplemente era el que había.",
  walls_blanc: "Blanco. Limpio. Y a veces un poco frío en invierno.",
  msn_night:   "Messenger. El sonido de la campanita. La pantalla verde.",
  fan_night:   "El ventilador. Ese ruido constante que a veces ayudaba a dormir.",
  only_screen: "Solo la pantalla iluminaba. El resto desaparecía.",
  ps2_snap:    "La PS2. Las partidas que nunca terminaban.",
  nokia_snap:  "El Nokia. Mensajes que tardaban en llegar.",
  waited_msn:  "Siempre esperando que el icono verde apareciera.",
  bed_snap:    "La cama siempre en el mismo sitio. Desde ahí se veía todo.",
  desk_window: "La pantalla y la ventana en el mismo campo de visión. Eso define todo.",
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
  const navigate = useNavigate();
  const [step, setStep]           = useState<Step>("entry");
  const [profile, setProfile]     = useState<MemoryProfile>({ ...EMPTY_PROFILE });
  const [asked, setAsked]         = useState<string[]>([]);
  const [currentQ, setCurrentQ]   = useState<MemoryQuestion | null>(null);
  const [snapshot, setSnapshot]   = useState<string | null>(null);
  const [pickedItem, setPickedItem] = useState<typeof ROOM_ITEMS[number] | null>(null);
  const [imageUrl, setImageUrl]   = useState<string | null>(null);
  const [revealed, setRevealed]   = useState(false);
  const snapshotTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const atm = useMemo(() => inferAtmosphere(profile), [profile]);
  const breathValue = useRoomBreathing(atm.breathSpeed, atm.breathDepth);

  const showSnapshot = useCallback((text: string) => {
    if (!text) return;
    setSnapshot(text);
    if (snapshotTimer.current) clearTimeout(snapshotTimer.current);
    snapshotTimer.current = setTimeout(() => setSnapshot(null), 4200);
  }, []);

  const advanceQuestion = useCallback((updated: MemoryProfile, snapKey?: string) => {
    if (snapKey && SNAPSHOTS[snapKey]) showSnapshot(SNAPSHOTS[snapKey]);
    const layer = step === "questions_l1" ? 1 : 3;
    const newAsked = currentQ ? [...asked, currentQ.id] : asked;
    setAsked(newAsked);
    setProfile(updated);

    if (layer === 1) {
      if (isL1Saturated(updated)) {
        setStep("placement");
      } else {
        const next = selectNextQuestion(updated, newAsked, 1);
        if (!next) setStep("placement");
        else setCurrentQ(next);
      }
    } else {
      if (isFullySaturated(updated)) {
        setStep("objects");
      } else {
        const next = selectNextQuestion(updated, newAsked, 3);
        if (!next) setStep("objects");
        else setCurrentQ(next);
      }
    }
  }, [step, asked, currentQ, showSnapshot]);

  const startLayer = useCallback((layer: 1 | 3) => {
    const q = selectNextQuestion(profile, asked, layer);
    setCurrentQ(q);
    setStep(layer === 1 ? "questions_l1" : "questions_l3");
  }, [profile, asked]);

  const generate = useCallback(async () => {
    setStep("generating");
    const description = buildDescription(profile, profile.placed as PlacedItem[]);
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
      setStep("objects");
    }
  }, [profile]);

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
            onClick={() => startLayer(1)}
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

  // ── QUESTIONS L1 + L3 (shared render) ──────────────────────────────────────

  if (step === "questions_l1" || step === "questions_l3") {
    const q = currentQ;
    if (!q) return null;
    const density = computeDensity(profile);
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden px-6"
        style={{ background: "#050508" }}>
        <BreathingRoom breathValue={breathValue} glowColor={atm.glowColor} dim />
        <SnapshotOverlay text={snapshot} />
        {atm.label && (
          <p className="pointer-events-none fixed bottom-6 left-0 right-0 z-40 text-center text-[10px] italic text-white/18">
            {atm.label}
          </p>
        )}
        <div className="relative z-10 w-full max-w-md">
          <AnimatePresence mode="wait">
            <motion.div key={q.id} {...fadeIn} className="flex flex-col gap-6">
              <div className="mb-2">
                <div className="mb-3 flex items-center gap-3">
                  <div
                    className="h-px flex-1 rounded"
                    style={{ background: `rgba(255,255,255,${0.04 + density * 0.12})` }}
                  />
                  <p className="text-[10px] tracking-widest text-white/20 uppercase">
                    {step === "questions_l1" ? "identidad" : "presencia emocional"}
                  </p>
                  <div
                    className="h-px flex-1 rounded"
                    style={{ background: `rgba(255,255,255,${0.04 + density * 0.12})` }}
                  />
                </div>
                <h2 className="text-2xl font-light text-white/80 leading-snug">{q.text}</h2>
                {q.sub && <p className="mt-1 text-sm text-white/30 italic">{q.sub}</p>}
              </div>
              <QuestionInput
                question={q}
                profile={profile}
                onAnswer={advanceQuestion}
              />
              <button
                className="self-start text-[11px] text-white/18 hover:text-white/40 transition-colors"
                onClick={() => advanceQuestion(profile)}
              >
                saltar →
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ── OBJECTS ─────────────────────────────────────────────────────────────────

  if (step === "objects") {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-between overflow-hidden py-8 px-4"
        style={{ background: "#050508" }}>
        <BreathingRoom breathValue={breathValue} glowColor={atm.glowColor} dim />
        <SnapshotOverlay text={snapshot} />
        <motion.div {...fadeIn} className="relative z-10 text-center">
          <h2 className="text-xl font-light text-white/70">¿Qué había que solo era tuyo?</h2>
          <p className="mt-1 text-sm text-white/30 italic">Anclas emocionales. No decoración.</p>
        </motion.div>
        <motion.div {...fadeIn} className="relative z-10 w-full max-w-sm">
          <MemoryObjectsPicker
            selected={profile.memoryObjects}
            onToggle={(id, snapKey) => {
              const next = profile.memoryObjects.includes(id)
                ? profile.memoryObjects.filter((x) => x !== id)
                : [...profile.memoryObjects, id];
              setProfile((p) => ({ ...p, memoryObjects: next }));
              if (snapKey && SNAPSHOTS[snapKey]) showSnapshot(SNAPSHOTS[snapKey]);
            }}
          />
        </motion.div>
        <motion.div {...fadeIn} className="relative z-10 flex gap-6">
          <button
            className="text-xs text-white/25 hover:text-white/50 transition-colors"
            onClick={generate}
          >
            {profile.memoryObjects.length === 0 ? "Saltar →" : "Reconstruir →"}
          </button>
        </motion.div>
      </div>
    );
  }

  // ── PLACEMENT ───────────────────────────────────────────────────────────────

  if (step === "placement") {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-between overflow-hidden py-8 px-4"
        style={{ background: "#050508" }}>
        <BreathingRoom breathValue={breathValue} glowColor={atm.glowColor} dim />
        <SnapshotOverlay text={snapshot} />

        <motion.div {...fadeIn} className="relative z-10 text-center">
          <h2 className="text-xl font-light text-white/70">¿Cómo estaba distribuida?</h2>
          <p className="mt-1 text-sm text-white/30 italic">Toca una zona para colocar. Sin exactitud.</p>
        </motion.div>

        {/* Isometric 3D room */}
        <motion.div {...fadeIn} className="relative z-10 w-full max-w-sm">
          <IsometricRoom
            placed={profile.placed as PlacedItem[]}
            pickedItem={pickedItem}
            onZoneClick={(zone) => {
              if (!pickedItem) return;
              const newPlaced = [
                ...profile.placed.filter((p) => p.id !== pickedItem.id && p.zone !== zone),
                { ...pickedItem, zone },
              ];
              setProfile((p) => ({ ...p, placed: newPlaced }));
              setPickedItem(null);
              if (pickedItem.id === "computer" && zone.includes("top")) {
                showSnapshot(SNAPSHOTS["desk_window"]);
              }
              if (pickedItem.id === "bed") {
                showSnapshot(SNAPSHOTS["bed_snap"]);
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
            {ROOM_ITEMS.filter((item) => !profile.placed.find((p) => p.id === item.id)).map((item) => (
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
              onClick={() => startLayer(3)}
            >
              {profile.placed.length === 0 ? "Saltar distribución →" : "Continuar →"}
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

function BreathingRoom({ breathValue, dim, glowColor }: { breathValue: number; dim?: boolean; glowColor?: string }) {
  const base = glowColor ?? "rgba(30,40,80,1)";
  const alpha = (0.08 + breathValue * 0.06) * (dim ? 0.5 : 1);
  const tinted = base.replace(/rgba\((\d+),(\d+),(\d+),[^)]+\)/, `rgba($1,$2,$3,${alpha.toFixed(3)})`);
  return (
    <>
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 40%, ${tinted} 0%, rgba(5,5,8,1) 70%)`,
          transition: "background 2.5s ease",
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

function QuestionInput({
  question, profile, onAnswer,
}: {
  question:  MemoryQuestion;
  profile:   MemoryProfile;
  onAnswer:  (updated: MemoryProfile, snapKey?: string) => void;
}) {
  switch (question.type) {
    case "year":             return <YearQuestion        profile={profile} onAnswer={onAnswer} />;
    case "ownership":        return <OwnershipQuestion   profile={profile} onAnswer={onAnswer} />;
    case "room_feel":        return <RoomFeelQuestion    profile={profile} onAnswer={onAnswer} />;
    case "bed_type":         return <BedTypeQuestion     profile={profile} onAnswer={onAnswer} />;
    case "walls":            return <WallsQuestion       profile={profile} onAnswer={onAnswer} />;
    case "night_presence":   return <NightPresenceQ      profile={profile} onAnswer={onAnswer} />;
    case "computer_central": return <ComputerCentralQ    profile={profile} onAnswer={onAnswer} />;
    case "background_sound": return <BackgroundSoundQ    profile={profile} onAnswer={onAnswer} />;
    case "social_energy":    return <SocialEnergyQ       profile={profile} onAnswer={onAnswer} />;
    case "external_sounds":  return <ExternalSoundsQ     profile={profile} onAnswer={onAnswer} />;
    default:                 return null;
  }
}

type QProps = { profile: MemoryProfile; onAnswer: (u: MemoryProfile, s?: string) => void };

// ── Year ──────────────────────────────────────────────────────────────────────

const YEAR_OPTIONS = [
  { label: "Antes del 2000", year: 1998, snap: "year_before_2000" },
  { label: "2000 – 2004",    year: 2002, snap: "year_2002"        },
  { label: "2005 – 2008",    year: 2006, snap: "year_2006"        },
  { label: "2009 – 2012",    year: 2010, snap: "year_2010"        },
  { label: "Después",        year: 2013, snap: "year_2013"        },
];

function YearQuestion({ profile, onAnswer }: QProps) {
  return (
    <div className="grid grid-cols-1 gap-2">
      {YEAR_OPTIONS.map((opt) => (
        <MemoryButton
          key={opt.year}
          label={opt.label}
          selected={profile.year === opt.year}
          onClick={() => onAnswer({ ...profile, year: opt.year }, opt.snap)}
        />
      ))}
    </div>
  );
}

// ── Ownership ─────────────────────────────────────────────────────────────────

function OwnershipQuestion({ profile, onAnswer }: QProps) {
  const opts = [
    { id: "solo",      label: "Sí, solo mía"               },
    { id: "compartida",label: "La compartía"                },
    { id: "a_veces",   label: "A veces dormía alguien más"  },
    { id: "familiar",  label: "Era de uso familiar"         },
  ];
  return (
    <div className="grid grid-cols-1 gap-2">
      {opts.map((o) => (
        <MemoryButton key={o.id} label={o.label} selected={profile.ownership === o.id}
          onClick={() => onAnswer({ ...profile, ownership: o.id }, o.id === "solo" ? "solo" : undefined)} />
      ))}
    </div>
  );
}

// ── Room feel ─────────────────────────────────────────────────────────────────

function RoomFeelQuestion({ profile, onAnswer }: QProps) {
  const opts = [
    { id: "pequeño_acogedor",  label: "Pequeño y acogedor"     },
    { id: "pequeño_agobiante", label: "Pequeño y agobiante"    },
    { id: "amplio_vacio",      label: "Amplio pero vacío"      },
    { id: "normal",            label: "Normal, ni grande ni pequeño" },
    { id: "lleno",             label: "Lleno de cosas"         },
  ];
  return (
    <div className="grid grid-cols-1 gap-2">
      {opts.map((o) => (
        <MemoryButton key={o.id} label={o.label} selected={profile.roomFeel === o.id}
          onClick={() => onAnswer({ ...profile, roomFeel: o.id }, o.id === "pequeño_acogedor" ? "pequeño_acogedor" : o.id === "lleno" ? "lleno" : undefined)} />
      ))}
    </div>
  );
}

// ── Bed type ──────────────────────────────────────────────────────────────────

function BedTypeQuestion({ profile, onAnswer }: QProps) {
  const opts = [
    { id: "individual", label: "Individual"     },
    { id: "matrimonio", label: "De matrimonio"  },
    { id: "litera",     label: "Litera"         },
    { id: "sofa_cama",  label: "Sofá cama"      },
    { id: "colchon",    label: "Colchón simple" },
  ];
  return (
    <div className="grid grid-cols-1 gap-2">
      {opts.map((o) => (
        <MemoryButton key={o.id} label={o.label} selected={profile.bedType === o.id}
          onClick={() => onAnswer({ ...profile, bedType: o.id })} />
      ))}
    </div>
  );
}

// ── Walls ─────────────────────────────────────────────────────────────────────

const WALL_OPTIONS = [
  { color: "#f0ede8", label: "Blancas / crema",    snap: "walls_blanc" },
  { color: "#aac4e0", label: "Azul claro",          snap: "walls_azul"  },
  { color: "#c5d9c0", label: "Verde suave",         snap: ""            },
  { color: "#e8e0c8", label: "Beige / amarillento", snap: ""            },
  { color: "#d0b8b8", label: "Rosa o melocotón",    snap: ""            },
  { color: "#888",    label: "No lo recuerdo",      snap: ""            },
];

function WallsQuestion({ profile, onAnswer }: QProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {WALL_OPTIONS.map((opt) => (
        <button
          key={opt.label}
          onClick={() => onAnswer({ ...profile, wallColor: opt.color, wallColorLabel: opt.label }, opt.snap || undefined)}
          className="flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all active:scale-95"
          style={{
            borderColor: profile.wallColorLabel === opt.label ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.08)",
            color:       profile.wallColorLabel === opt.label ? "rgba(255,255,255,0.8)"  : "rgba(255,255,255,0.4)",
            background:  profile.wallColorLabel === opt.label ? "rgba(255,255,255,0.06)" : "transparent",
          }}
        >
          <span className="inline-block h-4 w-4 flex-shrink-0 rounded-full border border-white/20"
            style={{ background: opt.color }} />
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ── Night presence ────────────────────────────────────────────────────────────

const NIGHT_OPTIONS = [
  { id: "messenger", emoji: "💬", label: "Messenger"         },
  { id: "tv",        emoji: "📺", label: "La tele"           },
  { id: "winamp",    emoji: "🎵", label: "Winamp / música"   },
  { id: "fan",       emoji: "🌀", label: "Ventilador"        },
  { id: "radio",     emoji: "📻", label: "Radio"             },
  { id: "lamp",      emoji: "🕯", label: "Lámpara pequeña"  },
  { id: "nada",      emoji: "🌑", label: "Todo apagado"      },
];

function NightPresenceQ({ profile, onAnswer }: QProps) {
  const [sel, setSel] = useState<string[]>(profile.nightlyPresence);
  const toggle = (id: string) =>
    setSel((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        {NIGHT_OPTIONS.map((o) => (
          <button key={o.id} onClick={() => toggle(o.id)}
            className="flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-all active:scale-95"
            style={{
              borderColor: sel.includes(o.id) ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.08)",
              color:       sel.includes(o.id) ? "rgba(255,255,255,0.8)"  : "rgba(255,255,255,0.35)",
              background:  sel.includes(o.id) ? "rgba(255,255,255,0.07)" : "transparent",
            }}>
            <span>{o.emoji}</span>{o.label}
          </button>
        ))}
      </div>
      <button className="self-end text-xs text-white/25 hover:text-white/50 transition-colors"
        onClick={() => onAnswer(
          { ...profile, nightlyPresence: sel },
          sel.includes("messenger") ? "msn_night" : sel.includes("fan") ? "fan_night" : sel.includes("nada") ? "only_screen" : undefined,
        )}>
        Continuar →
      </button>
    </div>
  );
}

// ── Computer central ──────────────────────────────────────────────────────────

function ComputerCentralQ({ profile, onAnswer }: QProps) {
  const opts = [
    { id: "si",     label: "Sí. Si lo apagaba, el cuarto se vaciaba."  },
    { id: "aveces", label: "A veces. Dependía del día."                 },
    { id: "no",     label: "No. Había más vida sin él."                 },
  ];
  return (
    <div className="grid grid-cols-1 gap-2">
      {opts.map((o) => (
        <MemoryButton key={o.id} label={o.label} selected={profile.computerCentral === o.id}
          onClick={() => onAnswer({ ...profile, computerCentral: o.id })} />
      ))}
    </div>
  );
}

// ── Background sound ──────────────────────────────────────────────────────────

const SOUND_SUGGESTIONS = [
  "Fondo Flamenco", "Reggaetón", "Rock en español", "Pop español",
  "Linkin Park", "Estopa", "Electrónica", "Hip-hop", "Silencio", "La tele de fondo",
];

function BackgroundSoundQ({ profile, onAnswer }: QProps) {
  const [value, setValue] = useState(profile.backgroundSound ?? "");
  return (
    <div className="flex flex-col gap-4">
      <input type="text" value={value} onChange={(e) => setValue(e.target.value)}
        placeholder="Escríbelo o elige abajo..."
        className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-sm
                   text-white/70 placeholder-white/20 outline-none focus:border-white/25 transition-colors" />
      <div className="flex flex-wrap gap-2">
        {SOUND_SUGGESTIONS.map((s) => (
          <button key={s} onClick={() => setValue(s)}
            className="rounded-full border border-white/8 px-3 py-1 text-xs text-white/30
                       hover:border-white/20 hover:text-white/55 transition-colors">
            {s}
          </button>
        ))}
      </div>
      <button className="self-end text-xs text-white/25 hover:text-white/50 transition-colors"
        onClick={() => onAnswer({ ...profile, backgroundSound: value || undefined })}>
        Continuar →
      </button>
    </div>
  );
}

// ── Social energy ─────────────────────────────────────────────────────────────

function SocialEnergyQ({ profile, onAnswer }: QProps) {
  const opts = [
    { val: true,  label: "Sí. Siempre pendiente del estado verde."    },
    { val: false, label: "No. El ordenador era para mí."              },
  ];
  return (
    <div className="grid grid-cols-1 gap-2">
      {opts.map((o) => (
        <MemoryButton key={String(o.val)} label={o.label}
          selected={profile.waitedForMessenger === o.val}
          onClick={() => onAnswer({ ...profile, waitedForMessenger: o.val },
            o.val ? "waited_msn" : undefined)} />
      ))}
    </div>
  );
}

// ── External sounds ───────────────────────────────────────────────────────────

const EXT_SOUND_OPTIONS = [
  { id: "tv_salon",   label: "La tele del salón"   },
  { id: "voces",      label: "Voces"               },
  { id: "coches",     label: "Coches"              },
  { id: "silencio",   label: "Silencio"            },
  { id: "vecinos",    label: "Vecinos"             },
  { id: "pájaros",    label: "Pájaros / verano"    },
];

function ExternalSoundsQ({ profile, onAnswer }: QProps) {
  const [sel, setSel] = useState<string[]>(profile.externalSounds);
  const toggle = (id: string) =>
    setSel((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        {EXT_SOUND_OPTIONS.map((o) => (
          <MemoryButton key={o.id} label={o.label} selected={sel.includes(o.id)}
            onClick={() => toggle(o.id)} />
        ))}
      </div>
      <button className="self-end text-xs text-white/25 hover:text-white/50 transition-colors"
        onClick={() => onAnswer({ ...profile, externalSounds: sel })}>
        Continuar →
      </button>
    </div>
  );
}

// ── Memory objects picker (Fase 6 — emotional anchors) ───────────────────────

const MEMORY_OBJECTS_DB = [
  { id: "gameboy",    emoji: "🎮", label: "Game Boy",         snap: ""          },
  { id: "ps1",        emoji: "🕹", label: "PlayStation 1",    snap: ""          },
  { id: "ps2",        emoji: "🕹", label: "PS2",              snap: "ps2_snap"  },
  { id: "nds",        emoji: "🎮", label: "Nintendo DS",      snap: ""          },
  { id: "nokia",      emoji: "📱", label: "Nokia",            snap: "nokia_snap"},
  { id: "siemens",    emoji: "📱", label: "Siemens",          snap: ""          },
  { id: "cds",        emoji: "💿", label: "CDs grabados",     snap: ""          },
  { id: "webcam",     emoji: "📷", label: "Webcam",           snap: ""          },
  { id: "hobby",      emoji: "📰", label: "Hobby Consolas",   snap: ""          },
  { id: "carpetas",   emoji: "📁", label: "Carpetas del insti", snap: ""        },
  { id: "axe",        emoji: "🧴", label: "Colonia Axe",      snap: ""          },
  { id: "poster",     emoji: "🖼", label: "Póster en la pared", snap: ""        },
  { id: "radio_peq",  emoji: "📻", label: "Radio pequeña",    snap: ""          },
  { id: "pendrive",   emoji: "💾", label: "Pendrive / diskette", snap: ""       },
];

function MemoryObjectsPicker({
  selected, onToggle,
}: {
  selected:  string[];
  onToggle:  (id: string, snap?: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {MEMORY_OBJECTS_DB.map((obj) => {
        const on = selected.includes(obj.id);
        return (
          <button
            key={obj.id}
            onClick={() => onToggle(obj.id, obj.snap || undefined)}
            className="flex flex-col items-center gap-1 rounded-xl border py-3 px-2 text-xs transition-all active:scale-95"
            style={{
              borderColor: on ? "rgba(255,255,255,0.3)"  : "rgba(255,255,255,0.07)",
              color:       on ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.3)",
              background:  on ? "rgba(255,255,255,0.06)" : "transparent",
            }}
          >
            <span className="text-xl">{obj.emoji}</span>
            <span className="text-center leading-tight">{obj.label}</span>
          </button>
        );
      })}
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
  const W = 260, H = 148, D = 168;
  const [rotY, setRotY] = useState(0);
  const drag = useRef<{ startX: number; startRot: number; moved: boolean } | null>(null);
  const shared = { placed, pickedItem, onZoneClick };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pickedItem) return;
    drag.current = { startX: e.clientX, startRot: rotY, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const delta = (e.clientX - drag.current.startX) * 0.55;
    if (Math.abs(delta) > 3) drag.current.moved = true;
    setRotY(drag.current.startRot + delta);
  };

  const onPointerUp = () => { drag.current = null; };

  return (
    <div style={{ perspective: "800px", perspectiveOrigin: "50% 30%", width: "100%" }}>
      {/* drag hint */}
      {!pickedItem && (
        <p className="mb-1 text-center text-[10px] text-white/20 select-none">
          ← arrastra para girar →
        </p>
      )}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{
          position:      "relative",
          width:          W,
          height:         H,
          margin:        "12px auto 60px",
          transformStyle: "preserve-3d",
          transform:      `rotateX(-24deg) rotateY(${rotY}deg)`,
          cursor:         pickedItem ? "crosshair" : "grab",
          userSelect:    "none",
        }}
      >
        {/* Back wall */}
        <div
          style={{
            position:            "absolute",
            inset:               0,
            display:             "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap:                 2,
            background:          "rgba(22,28,56,0.92)",
            border:              "1px solid rgba(255,255,255,0.1)",
            pointerEvents:       "auto",
          }}
        >
          {BACK_ZONES.map((z) => <RoomZoneButton key={z} zone={z} {...shared} />)}
        </div>

        {/* Floor */}
        <div
          style={{
            position:            "absolute",
            width:                W,
            height:               D,
            top:                  H,
            left:                 0,
            transformOrigin:     "top center",
            transform:           "rotateX(-90deg)",
            display:             "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gridTemplateRows:    "1fr 1fr",
            gap:                  2,
            background:          "rgba(14,18,42,0.92)",
            border:              "1px solid rgba(255,255,255,0.06)",
            pointerEvents:       "auto",
          }}
        >
          {FLOOR_ZONES.map((z) => <RoomZoneButton key={z} zone={z} {...shared} />)}
        </div>

        {/* Right side wall — decorative only */}
        <div
          style={{
            position:       "absolute",
            width:           Math.round(D * 0.52),
            height:          H,
            top:             0,
            left:            W,
            transformOrigin:"left center",
            transform:      "rotateY(90deg)",
            background:     "rgba(17,21,46,0.85)",
            border:         "1px solid rgba(255,255,255,0.05)",
            pointerEvents:  "none",
          }}
        />

        {/* Ceiling strip — decorative only */}
        <div
          style={{
            position:       "absolute",
            width:           W,
            height:          Math.round(D * 0.32),
            top:             0,
            left:            0,
            transformOrigin:"top center",
            transform:      "rotateX(90deg)",
            background:     "rgba(26,32,58,0.5)",
            border:         "1px solid rgba(255,255,255,0.04)",
            pointerEvents:  "none",
          }}
        />
      </div>
    </div>
  );
}
