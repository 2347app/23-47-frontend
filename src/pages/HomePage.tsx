import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Clock4, MessageSquare, Sofa, ArrowRight, Radio } from "lucide-react";
import { GlassCard } from "../components/GlassCard";
import { MusicWidget } from "../features/music/MusicWidget";
import { EraSelector } from "../features/era/EraSelector";
import { ActivityFeed } from "../features/presence/ActivityFeed";
import { MemoryTimeline } from "../features/memories/MemoryTimeline";
import { useAuthStore } from "../store/auth.store";
import { useEraStore } from "../store/era.store";
import { useNightMode } from "../hooks/useNightMode";
import { useRoomsStore } from "../store/rooms.store";
import { api } from "../services/api";
import { fadeUp, stagger } from "../animations/variants";

interface NostalgiaResp {
  message: string;
  suggestedEra: string;
  mood: string;
  micro: string[];
}

export function HomePage() {
  const user = useAuthStore((s) => s.user);
  const era = useEraStore((s) => s.currentEra);
  const isNight = useNightMode();
  const totalOnline = useRoomsStore((s) => s.totalOnline());
  const [nostalgia, setNostalgia] = useState<NostalgiaResp | null>(null);
  const [loadingNos, setLoadingNos] = useState(false);

  const askNostalgia = async () => {
    setLoadingNos(true);
    try {
      const { data } = await api.post("/ai/nostalgia-recommendations", {
        hour: new Date().getHours(),
        mood: user?.currentMood ?? undefined,
      });
      setNostalgia(data);
    } finally {
      setLoadingNos(false);
    }
  };

  useEffect(() => {
    askNostalgia();
  }, []);

  const greeting = isNight
    ? "Son las 23:47. El momento es tuyo."
    : new Date().getHours() < 12
    ? "Buenos días — ¿en qué momento quieres estar hoy?"
    : new Date().getHours() < 19
    ? "Buenas tardes. Elige tu momento."
    : "Buenas noches. El internet de siempre te espera.";

  return (
    <motion.div variants={stagger(0.08)} initial="hidden" animate="visible" className="space-y-6">
      {/* Hero card */}
      <motion.div variants={fadeUp}>
        <GlassCard variant="strong" className="overflow-hidden p-0">
          <div
            className="relative px-6 py-7 md:px-9 md:py-9"
            style={{
              background: `radial-gradient(900px 220px at 80% -20%, ${era.palette.accent}30, transparent 70%)`,
            }}
          >
            <div className="text-xs uppercase tracking-[0.3em] text-white/45">{greeting}</div>
            <h1 className="mt-2 font-display text-3xl text-glow md:text-5xl">
              Hola, {user?.displayName ?? "amigo"}.
            </h1>
            <p className="mt-2 max-w-xl text-sm text-white/70 md:text-base">
              Momento activo: <span className="text-white">{era.label}</span>. {era.description}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link to="/app/messenger" className="btn-primary text-xs">
                <MessageSquare size={14} /> Abrir Messenger
              </Link>
              <Link to="/app/rooms" className="btn-ghost text-xs">
                <Radio size={14} /> Salas
                {totalOnline > 0 && (
                  <span
                    className="ml-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                    style={{ background: "rgba(255,255,255,0.15)" }}
                  >
                    {totalOnline}
                  </span>
                )}
              </Link>
              <Link to="/app/eras" className="btn-ghost text-xs">
                <Clock4 size={14} /> Épocas
              </Link>
              <Link to="/app/room" className="btn-ghost text-xs">
                <Sofa size={14} /> Habitación
              </Link>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* IA emocional */}
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-white/50">
              <Sparkles size={14} /> 23:47 te sugiere
            </div>
            {nostalgia ? (
              <>
                <p className="mt-3 font-display text-2xl text-white md:text-3xl">
                  “{nostalgia.message}”
                </p>
                <div className="mt-2 text-xs text-white/55">
                  Mood sugerido: <span className="text-white/80">{nostalgia.mood}</span> · Época:{" "}
                  <span className="text-white/80">{nostalgia.suggestedEra.replace(/-/g, " ")}</span>
                </div>
                <ul className="mt-5 space-y-2 text-sm text-white/75">
                  {nostalgia.micro?.map((m) => (
                    <li key={m} className="flex items-start gap-2">
                      <ArrowRight size={14} className="mt-1 shrink-0 text-white/40" />
                      {m}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="mt-3 text-sm text-white/60">
                {loadingNos ? "Consultando a la IA…" : "Pide una recomendación cuando quieras."}
              </p>
            )}
            <div className="mt-5 flex gap-2">
              <button onClick={askNostalgia} disabled={loadingNos} className="btn-ghost text-xs">
                {loadingNos ? "Pensando…" : "Otra recomendación"}
              </button>
            </div>
          </GlassCard>
        </motion.div>

        {/* Spotify + Presence */}
        <motion.div variants={fadeUp} className="space-y-4">
          <div className="text-xs uppercase tracking-[0.28em] text-white/50">Música</div>
          <MusicWidget />

          {/* Presence — salas en vivo */}
          <GlassCard className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-[10px] uppercase tracking-[0.25em] text-white/35">Salas en vivo</div>
              <Link to="/app/rooms" className="text-[10px] text-white/40 hover:text-white/70 transition-colors">
                Ver todas →
              </Link>
            </div>
            <ActivityFeed max={4} />
          </GlassCard>
        </motion.div>
      </div>

      {/* Recuerdos / Memories */}
      <motion.div variants={fadeUp} className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-[0.28em] text-white/50">Mis recuerdos</div>
          <span className="text-[10px] text-white/30 italic">Cada época visitada queda guardada</span>
        </div>
        <MemoryTimeline limit={5} />
      </motion.div>

      {/* Selector épocas */}
      <motion.div variants={fadeUp} className="space-y-3">
        <div className="text-xs uppercase tracking-[0.28em] text-white/50">Viaja a un momento</div>
        <EraSelector compact />
      </motion.div>
    </motion.div>
  );
}
