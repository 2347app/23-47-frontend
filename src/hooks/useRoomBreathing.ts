// ============================================================
// 23:47 — Room Breathing Hook
// Returns a 0–1 sine oscillation at the given speed/depth.
// Used to make the room feel alive — subtle, not obvious.
// ============================================================

import { useState, useEffect } from "react";

/**
 * Returns a value that oscillates between ~0 and ~1 over `speedSecs` seconds.
 * The actual range is: 0.5 ± (0.5 * depth).
 * At depth=0.5, range is [0.25, 0.75]. At depth=0, value is always 0.5.
 */
export function useRoomBreathing(speedSecs: number, depth: number): number {
  const [value, setValue] = useState(0.5);

  useEffect(() => {
    if (speedSecs <= 0 || depth <= 0) return;

    let animFrame: number;
    const start = performance.now();

    const tick = (now: number) => {
      const t = (now - start) / 1000;
      const v = 0.5 + 0.5 * Math.sin((t / speedSecs) * 2 * Math.PI) * depth;
      setValue(v);
      animFrame = requestAnimationFrame(tick);
    };

    animFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrame);
  }, [speedSecs, depth]);

  return value;
}
