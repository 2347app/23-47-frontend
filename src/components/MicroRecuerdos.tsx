import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useEraStore } from "../store/era.store";

export function MicroRecuerdos() {
  const era = useEraStore((s) => s.currentEra);
  const [phrase, setPhrase] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const memories = era.microMemories;
    if (!memories?.length) return;

    const clearAll = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (hideRef.current) clearTimeout(hideRef.current);
    };

    const showNext = () => {
      const delay = 15_000 + Math.random() * 25_000;
      timerRef.current = setTimeout(() => {
        const pick = memories[Math.floor(Math.random() * memories.length)];
        setPhrase(pick);
        hideRef.current = setTimeout(() => {
          setPhrase(null);
          showNext();
        }, 7_500);
      }, delay);
    };

    clearAll();
    setPhrase(null);
    showNext();

    return clearAll;
  }, [era.id]);

  return (
    <AnimatePresence>
      {phrase && (
        <motion.div
          key={phrase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 2.8, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none fixed bottom-28 left-1/2 z-[6] -translate-x-1/2 px-6 text-center md:bottom-20"
        >
          <p
            className="font-display text-sm italic leading-relaxed tracking-wide md:text-[15px]"
            style={{
              color: `${era.palette.glow}88`,
              textShadow: `0 0 40px rgba(0,0,0,0.9), 0 0 20px ${era.palette.accent}22`,
              letterSpacing: "0.04em",
            }}
          >
            {phrase}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
