import { motion, AnimatePresence } from "framer-motion";
import { useEraStore } from "../../store/era.store";
import { useNightMode } from "../../hooks/useNightMode";
import { RainCanvas } from "./RainCanvas";
import { StarsCanvas } from "./StarsCanvas";
import { ParticlesCanvas } from "./ParticlesCanvas";

/**
 * Backdrop reactivo a la época y al modo madrugada.
 * Renderiza el efecto correcto: rain, stars, fireflies, snow, leaves, embers...
 */
export function Backdrop() {
  const era = useEraStore((s) => s.currentEra);
  const isNight = useNightMode();

  const palette = era.palette;

  return (
    <>
      {/* gradiente cinematográfico de fondo */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        style={{
          background: `
            radial-gradient(1200px 600px at 80% -10%, ${palette.accent}25, transparent 60%),
            radial-gradient(900px 500px at -10% 100%, ${palette.glow}18, transparent 60%),
            linear-gradient(180deg, ${palette.bg} 0%, #04060c 100%)
          `,
        }}
      />
      {/* viñeta */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={era.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9 }}
          className="pointer-events-none"
        >
          {era.particles === "rain" && <RainCanvas color={palette.glow} density={260} />}
          {era.particles === "stars" && <StarsCanvas color={palette.glow} />}
          {era.particles === "snow" && <ParticlesCanvas mode="snow" color={palette.glow} density={140} />}
          {era.particles === "fireflies" && (
            <ParticlesCanvas mode="fireflies" color={palette.glow} density={70} />
          )}
          {era.particles === "leaves" && (
            <ParticlesCanvas mode="leaves" color={palette.accent} density={50} />
          )}
          {era.particles === "embers" && (
            <ParticlesCanvas mode="embers" color={palette.accent} density={60} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Overlay nocturno cuando es madrugada */}
      {isNight && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          style={{
            background: "linear-gradient(180deg, rgba(2,4,10,0.5) 0%, rgba(2,4,10,0.85) 100%)",
          }}
        />
      )}

      {/* Película de grano + scanlines tenues */}
      <div
        className="pointer-events-none fixed inset-0 z-[1] opacity-[0.07]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-[1] opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, rgba(255,255,255,0.5) 3px, transparent 4px)",
        }}
      />
    </>
  );
}
