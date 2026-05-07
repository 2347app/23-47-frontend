import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, type PanInfo } from "framer-motion";
import { Wand2, RefreshCcw, Pencil, Check, X } from "lucide-react";
import toast from "react-hot-toast";
import { GlassCard } from "../components/GlassCard";
import { api } from "../services/api";
import { useEraStore } from "../store/era.store";
import { fadeUp, stagger } from "../animations/variants";

interface RoomItem {
  id: string;
  type: string;
  positionX: number;
  positionY: number;
  rotation: number;
  scale: number;
  metadata?: any;
}

interface DigitalRoom {
  id: string;
  theme: string;
  background?: string | null;
  musicTheme?: string | null;
  ambient?: string | null;
  items: RoomItem[];
}

const ICONS: Record<string, string> = {
  poster: "🖼️",
  console: "🎮",
  lamp: "🛋️",
  crt: "🖥️",
  plant: "🪴",
  vinyl: "💿",
  photo: "📷",
  computer: "💻",
  phone: "📞",
  bed: "🛏️",
  window: "🪟",
};

const ITEM_TYPES = Object.entries(ICONS).map(([type, icon]) => ({
  type,
  icon,
  label: type.charAt(0).toUpperCase() + type.slice(1),
}));

// --------------- Sub-componente item arrastrable ---------------
function DraggableRoomItem({
  item,
  era,
  editMode,
  containerRef,
  onMove,
  onDelete,
}: {
  item: RoomItem;
  era: any;
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

  const icon = ICONS[item.type] ?? "✨";
  const label: string = item.metadata?.label ?? item.type;

  return (
    <div
      className="absolute"
      style={{
        left: `${item.positionX}%`,
        top: `${item.positionY}%`,
        transform: `translate(-50%, -50%) rotate(${item.rotation ?? 0}deg)`,
        zIndex: editMode ? 10 : 1,
      }}
    >
      <motion.div
        drag={editMode}
        dragMomentum={false}
        dragElastic={0}
        style={{ x, y, cursor: editMode ? "grab" : "default" }}
        whileDrag={{ scale: 1.18, cursor: "grabbing" }}
        onDragEnd={handleDragEnd}
        className="group relative flex flex-col items-center"
        title={label}
      >
        <span
          className="select-none text-4xl drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)] md:text-5xl"
          style={{ filter: `drop-shadow(0 0 12px ${era.palette.accent}66)` }}
        >
          {icon}
        </span>
        <span className="pointer-events-none mt-1 rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white/80 opacity-0 transition group-hover:opacity-100">
          {label}
        </span>
        {editMode && (
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onDelete(item.id)}
            className="absolute -right-3 -top-3 flex h-5 w-5 items-center justify-center rounded-full bg-red-500/80 text-white opacity-0 transition hover:bg-red-500 group-hover:opacity-100"
            title="Eliminar"
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
  const [memories, setMemories] = useState("");
  const [loading, setLoading] = useState(false);
  const [rebuilding, setRebuilding] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [addingType, setAddingType] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/rooms/me");
      setRoom(data.room);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
    setRebuilding(true);
    try {
      await api.post("/ai/rebuild-room", { era: era.id, memories, apply: true });
      toast.success("Tu habitación digital ha sido reconstruida 🌙");
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? "No se pudo reconstruir");
    } finally {
      setRebuilding(false);
    }
  };

  const ambient = room?.ambient ?? era.ambient;

  const bgStyle = useMemo(
    () =>
      ({
        background: `
          radial-gradient(60% 80% at 80% 20%, ${era.palette.accent}55, transparent 60%),
          radial-gradient(60% 60% at 20% 80%, ${era.palette.glow}45, transparent 60%),
          linear-gradient(180deg, ${era.palette.surface}, ${era.palette.bg})
        `,
      }) as React.CSSProperties,
    [era],
  );

  return (
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
            style={bgStyle}
          >
            {/* Suelo simulado */}
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
              style={{ background: `linear-gradient(180deg, transparent, ${era.palette.bg})` }}
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 opacity-30"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0 2px, transparent 2px 24px)",
              }}
            />

            {/* Items arrastrables */}
            {(room?.items ?? []).map((item) => (
              <DraggableRoomItem
                key={item.id}
                item={item}
                era={era}
                editMode={editMode}
                containerRef={containerRef}
                onMove={handleMove}
                onDelete={handleDelete}
              />
            ))}

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
                    {ITEM_TYPES.map(({ type, icon, label }) => (
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
            <Wand2 size={14} /> reconstruye mi adolescencia digital
          </div>
          <p className="mt-2 text-sm text-white/65">
            Cuéntale a la IA un par de recuerdos —canciones, juegos, posters, foros— y
            reconstruirá tu cuarto online en {era.label}.
          </p>
          <textarea
            value={memories}
            onChange={(e) => setMemories(e.target.value)}
            rows={4}
            className="input mt-4"
            placeholder="“Ponía Linkin Park, jugaba al PES en PS2, tenía un póster de Avril Lavigne…”"
          />
          <div className="mt-4 flex justify-end">
            <button onClick={rebuild} disabled={rebuilding} className="btn-primary text-xs">
              {rebuilding ? "Reconstruyendo…" : `Reconstruir en ${era.label}`}
            </button>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
