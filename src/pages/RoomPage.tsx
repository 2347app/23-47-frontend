import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, type PanInfo } from "framer-motion";
import { Wand2, RefreshCcw, Pencil, Check, X } from "lucide-react";
import toast from "react-hot-toast";
import { GlassCard } from "../components/GlassCard";
import { api } from "../services/api";
import { useEraStore } from "../store/era.store";
import { fadeUp, stagger } from "../animations/variants";
import { RoomObjectVisual } from "../features/room/RoomObjectVisual";
import { ReconstructionCinematic } from "../features/room/ReconstructionCinematic";
import { NostalgiaPacksSection } from "../features/room/NostalgiaPacksSection";
import { useRoomDnaStore } from "../store/room-dna.store";
import { calculateEmotionalProfile, getWhisperPool } from "../services/runtime-emotion-engine";
import { useRoomBreathing } from "../hooks/useRoomBreathing";
import { useMouseParallax } from "../hooks/useMouseParallax";
import { ambientEngine } from "../audio/ambientEngine";

interface RoomItem {
  id: string;
  type: string;
  positionX: number;
  positionY: number;
  rotation: number;
  scale: number;
  metadata?: any;
}

interface AtmosphereProfile {
  lightingProfile: string;
  ambientType: string;
  colorTemperature: number;
  crtGrain: boolean;
  monitorGlow: boolean;
  depthFog: boolean;
  timeOfDay: string;
  emotionalHaze: number;
  breathingSpeed: number;
  vignette: number;
  contrast: number;
}

interface DigitalRoom {
  id: string;
  theme: string;
  background?: string | null;
  musicTheme?: string | null;
  ambient?: string | null;
  nostalgiaData?: { atmosphere?: AtmosphereProfile; narrativeMoment?: string } | null;
  items: RoomItem[];
}

const ITEM_TYPES: Array<{ type: string; icon: string; label: string; spanish?: boolean }> = [
  { type: "poster",       icon: "🖼️",  label: "Poster" },
  { type: "crt",         icon: "🖥️",  label: "CRT" },
  { type: "computer",    icon: "💻",  label: "PC" },
  { type: "console",     icon: "🎮",  label: "Consola" },
  { type: "lamp",        icon: "🛋️",  label: "Lámpara" },
  { type: "plant",       icon: "🪴",  label: "Planta" },
  { type: "vinyl",       icon: "💿",  label: "Vinilo" },
  { type: "photo",       icon: "📷",  label: "Foto" },
  { type: "bed",         icon: "🛏️",  label: "Cama" },
  { type: "window",      icon: "🪟",  label: "Ventana" },
  // ── Cultura material española 2000s ─────────────────────
  { type: "fan",         icon: "🌀",  label: "Ventilador",  spanish: true },
  { type: "blind",       icon: "🪟",  label: "Persiana",    spanish: true },
  { type: "cd_stack",    icon: "💿",  label: "CDs grabados", spanish: true },
  { type: "nokia",       icon: "📱",  label: "Nokia",       spanish: true },
  { type: "ps2",         icon: "🎮",  label: "PlayStation 2", spanish: true },
  { type: "walkman",     icon: "🎵",  label: "Walkman",     spanish: true },
  { type: "magazine",    icon: "📰",  label: "Revista",     spanish: true },
  { type: "pencil_case", icon: "✏️",  label: "Estuche",     spanish: true },
];

// --------------- Sub-componente item arrastrable ---------------
function DraggableRoomItem({
  item,
  editMode,
  containerRef,
  onMove,
  onDelete,
}: {
  item: RoomItem;
  editMode: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
  onMove: (id: string, x: number, y: number) => void;
  onDelete: (id: string) => void;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const container = containerRef.current;
      if (!container) return;
      const { width, height } = container.getBoundingClientRect();
      const newX = Math.max(3, Math.min(97, item.positionX + (info.offset.x / width) * 100));
      const newY = Math.max(3, Math.min(97, item.positionY + (info.offset.y / height) * 100));
      x.set(0);
      y.set(0);
      onMove(item.id, Math.round(newX * 10) / 10, Math.round(newY * 10) / 10);
    },
    [item.positionX, item.positionY, containerRef, onMove, x, y],
  );

  const label: string = item.metadata?.label ?? item.type;
  const depth: number = item.metadata?.depth ?? 3;
  const blur: number = item.metadata?.imperfection?.blurAmount ?? 0;

  return (
    <div
      className="absolute"
      style={{
        left: `${item.positionX}%`,
        top: `${item.positionY}%`,
        transform: `translate(-50%, -50%) rotate(${item.rotation ?? 0}deg) scale(${item.scale ?? 1})`,
        zIndex: editMode ? 20 : depth,
        filter: blur > 0 ? `blur(${blur * 2}px)` : undefined,
      }}
    >
      <motion.div
        drag={editMode}
        dragMomentum={false}
        dragElastic={0}
        style={{ x, y, cursor: editMode ? "grab" : "default" }}
        whileDrag={{ scale: 1.1, cursor: "grabbing" }}
        onDragEnd={handleDragEnd}
        className="group relative"
        title={label}
      >
        <RoomObjectVisual type={item.type} label={label} monitorGlow={item.type === "crt"} isNight />
        <span className="pointer-events-none absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/60 px-2 py-0.5 text-[9px] text-white/70 opacity-0 transition group-hover:opacity-100">
          {label}
        </span>
        {editMode && (
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onDelete(item.id)}
            className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500/80 text-white opacity-0 transition hover:bg-red-500 group-hover:opacity-100"
          >
            <X size={10} />
          </button>
        )}
      </motion.div>
    </div>
  );
}

export function RoomPage() {
  const era = useEraStore((s) => s.currentEra);
  const [room, setRoom] = useState<DigitalRoom | null>(null);
  const [loading, setLoading] = useState(false);
  const [rebuilding, setRebuilding] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [addingType, setAddingType] = useState<string | null>(null);
  const [reconstructInput, setReconstructInput] = useState("");
  const [atmosphere, setAtmosphere] = useState<AtmosphereProfile | null>(null);
  const [imageError, setImageError] = useState(false);
  const [roomRevealed, setRoomRevealed] = useState(false);
  const [forceImage, setForceImage] = useState(false);
  const [detectedEra, setDetectedEra] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Emotional DNA layer ─────────────────────────────────────────────────
  const { dna, setDna } = useRoomDnaStore();
  const profile = useMemo(() => (dna ? calculateEmotionalProfile(dna) : null), [dna]);
  const breathValue = useRoomBreathing(profile?.breathingSpeed ?? 14, profile?.breathingDepth ?? 0.4);
  const parallax    = useMouseParallax({ strength: 0.018, smoothing: 0.06 });
  const [whisper, setWhisper] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setImageError(false);
    try {
      const { data } = await api.get("/rooms/me");
      setRoom(data.room);
      if (data.room?.nostalgiaData?.atmosphere) {
        setAtmosphere(data.room.nostalgiaData.atmosphere);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Load current DNA + apply behavioral mutation from backend
  useEffect(() => {
    api.get("/ai/room/dna")
      .then(({ data }) => { if (data.dna) setDna(data.dna, data.shouldRegenerate ?? false); })
      .catch(() => {});
  }, [setDna]);

  // Drive ambient sound + emotional volume from DNA profile
  useEffect(() => {
    if (!profile) return;
    ambientEngine.setAmbient(profile.ambientType);
    ambientEngine.setEmotionalMod(profile.audioVolumeMod);
    return () => { ambientEngine.setEmotionalMod(1.0); };
  }, [profile?.ambientType, profile?.audioVolumeMod]);

  // Ambient memory whispers — float as thoughts, not notifications
  useEffect(() => {
    if (!profile || !dna) return;
    const pool = getWhisperPool(dna);
    if (pool.length === 0) return;
    const show = () => {
      const msg = pool[Math.floor(Math.random() * pool.length)]!;
      setWhisper(msg);
      setTimeout(() => setWhisper(null), 8500);
    };
    const id = setInterval(show, profile.whisperIntervalMs);
    return () => clearInterval(id);
  }, [profile?.whisperIntervalMs, dna?.internetCulture, dna?.musicIdentity]);

  const handleMove = useCallback(async (id: string, newX: number, newY: number) => {
    setRoom((prev) =>
      prev
        ? { ...prev, items: prev.items.map((it) => it.id === id ? { ...it, positionX: newX, positionY: newY } : it) }
        : null,
    );
    try {
      await api.patch(`/rooms/me/items/${id}`, { positionX: Math.round(newX), positionY: Math.round(newY) });
    } catch {
      toast.error("No se pudo guardar la posición");
      load();
    }
  }, [load]);

  const handleDelete = useCallback(async (id: string) => {
    setRoom((prev) => prev ? { ...prev, items: prev.items.filter((it) => it.id !== id) } : null);
    try {
      await api.delete(`/rooms/me/items/${id}`);
    } catch {
      toast.error("No se pudo eliminar el objeto");
      load();
    }
  }, [load]);

  const handleAdd = async (type: string) => {
    if (addingType) return;
    setAddingType(type);
    try {
      const { data } = await api.post("/rooms/me/items", {
        type,
        positionX: 15 + Math.floor(Math.random() * 70),
        positionY: 15 + Math.floor(Math.random() * 65),
        rotation: Math.floor(Math.random() * 20) - 10,
        scale: 0.85 + Math.random() * 0.35,
        metadata: { label: type.charAt(0).toUpperCase() + type.slice(1) },
      });
      setRoom((prev) => prev ? { ...prev, items: [...prev.items, data.item] } : null);
    } catch {
      toast.error("No se pudo añadir el objeto");
    } finally {
      setAddingType(null);
    }
  };

  const rebuild = async () => {
    if (!reconstructInput.trim()) { toast.error("Escribe algún recuerdo primero"); return; }
    setRebuilding(true);
    try {
      const { data } = await api.post("/ai/room/reconstruct", {
        input: reconstructInput,
        apply: true,
        forceImage,
      }, { timeout: 60_000 });
      if (data.atmosphere) setAtmosphere(data.atmosphere);
      if (data.era) setDetectedEra(data.era);
      if (data.roomDna) setDna(data.roomDna);
      if (data.imageUrl) {
        setImageError(false);
        setRoom((prev) => prev ? { ...prev, background: data.imageUrl } : prev);
      }
      toast.success(data.narrativeMoment ?? "Tu habitación ha sido reconstruida 🌙");
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? "No se pudo reconstruir");
    } finally {
      setRebuilding(false);
    }
  };

  const ambient = room?.ambient ?? atmosphere?.ambientType ?? era.ambient;
  const isNight = atmosphere ? ["night", "late_night"].includes(atmosphere.timeOfDay) : true;
  const hasRoomImage = !!room?.background?.startsWith("http") && !imageError;

  const roomBg = useMemo(() => {
    if (atmosphere?.monitorGlow) return "linear-gradient(180deg, #090d16 0%, #0c1020 100%)";
    if (isNight) return "linear-gradient(180deg, #0a0a10 0%, #0d0d14 100%)";
    return "linear-gradient(180deg, #141220 0%, #100e1c 100%)";
  }, [atmosphere, isNight]);

  const monitorGlowPos = useMemo(() => {
    const crtItem = room?.items?.find((i) => i.type === "crt");
    return crtItem ? { left: `${crtItem.positionX}%`, top: `${crtItem.positionY}%` } : { left: "28%", top: "45%" };
  }, [room?.items]);

  return (
    <>
      <ReconstructionCinematic active={rebuilding} era={detectedEra || era.label} />

    <motion.div variants={stagger(0.06)} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeUp}>
        <GlassCard variant="strong" className="p-6">
          <div className="text-xs uppercase tracking-[0.3em] text-white/45">Habitación digital</div>
          <h1 className="mt-2 font-display text-3xl text-glow md:text-4xl">Tu cuarto online</h1>
          <p className="mt-2 max-w-2xl text-white/70">
            Posters, monitor CRT, una lámpara cálida y la persiana medio cerrada. Arrastra los
            objetos para moverlos, añade nuevos o deja que la IA reconstruya tu adolescencia.
          </p>
        </GlassCard>
      </motion.div>

      {/* Canvas de la habitación */}
      <motion.div variants={fadeUp}>
        <GlassCard variant="strong" crt className="overflow-hidden p-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2">
            <div className="flex items-center gap-2 text-xs text-white/55">
              <span className="chip">Ambiente: {ambient}</span>
              {room?.musicTheme && <span className="chip">🎵 {room.musicTheme}</span>}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={load} disabled={loading} className="btn-ghost text-xs">
                <RefreshCcw size={13} className={loading ? "animate-spin" : ""} /> recargar
              </button>
              <button
                onClick={() => setEditMode((v) => !v)}
                className={`btn-ghost text-xs transition-colors ${
                  editMode ? "text-[var(--era-accent)]" : ""
                }`}
              >
                {editMode ? <><Check size={13} /> listo</> : <><Pencil size={13} /> editar</>}
              </button>
            </div>
          </div>

          {/* Canvas */}
          <div
            ref={containerRef}
            className="relative h-[420px] w-full overflow-hidden md:h-[520px]"
            style={{
              background: roomBg,
              filter: atmosphere ? `contrast(${atmosphere.contrast})` : undefined,
            }}
          >
            {/* ── Emotional return: atmospheric reveal overlay ── */}
            {hasRoomImage && (
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: "radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.92) 100%)",
                  opacity: roomRevealed ? 0 : 1,
                  transition: "opacity 2.2s ease",
                  zIndex: 20,
                }}
              />
            )}

            {/* ── DALL-E generated image (primary) — parallax layer 0 ── */}
            {hasRoomImage ? (
              <img
                src={room!.background!}
                onError={() => setImageError(true)}
                onLoad={() => { setTimeout(() => setRoomRevealed(true), 120); }}
                className="absolute inset-0 h-full w-full object-cover"
                style={{
                  zIndex: 1,
                  opacity: editMode ? 0.45 : 1,
                  transition: "opacity 0.4s",
                  transform: `scale(1.06) translate(${parallax.x * -18}px, ${parallax.y * -12}px)`,
                  willChange: "transform",
                }}
                alt="Habitación generada"
              />
            ) : (
              <>
                {/* CSS fallback: wall + floor */}
                <div className="pointer-events-none absolute inset-x-0 top-0" style={{ height: "62%", background: "rgba(255,255,255,0.015)" }} />
                <div className="pointer-events-none absolute inset-x-0" style={{ top: "62%", height: 2, background: "rgba(255,255,255,0.04)" }} />
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0"
                  style={{
                    height: "38%",
                    background: "linear-gradient(180deg, #080810, #050508)",
                    backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.018) 0 1px, transparent 1px 44px)",
                  }}
                />
                {/* Monitor glow (CSS mode only) */}
                {atmosphere?.monitorGlow && (
                  <div
                    className="pointer-events-none absolute"
                    style={{
                      ...monitorGlowPos,
                      width: 280, height: 280,
                      transform: "translate(-50%, -50%)",
                      background: `radial-gradient(ellipse, ${profile?.glowColor ?? "rgba(20,70,210,0.28)"} 0%, transparent 68%)`,
                      filter: "blur(32px)",
                      zIndex: 0,
                    }}
                  />
                )}
              </>
            )}

            {/* ── Breathing warmth (slow emotional tint oscillation) ── */}
            {profile && (
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: profile.warmthOverlay,
                  opacity: 0.028 + breathValue * 0.032 * profile.breathingDepth,
                  zIndex: 2,
                  transition: "opacity 1.5s ease",
                }}
              />
            )}

            {/* ── DNA ambient glow (emotional light source) ── */}
            <div
              className="pointer-events-none absolute"
              style={{
                left: "50%", top: "52%",
                width: 460, height: 340,
                transform: "translate(-50%, -50%)",
                background: `radial-gradient(ellipse, ${profile?.glowColor ?? "rgba(40,60,200,0.14)"} 0%, transparent 70%)`,
                opacity: profile
                  ? (0.45 + breathValue * 0.38 * profile.glowIntensity) * (hasRoomImage ? 0.4 : 1)
                  : 0.22,
                filter: "blur(48px)",
                zIndex: 3,
              }}
            />

            {/* CRT grain (always) */}
            {atmosphere?.crtGrain && (
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  opacity: profile?.noiseLevel ?? 0.045,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                  backgroundSize: "120px 120px",
                  zIndex: 10,
                }}
              />
            )}
            {/* Vignette (always — depth driven by DNA profile) */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: `radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,${profile?.vignetteStrength ?? atmosphere?.vignette ?? 0.6}) 100%)`,
                zIndex: 11,
              }}
            />

            {/* ── Ambient memory whisper ── */}
            <AnimatePresence>
              {whisper && !editMode && (
                <motion.div
                  key={whisper}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 2.8, ease: "easeInOut" }}
                  className="pointer-events-none absolute bottom-7 left-0 right-0 px-10 text-center"
                  style={{ zIndex: 13 }}
                >
                  <p className="text-[10px] italic tracking-widest text-white/28">
                    {whisper}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* CSS items — always in edit mode, only when no image in view mode */}
            {(!hasRoomImage || editMode) && (room?.items ?? []).map((item) => (
              <DraggableRoomItem
                key={item.id}
                item={item}
                editMode={editMode}
                containerRef={containerRef}
                onMove={handleMove}
                onDelete={handleDelete}
              />
            ))}

            {/* Expired image notice */}
            {imageError && (
              <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 12 }}>
                <div className="rounded-xl border border-white/10 bg-black/60 px-5 py-3 text-center text-xs text-white/50 backdrop-blur">
                  La imagen de la habitación ha expirado.
                  <br />
                  <span className="cursor-pointer text-white/70 underline" onClick={rebuild}>Regenerar</span>
                </div>
              </div>
            )}

            {/* Estado vacío */}
            {(!room?.items || room.items.length === 0) && !loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-2xl border border-white/10 bg-black/40 px-6 py-4 text-center text-sm text-white/70 backdrop-blur">
                  Tu habitación está vacía.{" "}
                  <span
                    className="cursor-pointer text-white underline"
                    onClick={() => setEditMode(true)}
                  >
                    Pulsa editar
                  </span>{" "}
                  para añadir objetos o usa la IA abajo.
                </div>
              </div>
            )}

            {/* Indicador modo edición */}
            <AnimatePresence>
              {editMode && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="pointer-events-none absolute left-3 top-3 rounded-full border border-white/15 bg-black/55 px-3 py-1 text-[11px] text-white/70 backdrop-blur"
                >
                  ✏️ Arrastra para mover · ✕ en el objeto para eliminar
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Panel añadir objetos — visible solo en modo edición */}
          <AnimatePresence>
            {editMode && (
              <motion.div
                key="add-panel"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-t border-white/[0.06]"
              >
                <div className="px-4 py-3">
                  <p className="mb-2.5 text-[11px] uppercase tracking-widest text-white/40">
                    Añadir objeto
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ITEM_TYPES.filter((t) => !t.spanish).map(({ type, icon, label }) => (
                      <button
                        key={type}
                        onClick={() => handleAdd(type)}
                        disabled={addingType === type}
                        className="chip flex cursor-pointer items-center gap-1.5 px-3 py-1.5 text-sm transition hover:bg-white/15 disabled:opacity-50"
                        title={`Añadir ${label}`}
                      >
                        <span>{icon}</span>
                        <span className="text-[11px] capitalize text-white/70">{label}</span>
                      </button>
                    ))}
                  </div>
                  <p className="mb-2 mt-3 text-[10px] uppercase tracking-widest text-white/25">
                    🇪🇸 Cultura 2000s
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ITEM_TYPES.filter((t) => t.spanish).map(({ type, icon, label }) => (
                      <button
                        key={type}
                        onClick={() => handleAdd(type)}
                        disabled={addingType === type}
                        className="chip flex cursor-pointer items-center gap-1.5 px-3 py-1.5 text-sm transition hover:bg-white/15 disabled:opacity-50"
                        style={{ borderColor: "rgba(255,200,100,0.2)" }}
                        title={`Añadir ${label}`}
                      >
                        <span>{icon}</span>
                        <span className="text-[11px] capitalize text-white/70">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </motion.div>

      {/* Reconstruir con IA */}
      <motion.div variants={fadeUp}>
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-white/50">
            <Wand2 size={14} /> reconstrucción emocional
          </div>
          <p className="mt-2 text-sm text-white/65">
            Describe tu adolescencia digital —canciones, juegos, posters, hábitos online— y la
            IA reconstruirá la sensación exacta de esa habitación.
          </p>
          {room?.nostalgiaData?.narrativeMoment && (
            <p className="mt-3 border-l-2 border-white/10 pl-3 text-xs italic text-white/40">
              {room.nostalgiaData.narrativeMoment}
            </p>
          )}
          <div className="mt-4 border-t border-white/[0.06] pt-4">
            <NostalgiaPacksSection
              onSelect={(prompt) => setReconstructInput(prompt)}
            />
          </div>
          <textarea
            value={reconstructInput}
            onChange={(e) => setReconstructInput(e.target.value)}
            rows={4}
            className="input mt-4"
            placeholder="“Ponía Linkin Park, jugaba al PES en PS2, tenía un póster de Avril Lavigne…”"
          />
          <div className="mt-4 flex items-center justify-between gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-xs text-white/45 select-none">
              <input
                type="checkbox"
                checked={forceImage}
                onChange={(e) => setForceImage(e.target.checked)}
                className="h-3.5 w-3.5 accent-white/70"
              />
              Regenerar imagen visual (DALL-E 3)
            </label>
            <button
              onClick={rebuild}
              disabled={rebuilding || !reconstructInput.trim()}
              className="btn-primary text-xs"
            >
              {rebuilding ? "Reconstruyendo…" : "Reconstruir habitación"}
            </button>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
    </>
  );
}
