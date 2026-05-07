import { motion, AnimatePresence } from "framer-motion";
import { useEraStore } from "../../store/era.store";
import { useNightMode } from "../../hooks/useNightMode";
import { RainCanvas } from "./RainCanvas";
import { StarsCanvas } from "./StarsCanvas";
import { ParticlesCanvas } from "./ParticlesCanvas";

export function Backdrop() {
  const era = useEraStore((s) => s.currentEra);
  const isNight = useNightMode();
  const palette = era.palette;

  return (
    <>
      {/* ── Gradiente base de época — respira lentamente ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={era.id + "-bg"}
          className="pointer-events-none fixed inset-0 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: `
              radial-gradient(ellipse 140% 80% at 75% -5%, ${palette.accent}22, transparent 55%),
              radial-gradient(ellipse 100% 60% at -5% 95%, ${palette.glow}16, transparent 55%),
              radial-gradient(ellipse 60% 40% at 50% 50%, ${palette.accent}08, transparent 70%),
              linear-gradient(180deg, ${palette.bg} 0%, #03050b 100%)
            `,
          }}
        />
      </AnimatePresence>

      {/* ── Capa de respiración — pulso muy lento ── */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-0"
        animate={{
          opacity: [0.4, 0.7, 0.4],
          scale: [1, 1.012, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          background: `radial-gradient(ellipse 80% 50% at 50% 50%, ${palette.accent}0d, transparent 65%)`,
        }}
      />

      {/* ── Viñeta cinematográfica ── */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(0,0,0,0.65) 100%)",
        }}
      />

      {/* ── Gradiente de profundidad inferior ── */}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-0 h-1/3"
        style={{
          background: "linear-gradient(to top, rgba(2,4,10,0.7) 0%, transparent 100%)",
        }}
      />

      {/* ── Partículas / efectos de época ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={era.id + "-particles"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1 }}
          className="pointer-events-none"
        >
          {era.particles === "rain"      && <RainCanvas color={palette.glow} density={280} />}
          {era.particles === "stars"     && <StarsCanvas color={palette.glow} />}
          {era.particles === "snow"      && <ParticlesCanvas mode="snow"      color={palette.glow}   density={130} />}
          {era.particles === "fireflies" && <ParticlesCanvas mode="fireflies" color={palette.glow}   density={65}  />}
          {era.particles === "leaves"    && <ParticlesCanvas mode="leaves"    color={palette.accent} density={45}  />}
          {era.particles === "embers"    && <ParticlesCanvas mode="embers"    color={palette.accent} density={55}  />}
        </motion.div>
      </AnimatePresence>

      {/* ── Overlay de madrugada ── */}
      <AnimatePresence>
        {isNight && (
          <motion.div
            className="pointer-events-none fixed inset-0 z-[1]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4 }}
            style={{
              background:
                "linear-gradient(180deg, rgba(1,2,8,0.45) 0%, rgba(1,2,8,0.82) 100%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Grano de película — animado ── */}
      <div
        className="noise-animated pointer-events-none fixed inset-0 z-[2] opacity-[0.055]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
          backgroundSize: "200px 200px",
        }}
      />

      {/* ── Scanlines finas ── */}
      <div
        className="pointer-events-none fixed inset-0 z-[2] opacity-[0.032]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, rgba(255,255,255,0.6) 3px, transparent 4px)",
        }}
      />

      {/* ── CRT screen overlay: scanline sweep + aberración cromática ── */}
      <div className="crt-screen" aria-hidden />
    </>
  );
}
