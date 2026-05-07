import { motion } from "framer-motion";
import clsx from "clsx";
import { ERAS, useEraStore } from "../../store/era.store";
import { stagger, fadeUp } from "../../animations/variants";
import { GlassCard } from "../../components/GlassCard";
import { SFX } from "../../audio/soundManager";
import { api } from "../../services/api";
import { getSocket } from "../../websocket/socket";
import { useAuthStore } from "../../store/auth.store";
import toast from "react-hot-toast";

export function EraSelector({ compact = false }: { compact?: boolean }) {
  const setEra = useEraStore((s) => s.setEra);
  const current = useEraStore((s) => s.currentEra);
  const token = useAuthStore((s) => s.accessToken);

  const onPick = async (id: string) => {
    setEra(id);
    SFX.era();
    if (token) {
      try {
        await api.post("/eras/travel", { era: id });
        const socket = getSocket(token);
        socket?.emit("era:change", { era: id });
        toast.success(`Entrando en ${id.replace(/-/g, " ")}`, { icon: "⏳" });
      } catch {
        /* offline ok */
      }
    }
  };

  return (
    <motion.div
      variants={stagger(0.05)}
      initial="hidden"
      animate="visible"
      className={clsx(
        "grid gap-3",
        compact ? "grid-cols-2 md:grid-cols-5" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      )}
    >
      {ERAS.map((era) => {
        const active = era.id === current.id;
        return (
          <motion.button
            key={era.id}
            variants={fadeUp}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onPick(era.id)}
            className="text-left"
          >
            <GlassCard
              variant={active ? "strong" : "default"}
              glow={active}
              className={clsx(
                "p-4 transition-all duration-500",
                compact ? "min-h-[110px]" : "min-h-[180px]"
              )}
              style={{
                background: active
                  ? `linear-gradient(135deg, ${era.palette.accent}20, ${era.palette.glow}10)`
                  : undefined,
                borderColor: active ? `${era.palette.accent}55` : undefined,
              }}
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl drop-shadow">{era.emoji}</span>
                <span
                  className="chip"
                  style={{ borderColor: `${era.palette.accent}55`, color: era.palette.glow }}
                >
                  {era.year}
                </span>
              </div>
              <div className="mt-2 font-display text-lg text-white">{era.label}</div>
              {!compact && (
                <p className="mt-1 text-xs leading-relaxed text-white/60">{era.description}</p>
              )}
              {!compact && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {era.references.slice(0, 3).map((r) => (
                    <span key={r} className="chip">
                      {r}
                    </span>
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
