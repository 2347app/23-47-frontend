// ============================================================
// 23:47 — Nostalgia Packs — selector visual de packs culturales
// ============================================================

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../services/api";

interface NostalgiaPack {
  id: string;
  name: string;
  description: string;
  yearRange: [number, number];
  region: string;
  season: string;
  timeOfDay: string;
  ambientDimensions: Record<string, string>;
}

interface Props {
  onSelect: (prompt: string, packName: string) => void;
}

const PACK_GRADIENTS: Record<string, string> = {
  spanish_summer_2004:   "linear-gradient(135deg, #7a3a00, #2a1400)",
  msn_teenager_2007:     "linear-gradient(135deg, #001a4a, #000a20)",
  cyber_cafe_2003:       "linear-gradient(135deg, #0a2a00, #041200)",
  tuenti_era_2009:       "linear-gradient(135deg, #1a0a2e, #08041a)",
  ps2_football_nights:   "linear-gradient(135deg, #00102a, #000814)",
  emo_bedroom_2006:      "linear-gradient(135deg, #1a0000, #0a0000)",
  latin_messenger_nights:"linear-gradient(135deg, #2a1a00, #180e00)",
};

const PACK_BORDER: Record<string, string> = {
  spanish_summer_2004:   "rgba(255, 160, 60, 0.25)",
  msn_teenager_2007:     "rgba(60, 120, 255, 0.25)",
  cyber_cafe_2003:       "rgba(60, 200, 60, 0.2)",
  tuenti_era_2009:       "rgba(140, 80, 255, 0.25)",
  ps2_football_nights:   "rgba(60, 120, 255, 0.2)",
  emo_bedroom_2006:      "rgba(180, 0, 0, 0.25)",
  latin_messenger_nights:"rgba(255, 180, 0, 0.2)",
};

const PACK_PROMPTS: Record<string, string> = {
  spanish_summer_2004:
    "Andalucía, verano 2004. Tarde de agosto, calor brutal, persiana bajada. El ventilador girando. Dragon Ball Z de fondo en la tele. PS2 encendida, mesa con bocadillo de mortadela. Fondo Flamenco sonando en la calle. Messenger cerrado porque pagabas por horas.",
  msn_teenager_2007:
    "Madrid, 2007, madrugada de martes. Solo en casa. Messenger abierto, fondo de pantalla en negro, Linkin Park de fondo. Escribiendo estados con frases de canciones. El Internado recién acabado. Fotolog actualizado. Todo en silencio excepto el ventilador del PC.",
  cyber_cafe_2003:
    "Cyber café del barrio, 2003, miércoles tarde. Counter-Strike 1.6. Sillas giratorias. Humo aunque no esté permitido. eMule bajando de noche. Nokia 3310 en el bolsillo. Un euro la hora. Los colegas gritando en la partida de al lado.",
  tuenti_era_2009:
    "2009. Tuenti es lo único que importa. Habitación de noche, iPhone imposible, portátil de segunda mano. El Internado en temporada final. Guitar Hero en la PS2 de tu hermano. Twitter que nadie entiende todavía. Crisis económica que no entiendes pero se nota.",
  ps2_football_nights:
    "Noche de viernes, 2005, casa de un colega. PS2, PES 5. Turno por el mando. GTA San Andreas antes de dormir. Messenger en el PC de fondo. Llamadas en el Nokia. Nadie tiene smartphones. La noche parece infinita.",
  emo_bedroom_2006:
    "2006, habitación oscura. Linkin Park, MCR, Rammstein. Fondo de escritorio negro. Fotolog con filtro oscuro y frase de Numb. MSN con nick con asteriscos. El Canto del Loco que ya no mola pero igual lo escuchas. Estado emocional complejo a los 14 años.",
  latin_messenger_nights:
    "Sur de España, verano de madrugada, 2007. Calor que no baja. Ventilador puesto. Messenger con todos activos a las 2am. Politonos de reggaeton por Bluetooth. Fondo Flamenco en el móvil. Fotos del chiringuito en el Fotolog. Ese verano que recuerdas diferente.",
};

function seasonEmoji(season: string) {
  return { summer: "☀️", winter: "❄️", spring: "🌸", autumn: "🍂", any: "🌙" }[season] ?? "🌙";
}

function regionLabel(region: string) {
  return {
    south_spain: "Sur de España", madrid: "Madrid",
    catalonia: "Cataluña", north_spain: "Norte", universal: "España",
  }[region] ?? region;
}

export function NostalgiaPacksSection({ onSelect }: Props) {
  const [packs, setPacks] = useState<NostalgiaPack[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api.get("/ai/nostalgia-packs")
      .then(({ data }) => setPacks(data.packs ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!packs.length && !loading) return null;

  return (
    <div>
      <button
        className="flex w-full items-center justify-between text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-white/35">
          Nostalgia Packs
        </span>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-[10px] text-white/25"
        >
          ▾
        </motion.span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="mt-2 text-[11px] text-white/40 italic">
              Selecciona una época. El sistema pre-cargará el contexto cultural completo.
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {packs.map((pack) => (
                <motion.button
                  key={pack.id}
                  onHoverStart={() => setHovered(pack.id)}
                  onHoverEnd={() => setHovered(null)}
                  onClick={() => {
                    onSelect(PACK_PROMPTS[pack.id] ?? pack.description, pack.name);
                    setExpanded(false);
                  }}
                  className="group relative overflow-hidden rounded-xl p-4 text-left transition-all"
                  style={{
                    background: PACK_GRADIENTS[pack.id] ?? "rgba(255,255,255,0.03)",
                    border: `1px solid ${PACK_BORDER[pack.id] ?? "rgba(255,255,255,0.08)"}`,
                  }}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  {/* Year badge */}
                  <div className="mb-2 flex items-center gap-1.5">
                    <span className="text-sm">{seasonEmoji(pack.season)}</span>
                    <span className="rounded-full bg-white/8 px-2 py-0.5 text-[9px] uppercase tracking-widest text-white/45">
                      {pack.yearRange[0]}–{pack.yearRange[1]}
                    </span>
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[9px] text-white/30">
                      {regionLabel(pack.region)}
                    </span>
                  </div>

                  {/* Name */}
                  <div className="font-display text-sm text-white/85">{pack.name}</div>

                  {/* Description */}
                  <div className="mt-1 line-clamp-2 text-[11px] italic text-white/45">
                    {pack.description}
                  </div>

                  {/* Apply hint */}
                  <AnimatePresence>
                    {hovered === pack.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-2 text-[10px] text-white/35"
                      >
                        Aplicar este pack →
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Ambient glow on hover */}
                  {hovered === pack.id && (
                    <motion.div
                      className="pointer-events-none absolute inset-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{
                        background: `radial-gradient(ellipse at 20% 50%, ${PACK_BORDER[pack.id] ?? "rgba(255,255,255,0.05)"} 0%, transparent 70%)`,
                      }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
