import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Sparkles } from "lucide-react";
import { GlassCard } from "../../components/GlassCard";
import { api } from "../../services/api";
import { fadeUp, stagger } from "../../animations/variants";

interface Memory {
  id: string;
  era: string;
  mood?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

const KEYWORD_EMOJI: [string, string][] = [
  ["lluvia", "🌧️"], ["rain", "🌧️"],
  ["verano", "☀️"], ["summer", "☀️"],
  ["madrugada", "🌙"], ["noche", "🌙"], ["midnight", "🌙"],
  ["messenger", "💬"], ["otoño", "🍂"], ["navidad", "❄️"],
  ["tarde", "🌇"], ["amanecer", "🌅"],
];

function eraDisplay(era: string): { label: string; emoji: string } {
  const label = era.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const lower = era.toLowerCase();
  const found = KEYWORD_EMOJI.find(([k]) => lower.includes(k));
  return { label, emoji: found ? found[1] : "✨" };
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 2)  return "ahora mismo";
  if (m < 60) return `hace ${m} min`;
  if (h < 24) return `hace ${h}h`;
  return `hace ${d}d`;
}

export function MemoryTimeline({ limit = 8 }: { limit?: number }) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get<{ memories: Memory[] }>(`/memories?limit=${limit}`)
      .then(({ data }) => setMemories(data.memories))
      .finally(() => setLoading(false));
  }, [limit]);

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-2xl bg-white/[0.04]" />
        ))}
      </div>
    );
  }

  if (memories.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-white/35 italic">
        Todavía no hay recuerdos guardados. <br />
        Viaja a una época para crear el primero.
      </div>
    );
  }

  return (
    <motion.div variants={stagger(0.06)} initial="hidden" animate="visible" className="space-y-2">
      <AnimatePresence>
        {memories.map((m) => {
          const meta = eraDisplay(m.era);
          const aiSuggestion = m.metadata?.aiSuggestion as string | undefined;
          return (
            <motion.div key={m.id} variants={fadeUp}>
              <GlassCard className="flex items-start gap-3 p-3.5">
                <div
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-base"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  {meta.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white/85">{meta.label}</span>
                    {m.mood && (
                      <span className="chip text-[10px]">{m.mood}</span>
                    )}
                  </div>
                  {aiSuggestion && (
                    <p className="mt-0.5 flex items-start gap-1 text-xs text-white/45 italic">
                      <Sparkles size={10} className="mt-0.5 shrink-0" />
                      {aiSuggestion}
                    </p>
                  )}
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-white/30">
                    <Clock size={9} />
                    {formatRelative(m.createdAt)}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}
