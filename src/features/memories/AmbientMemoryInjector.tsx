// ============================================================
// 23:47 — Ambient Memory Injector
// Fase 4: recuerdos flotantes atmosféricos
// Aparecen de forma orgánica, casi subconsciente
// ============================================================

import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { api } from "../../services/api";

interface AmbientMemory {
  id: string;
  icon: string;
  text: string;
  category: string;
  intensity: number;
}

interface ActiveMemory extends AmbientMemory {
  uid: string;
  x: number;      // % left
  y: number;      // % top
  side: "left" | "right";
}

interface Props {
  input?: string;
  refreshInterval?: number; // ms between fetches
  maxVisible?: number;
  className?: string;
}

function uid() {
  return Math.random().toString(36).slice(2);
}

export function AmbientMemoryInjector({
  input = "",
  refreshInterval = 35_000,
  maxVisible = 2,
  className = "",
}: Props) {
  const [pool, setPool] = useState<AmbientMemory[]>([]);
  const [visible, setVisible] = useState<ActiveMemory[]>([]);
  const poolRef = useRef<AmbientMemory[]>([]);
  const usedRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch ambient memories from backend
  const fetchPool = useCallback(async () => {
    try {
      const params = new URLSearchParams({ hour: String(new Date().getHours()) });
      if (input.trim().length >= 5) params.set("input", input.trim());
      const { data } = await api.get(`/ai/cultural-memories?${params}`);
      poolRef.current = data.memories ?? [];
      setPool(data.memories ?? []);
    } catch {
      // Silent fail — ambient memories are non-critical
    }
  }, [input]);

  // Show one memory at random position
  const showNext = useCallback(() => {
    const available = poolRef.current.filter((m) => !usedRef.current.has(m.id));
    if (available.length === 0) {
      usedRef.current.clear(); // reset used pool
      return;
    }

    // Pick random, weighted by intensity
    const totalWeight = available.reduce((s, m) => s + m.intensity, 0);
    let rnd = Math.random() * totalWeight;
    let chosen: AmbientMemory | undefined;
    for (const m of available) {
      rnd -= m.intensity;
      if (rnd <= 0) { chosen = m; break; }
    }
    if (!chosen) chosen = available[0];
    usedRef.current.add(chosen.id);

    const side: "left" | "right" = Math.random() > 0.5 ? "left" : "right";
    const x = side === "left"
      ? Math.random() * 10 + 1          // 1–11%
      : Math.random() * 8  + 62;        // 62–70% (safe on mobile)
    const y = Math.random() * 55 + 15;  // 15–70%

    const active: ActiveMemory = { ...chosen, uid: uid(), x, y, side };

    setVisible((prev) => {
      const next = [...prev, active];
      return next.length > maxVisible ? next.slice(1) : next;
    });

    // Track engagement (shown = not dismissed by default)
    api.post("/ai/cultural-memories/event", {
      memoryId: chosen.id,
      memoryCategory: chosen.category,
      dismissed: false,
    }).catch(() => {});

    // Auto-remove after display time (intensity drives duration)
    const ttl = 4500 + chosen.intensity * 400;
    setTimeout(() => {
      setVisible((prev) => prev.filter((m) => m.uid !== active.uid));
    }, ttl);
  }, [maxVisible]);

  // Initial fetch
  useEffect(() => { fetchPool(); }, [fetchPool]);

  // Refresh pool periodically
  useEffect(() => {
    const t = setInterval(fetchPool, refreshInterval);
    return () => clearInterval(t);
  }, [fetchPool, refreshInterval]);

  // Schedule memory appearances
  useEffect(() => {
    if (pool.length === 0) return;

    const schedule = () => {
      // Appear every 7–18 seconds (organic, non-intrusive)
      const delay = 7_000 + Math.random() * 11_000;
      timerRef.current = setTimeout(() => {
        showNext();
        schedule();
      }, delay);
    };

    // First appearance after 3-6s
    const firstDelay = 3_000 + Math.random() * 3_000;
    timerRef.current = setTimeout(() => { showNext(); schedule(); }, firstDelay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pool, showNext]);

  if (visible.length === 0) return null;

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-20 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <AnimatePresence>
        {visible.map((m) => (
          <motion.div
            key={m.uid}
            initial={{ opacity: 0, y: m.side === "left" ? 8 : -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: m.side === "left" ? -6 : 6, scale: 0.97 }}
            transition={{ duration: 1.8, ease: [0.25, 0, 0, 1] }}
            style={{
              position: "absolute",
              left: `${m.x}%`,
              top: `${m.y}%`,
              maxWidth: "180px",
              textAlign: m.side === "left" ? "left" : "right",
              pointerEvents: "auto",
            }}
          >
            <div
              className="group relative rounded-xl px-3 py-2"
              style={{
                background: "rgba(0,0,0,0.35)",
                backdropFilter: "blur(6px)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <button
                className="absolute -right-1.5 -top-1.5 hidden h-4 w-4 items-center justify-center rounded-full group-hover:flex"
                style={{
                  background: "rgba(0,0,0,0.6)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  fontSize: 8,
                  color: "rgba(255,255,255,0.4)",
                }}
                onClick={() => {
                  setVisible((prev) => prev.filter((v) => v.uid !== m.uid));
                  api.post("/ai/cultural-memories/event", {
                    memoryId: m.id,
                    memoryCategory: m.category,
                    dismissed: true,
                  }).catch(() => {});
                }}
                aria-label="Cerrar"
              >
                ✕
              </button>
              <span
                className="block text-[11px] leading-snug"
                style={{ color: "rgba(255,255,255,0.55)", fontStyle: "italic" }}
              >
                <span className="mr-1 not-italic">{m.icon}</span>
                {m.text}
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
