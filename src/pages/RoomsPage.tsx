import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, LogIn, LogOut } from "lucide-react";
import { GlassCard } from "../components/GlassCard";
import { ActivityFeed } from "../features/presence/ActivityFeed";
import { useRoomsStore } from "../store/rooms.store";
import { useAuthStore } from "../store/auth.store";
import { getSocket } from "../websocket/socket";
import { fadeUp, stagger } from "../animations/variants";

const ROOMS = [
  {
    slug: "rainy-2007",
    title: "Lluvia de 2007",
    emoji: "🌧️",
    description: "Bajar el Messenger mientras llueve por la ventana.",
    accent: "#6ea8fe",
  },
  {
    slug: "summer-2003",
    title: "Verano de 2003",
    emoji: "☀️",
    description: "Tardes de Fotolog y 56k sin ningún motivo.",
    accent: "#fbbf24",
  },
  {
    slug: "messenger-2006",
    title: "Messenger 2006",
    emoji: "💬",
    description: "Emoticones, nudges y temas de MSN hasta tarde.",
    accent: "#34d399",
  },
  {
    slug: "midnight-2009",
    title: "Madrugada de 2009",
    emoji: "🌙",
    description: "La noche en que internet parecía más humano.",
    accent: "#818cf8",
  },
];

export function RoomsPage() {
  const token = useAuthStore((s) => s.accessToken);
  const user  = useAuthStore((s) => s.user);
  const { activeSlug, members, join, leave, onPresence } = useRoomsStore();

  const handleJoin = (slug: string) => {
    const socket = getSocket(token);
    if (!socket) return;
    // Optimistically remove self from the previous room before switching
    if (activeSlug && activeSlug !== slug && user) {
      onPresence({ type: "leave", userId: user.id, username: user.username, slug: activeSlug });
    }
    socket.emit("room:join", { slug }, (res: { ok: boolean }) => {
      if (res?.ok) join(slug);
    });
  };

  const handleLeave = (slug: string) => {
    const socket = getSocket(token);
    socket?.emit("room:leave", { slug });
    // Remove self from the room's member list immediately
    if (user) onPresence({ type: "leave", userId: user.id, username: user.username, slug });
    leave();
  };

  // Leave active room when navigating away from the page
  useEffect(() => {
    return () => {
      const { activeSlug: slug } = useRoomsStore.getState();
      const { accessToken, user: u } = useAuthStore.getState();
      if (slug) {
        getSocket(accessToken)?.emit("room:leave", { slug });
        if (u) useRoomsStore.getState().onPresence({ type: "leave", userId: u.id, username: u.username, slug });
        useRoomsStore.getState().leave();
      }
    };
  }, []);

  return (
    <motion.div variants={stagger(0.07)} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp}>
        <div className="text-xs uppercase tracking-[0.3em] text-white/45">Salas atmosféricas</div>
        <h1 className="mt-1 font-display text-3xl text-glow md:text-4xl">
          ¿Dónde quieres estar?
        </h1>
        <p className="mt-2 text-sm text-white/55">
          Entra en una sala y comparte el momento. Hay gente despierta aquí.
        </p>
      </motion.div>

      {/* Room cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {ROOMS.map((room) => {
          const isActive = activeSlug === room.slug;
          const roomMembers = members[room.slug] ?? [];
          const count = roomMembers.length;

          return (
            <motion.div key={room.slug} variants={fadeUp}>
              <GlassCard
                variant={isActive ? "strong" : "default"}
                className="relative overflow-hidden p-5 transition-all duration-500"
                style={{
                  borderColor: isActive ? `${room.accent}40` : undefined,
                  boxShadow: isActive ? `0 0 48px -12px ${room.accent}35` : undefined,
                }}
              >
                {/* Active accent line at top */}
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-px transition-all duration-500"
                  style={{
                    background: isActive
                      ? `linear-gradient(90deg, transparent, ${room.accent}, transparent)`
                      : "rgba(255,255,255,0.05)",
                  }}
                />

                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-2xl">{room.emoji}</div>
                    <h3 className="mt-2 font-display text-lg">{room.title}</h3>
                    <p className="mt-1 text-sm text-white/50">{room.description}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-white/40">
                      <Users size={11} />
                      <span>{count}</span>
                    </div>
                    {isActive ? (
                      <button onClick={() => handleLeave(room.slug)} className="btn-ghost text-xs">
                        <LogOut size={12} /> Salir
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoin(room.slug)}
                        className="btn-primary text-xs"
                        style={{
                          background: `linear-gradient(135deg, ${room.accent}cc, ${room.accent}77)`,
                          color: "#04060c",
                        }}
                      >
                        <LogIn size={12} /> Entrar
                      </button>
                    )}
                  </div>
                </div>

                {/* Members list */}
                <AnimatePresence>
                  {count > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 overflow-hidden border-t border-white/[0.05] pt-3"
                    >
                      <div className="flex flex-wrap gap-1.5">
                        {roomMembers.slice(0, 8).map((m) => (
                          <span key={m.userId} className="chip text-[10px]">
                            {m.username}
                          </span>
                        ))}
                        {count > 8 && (
                          <span className="chip text-[10px]">+{count - 8} más</span>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* Global activity feed */}
      <motion.div variants={fadeUp}>
        <GlassCard className="p-4">
          <div className="mb-3 text-xs uppercase tracking-[0.25em] text-white/35">
            Actividad en tiempo real
          </div>
          <ActivityFeed max={10} />
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
