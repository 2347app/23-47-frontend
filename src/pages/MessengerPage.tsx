import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { ArrowLeft, MessageSquareHeart, Moon, Radio, Sparkles } from "lucide-react";
import { FriendList } from "../features/messenger/FriendList";
import { ChatWindow } from "../features/messenger/ChatWindow";
import { GlassCard } from "../components/GlassCard";
import { ActivityFeed } from "../features/presence/ActivityFeed";
import { useRoomsStore } from "../store/rooms.store";
import { useEraStore } from "../store/era.store";
import { useNightMode } from "../hooks/useNightMode";

const EMOTIONAL_STATES = [
  { v: "🌙 Demasiado tarde para dormir", short: "🌙 Tarde" },
  { v: "🌧️ Escuchando lluvia",           short: "🌧️ Lluvia" },
  { v: "💿 Reviviendo 2007",             short: "💿 2007" },
  { v: "🟢 Conectado desde la oscuridad", short: "🟢 Oscuridad" },
  { v: "📼 Modo nostalgia activado",      short: "📼 Nostalgia" },
  { v: "☕ Café y silencio",              short: "☕ Silencio" },
];

function MessengerRightPanel() {
  const era = useEraStore((s) => s.currentEra);
  const isNight = useNightMode();
  const activeSlug = useRoomsStore((s) => s.activeSlug);
  const members = useRoomsStore((s) => s.members);
  const roomCount = activeSlug ? (members[activeSlug]?.length ?? 0) : 0;

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto">
      {/* Era atmosférica */}
      <GlassCard className="p-4">
        <div className="mb-2 text-[10px] uppercase tracking-[0.25em] text-white/35">Atmósfera</div>
        <div className="flex items-center gap-2">
          <span className="text-lg">{era.emoji}</span>
          <div>
            <div className="text-sm font-medium">{era.label}</div>
            <div className="text-[11px] text-white/45">{era.description}</div>
          </div>
        </div>
        {isNight && (
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-white/50">
            <Moon size={11} />
            <span>Modo madrugada activo</span>
          </div>
        )}
      </GlassCard>

      {/* Sala activa */}
      {activeSlug && (
        <GlassCard className="p-4">
          <div className="mb-2 text-[10px] uppercase tracking-[0.25em] text-white/35">Sala activa</div>
          <div className="flex items-center gap-1.5 text-sm text-white/70">
            <Radio size={12} />
            <span className="capitalize">{activeSlug.replace(/-/g, " ")}</span>
          </div>
          <div className="mt-1 text-[11px] text-white/40">
            {roomCount} {roomCount === 1 ? "persona" : "personas"} aquí ahora
          </div>
        </GlassCard>
      )}

      {/* Estados emocionales */}
      <GlassCard className="p-4">
        <div className="mb-2 text-[10px] uppercase tracking-[0.25em] text-white/35">Tu estado</div>
        <div className="flex flex-col gap-1">
          {EMOTIONAL_STATES.map((s) => (
            <button
              key={s.v}
              className="rounded-lg px-2 py-1.5 text-left text-[11px] text-white/55 transition-all duration-200 hover:bg-white/[0.05] hover:text-white/85"
            >
              {s.short}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Actividad en tiempo real */}
      <GlassCard className="p-4">
        <div className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-white/35">
          <Sparkles size={10} />
          <span>En vivo</span>
        </div>
        <ActivityFeed max={5} />
      </GlassCard>
    </div>
  );
}

export function MessengerPage() {
  const [activePeerId, setActivePeerId] = useState<string | null>(null);

  return (
    <div className="grid h-[calc(100vh-160px)] min-h-[560px] grid-cols-1 gap-4 md:grid-cols-[300px_1fr] xl:grid-cols-[300px_1fr_240px]">
      {/* Left — Friend list */}
      <div
        className={clsx(
          "min-h-0 md:block",
          activePeerId ? "hidden md:block" : "block"
        )}
      >
        <FriendList activePeerId={activePeerId} onSelect={(id) => setActivePeerId(id)} />
      </div>

      {/* Center — Chat */}
      <div
        className={clsx(
          "min-h-0",
          activePeerId ? "block" : "hidden md:block"
        )}
      >
        <AnimatePresence mode="wait">
          {activePeerId ? (
            <motion.div
              key={activePeerId}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <div className="mb-2 md:hidden">
                <button onClick={() => setActivePeerId(null)} className="btn-ghost text-xs">
                  <ArrowLeft size={14} /> Amigos
                </button>
              </div>
              <ChatWindow peerId={activePeerId} />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex h-full items-center justify-center"
            >
              <GlassCard variant="strong" className="max-w-md p-8 text-center">
                <MessageSquareHeart size={28} className="mx-auto opacity-70" />
                <h2 className="mt-3 font-display text-xl">Elige a alguien</h2>
                <p className="mt-2 text-sm text-white/65">
                  Selecciona un amigo para abrir una conversación.<br />
                  Cuando empiece a escribir, lo verás aquí en directo.
                </p>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right — Info panel (xl only) */}
      <div className="hidden min-h-0 xl:block">
        <MessengerRightPanel />
      </div>
    </div>
  );
}
