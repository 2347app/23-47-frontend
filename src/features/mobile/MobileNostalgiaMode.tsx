// ============================================================
// 23:47 — Mobile Nostalgia Mode
// Fase 7: cápsula nocturna personal para móvil
// UI mínima · memories flotantes · glow CRT · anti-dopamina
// ============================================================

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { api } from "../../services/api";

interface AmbientMemory {
  id: string;
  icon: string;
  text: string;
  intensity: number;
}

const RAIN_DROPS = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  delay: Math.random() * 2.5,
  duration: Math.random() * 1.2 + 0.8,
  opacity: Math.random() * 0.25 + 0.05,
  height: Math.random() * 14 + 8,
}));

function RainCanvas() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {RAIN_DROPS.map((d) => (
        <motion.div
          key={d.id}
          className="absolute w-px rounded-full"
          style={{
            left: `${d.x}%`,
            top: "-20px",
            height: d.height,
            background: "rgba(180,210,255,0.6)",
            opacity: d.opacity,
          }}
          animate={{ y: ["0vh", "110vh"] }}
          transition={{
            duration: d.duration,
            delay: d.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

function CrtGlow() {
  return (
    <>
      {/* Scanlines */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.12) 3px, rgba(0,0,0,0.12) 4px)",
          zIndex: 2,
        }}
      />
      {/* CRT vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(0,0,0,0.7) 100%)",
          zIndex: 3,
        }}
      />
      {/* Central screen glow */}
      <div
        className="pointer-events-none absolute"
        style={{
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "70vw", height: "70vw",
          background: "radial-gradient(ellipse, rgba(20,50,180,0.12) 0%, transparent 70%)",
          filter: "blur(30px)",
          zIndex: 1,
        }}
      />
    </>
  );
}

function FloatingMemory({ memory, y }: { memory: AmbientMemory; y: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ duration: 2.2, ease: [0.25, 0, 0, 1] }}
      className="absolute left-0 right-0 px-8 text-center"
      style={{ top: `${y}%`, zIndex: 10 }}
    >
      <p
        className="text-sm italic leading-relaxed"
        style={{ color: "rgba(255,255,255,0.45)", textShadow: "0 0 20px rgba(100,150,255,0.3)" }}
      >
        <span className="mr-1 not-italic">{memory.icon}</span>
        {memory.text}
      </p>
    </motion.div>
  );
}

export function MobileNostalgiaMode() {
  const [active, setActive] = useState(false);
  const [memories, setMemories] = useState<AmbientMemory[]>([]);
  const [currentMemory, setCurrentMemory] = useState<AmbientMemory | null>(null);
  const [memoryY, setMemoryY] = useState(42);
  const usedRef = useRef<Set<string>>(new Set());
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  // Fetch ambient memories
  useEffect(() => {
    if (!active) return;
    const hour = new Date().getHours();
    api.get(`/ai/cultural-memories?hour=${hour}&count=6`)
      .then(({ data }) => setMemories(data.memories ?? []))
      .catch(() => {});
  }, [active]);

  // Cycle through memories every ~12s
  useEffect(() => {
    if (!active || memories.length === 0) return;

    const show = () => {
      const available = memories.filter((m) => !usedRef.current.has(m.id));
      const pool = available.length > 0 ? available : memories;
      if (pool.length === 0) return;

      const pick = pool[Math.floor(Math.random() * pool.length)];
      usedRef.current.add(pick.id);
      if (usedRef.current.size >= memories.length) usedRef.current.clear();

      setCurrentMemory(pick);
      setMemoryY(30 + Math.random() * 35);

      setTimeout(() => setCurrentMemory(null), 7000);
    };

    show();
    const interval = setInterval(show, 12000);
    return () => clearInterval(interval);
  }, [active, memories]);

  // Only show toggle on mobile
  if (!isMobile) return null;

  return (
    <>
      {/* Trigger button — small, non-intrusive */}
      <AnimatePresence>
        {!active && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(true)}
            className="fixed bottom-24 right-4 z-40 flex h-10 w-10 items-center justify-center rounded-full"
            style={{
              background: "rgba(4,6,12,0.8)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(12px)",
              fontSize: 18,
            }}
            title="Modo nocturno"
          >
            🌙
          </motion.button>
        )}
      </AnimatePresence>

      {/* Fullscreen emotional overlay */}
      <AnimatePresence>
        {active && (
          <motion.div
            key="mobile-nostalgia"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4 }}
            className="fixed inset-0 z-50 overflow-hidden"
            style={{ background: "radial-gradient(ellipse at 50% 30%, #0c1428 0%, #04060c 100%)" }}
          >
            <RainCanvas />
            <CrtGlow />

            {/* Floating memory */}
            <AnimatePresence mode="wait">
              {currentMemory && (
                <FloatingMemory
                  key={currentMemory.id}
                  memory={currentMemory}
                  y={memoryY}
                />
              )}
            </AnimatePresence>

            {/* Central 23:47 mark */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-6"
              style={{ zIndex: 8 }}
            >
              <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="font-mono text-4xl font-bold tracking-[0.4em]"
                style={{
                  color: "rgba(255,255,255,0.7)",
                  textShadow: "0 0 40px rgba(60,120,255,0.4)",
                }}
              >
                23:47
              </motion.div>
              <motion.p
                animate={{ opacity: [0.2, 0.45, 0.2] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="text-xs italic tracking-[0.2em]"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                el momento es tuyo
              </motion.p>
            </div>

            {/* Close — minimal, bottom center */}
            <button
              onClick={() => setActive(false)}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
              style={{
                color: "rgba(255,255,255,0.2)",
                fontSize: 11,
                letterSpacing: "0.2em",
                fontFamily: "monospace",
              }}
            >
              salir
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
