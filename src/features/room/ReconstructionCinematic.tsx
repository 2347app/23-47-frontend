// ============================================================
// 23:47 — Cinematic Reconstruction Sequence
// Anti-dopamine loading: lento, ritual, emocional
// ============================================================

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
  active: boolean;
  era?: string;
  region?: string;
}

const SEQUENCE = [
  { text: "Estamos reconstruyendo tu recuerdo…", delay: 0 },
  { text: "Analizando tu identidad cultural…", delay: 3200 },
  { text: "Detectando la época y el contexto…", delay: 6200 },
  { text: "Reconstruyendo la atmósfera…", delay: 9200 },
  { text: "Generando la memoria visual…", delay: 12500 },
  { text: "Casi está…", delay: 16000 },
];

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 1,
  duration: Math.random() * 4 + 3,
  delay: Math.random() * 2,
}));

export function ReconstructionCinematic({ active, era, region }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active) {
      setCurrentStep(0);
      setVisible(false);
      return;
    }

    setVisible(true);
    setCurrentStep(0);

    const timers: ReturnType<typeof setTimeout>[] = [];

    SEQUENCE.forEach((step, idx) => {
      const t = setTimeout(() => setCurrentStep(idx), step.delay);
      timers.push(t);
    });

    return () => timers.forEach(clearTimeout);
  }, [active]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="reconstruction"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
          style={{
            background: "radial-gradient(ellipse at 50% 40%, #0c1428 0%, #04060c 100%)",
          }}
        >
          {/* Slow ambient particles */}
          {PARTICLES.map((p) => (
            <motion.div
              key={p.id}
              className="pointer-events-none absolute rounded-full"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
                background: "rgba(255,255,255,0.25)",
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0, 0.4, 0],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Central glow pulse */}
          <motion.div
            className="pointer-events-none absolute"
            style={{
              width: 320,
              height: 320,
              borderRadius: "50%",
              background: "radial-gradient(ellipse, rgba(20,60,180,0.18) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center gap-8 px-8 text-center">

            {/* Era/region badge */}
            {(era || region) && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 1 }}
                className="rounded-full px-4 py-1.5 text-[10px] uppercase tracking-[0.3em]"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.45)",
                }}
              >
                {[era, region].filter(Boolean).join(" · ")}
              </motion.div>
            )}

            {/* Sequential text */}
            <div className="relative h-12 w-full max-w-sm">
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 1.1, ease: [0.25, 0, 0, 1] }}
                  className="absolute inset-x-0 text-center font-display text-lg text-white/75 md:text-xl"
                  style={{ fontStyle: "italic" }}
                >
                  "{SEQUENCE[currentStep]?.text}"
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Slow breathing dots */}
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="h-1 w-1 rounded-full bg-white/30"
                  animate={{ opacity: [0.2, 0.7, 0.2], scale: [0.8, 1.2, 0.8] }}
                  transition={{
                    duration: 2.4,
                    delay: i * 0.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>

            {/* Thin progress bar — very slow, intentional */}
            <div
              className="h-px w-48 overflow-hidden rounded-full"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.2), rgba(255,255,255,0.5))" }}
                initial={{ width: "0%" }}
                animate={{ width: active ? "85%" : "100%" }}
                transition={{
                  duration: active ? 18 : 0.5,
                  ease: active ? [0.1, 0, 0.3, 1] : "easeOut",
                }}
              />
            </div>
          </div>

          {/* Corner timestamp */}
          <div
            className="absolute bottom-8 font-mono text-[10px] tracking-widest"
            style={{ color: "rgba(255,255,255,0.15)" }}
          >
            23:47 · reconstruyendo memoria
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
