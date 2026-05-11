// ============================================================
// 23:47 — Memory Parallax Engine
// Mouse/device movement → subtle spatial depth delta.
// The room responds to presence. Very gentle. Not a game.
// ============================================================

import { useEffect, useRef, useState } from "react";

export interface ParallaxDelta {
  x: number;  // -1.0 to 1.0 (left → right)
  y: number;  // -1.0 to 1.0 (top → bottom)
}

interface UseMouseParallaxOptions {
  strength?:   number;   // multiplier 0.0–1.0, default 0.3
  smoothing?:  number;   // lerp factor 0.0–1.0, default 0.08
  enabled?:    boolean;
}

export function useMouseParallax(options: UseMouseParallaxOptions = {}): ParallaxDelta {
  const { strength = 0.3, smoothing = 0.08, enabled = true } = options;

  const [delta, setDelta] = useState<ParallaxDelta>({ x: 0, y: 0 });
  const targetRef  = useRef<ParallaxDelta>({ x: 0, y: 0 });
  const currentRef = useRef<ParallaxDelta>({ x: 0, y: 0 });
  const rafRef     = useRef<number>(0);
  const activeRef  = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const onMouseMove = (e: MouseEvent) => {
      // Normalize to -1..1 relative to viewport center
      targetRef.current = {
        x: ((e.clientX / window.innerWidth)  - 0.5) * 2 * strength,
        y: ((e.clientY / window.innerHeight) - 0.5) * 2 * strength,
      };
    };

    // Device orientation fallback (mobile)
    const onDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;
      targetRef.current = {
        x: Math.max(-1, Math.min(1, (e.gamma / 30) * strength)),
        y: Math.max(-1, Math.min(1, ((e.beta - 30) / 30) * strength)),
      };
    };

    const tick = () => {
      const t = targetRef.current;
      const c = currentRef.current;

      const nx = c.x + (t.x - c.x) * smoothing;
      const ny = c.y + (t.y - c.y) * smoothing;

      // Only update state if movement is above threshold (avoid React re-render spam)
      if (Math.abs(nx - c.x) > 0.0005 || Math.abs(ny - c.y) > 0.0005) {
        currentRef.current = { x: nx, y: ny };
        setDelta({ x: nx, y: ny });
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    activeRef.current = true;
    rafRef.current = requestAnimationFrame(tick);

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("deviceorientation", onDeviceOrientation, { passive: true });

    return () => {
      activeRef.current = false;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("deviceorientation", onDeviceOrientation);
    };
  }, [enabled, strength, smoothing]);

  return delta;
}
