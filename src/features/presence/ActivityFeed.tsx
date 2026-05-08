import { AnimatePresence, motion } from "framer-motion";
import { useRoomsStore } from "../../store/rooms.store";

const ROOM_META: Record<string, { label: string; emoji: string }> = {
  "rainy-2007":    { label: "Lluvia 2007",      emoji: "🌧️" },
  "summer-2003":   { label: "Verano 2003",       emoji: "☀️" },
  "messenger-2006":{ label: "Messenger 2006",    emoji: "💬" },
  "midnight-2009": { label: "Madrugada 2009",    emoji: "🌙" },
};

export function ActivityFeed({ max = 6 }: { max?: number }) {
  const activity = useRoomsStore((s) => s.activity);
  const members  = useRoomsStore((s) => s.members);
  const total    = Object.values(members).reduce((a, m) => a + m.length, 0);
  const recent   = activity.slice(-max).reverse();

  return (
    <div className="space-y-2.5">
      {total > 0 && (
        <div className="text-[11px] text-white/40">
          <span
            className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400/70 align-middle"
            style={{ animation: "breathe 2s ease-in-out infinite" }}
          />
          {total} {total === 1 ? "persona" : "personas"} en salas ahora
        </div>
      )}

      {recent.length === 0 && total === 0 && (
        <div className="text-[11px] text-white/25 italic">
          Las salas están vacías… por ahora.
        </div>
      )}

      <AnimatePresence initial={false}>
        {recent.map((item) => {
          const room = ROOM_META[item.slug];
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="flex items-center gap-1.5 text-[11px] text-white/45"
            >
              <span className="opacity-60">{item.type === "join" ? "→" : "←"}</span>
              <span className="text-white/70">{item.username}</span>
              <span>{item.type === "join" ? "entró en" : "salió de"}</span>
              <span className="text-white/60">
                {room ? `${room.emoji} ${room.label}` : item.slug}
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
