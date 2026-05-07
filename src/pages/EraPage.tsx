import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Wand2, Newspaper, Music2 } from "lucide-react";
import { EraSelector } from "../features/era/EraSelector";
import { GlassCard } from "../components/GlassCard";
import { useEraStore } from "../store/era.store";
import { api } from "../services/api";
import { fadeUp, stagger } from "../animations/variants";
import toast from "react-hot-toast";

interface EraExperience {
  era: string;
  mood: string;
  visualAtmosphere: string;
  recommendedMusic: { artist: string; track: string }[];
  ambientColors: string[];
  nostalgicReferences: string[];
  onlineCultureVibe: string;
  warmTone: string;
}

export function EraPage() {
  const era = useEraStore((s) => s.currentEra);
  const [exp, setExp] = useState<EraExperience | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/ai/era-experience", { era: era.id });
      setExp(data);
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? "No se pudo generar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div variants={stagger(0.08)} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeUp}>
        <GlassCard variant="strong" className="p-6 md:p-8">
          <div className="text-xs uppercase tracking-[0.3em] text-white/45">Sistema de épocas</div>
          <h1 className="mt-2 font-display text-3xl text-glow md:text-5xl">
            Estás en {era.label}.
          </h1>
          <p className="mt-2 max-w-2xl text-white/70">{era.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {era.references.map((r) => (
              <span key={r} className="chip">
                {r}
              </span>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      <motion.div variants={fadeUp}>
        <EraSelector />
      </motion.div>

      <motion.div variants={fadeUp}>
        <GlassCard className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-white/50">
                <Wand2 size={14} /> generación de atmósfera (IA)
              </div>
              <p className="mt-2 text-sm text-white/70">
                Crea una atmósfera emocional única para esta época. La IA propondrá música, mood,
                colores y referencias culturales.
              </p>
            </div>
            <button onClick={generate} disabled={loading} className="btn-primary text-xs">
              {loading ? "Sintetizando…" : "Generar atmósfera"}
            </button>
          </div>

          {exp && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2"
            >
              <GlassCard variant="soft" className="p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-white/50">
                  <Sparkles size={14} /> mood
                </div>
                <div className="mt-2 font-display text-xl">{exp.mood}</div>
                <p className="mt-2 text-sm text-white/70">{exp.visualAtmosphere}</p>
                <p className="mt-3 italic text-white/55">“{exp.warmTone}”</p>
                <div className="mt-3 flex gap-2">
                  {exp.ambientColors.map((c) => (
                    <span
                      key={c}
                      className="h-6 w-6 rounded-full border border-white/15"
                      style={{ background: c }}
                      title={c}
                    />
                  ))}
                </div>
              </GlassCard>

              <GlassCard variant="soft" className="p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-white/50">
                  <Music2 size={14} /> música recomendada
                </div>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {exp.recommendedMusic.map((m, i) => (
                    <li key={i} className="flex items-center gap-2 text-white/80">
                      <span className="text-white/40">·</span>
                      <span className="font-medium">{m.artist}</span>
                      {m.track && <span className="text-white/55">— {m.track}</span>}
                    </li>
                  ))}
                </ul>
              </GlassCard>

              <GlassCard variant="soft" className="p-4 md:col-span-2">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-white/50">
                  <Newspaper size={14} /> cultura online
                </div>
                <p className="mt-2 text-sm text-white/75">{exp.onlineCultureVibe}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {exp.nostalgicReferences.map((r) => (
                    <span key={r} className="chip">
                      {r}
                    </span>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
