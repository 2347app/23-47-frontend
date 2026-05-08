import { useEffect, useRef } from "react";

/**
 * Fase 4 — Music atmosphere hook.
 * When music is playing, injects a subtle CSS pulse on --era-glow intensity
 * and a slow backdrop breathe sync so the visual world "feels" the music.
 * Does NOT require BPM data — uses a gentle 120 BPM approximation (~500ms half-beat).
 */
export function useMusicAtmosphere(isPlaying: boolean, trackName?: string) {
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    const root = document.documentElement;

    if (!isPlaying) {
      cancelAnimationFrame(rafRef.current);
      root.style.removeProperty("--music-glow-boost");
      root.style.removeProperty("--music-active");
      return;
    }

    root.style.setProperty("--music-active", "1");
    startRef.current = performance.now();

    const BPM = 120;
    const BEAT_MS = (60 / BPM) * 1000;

    function frame(now: number) {
      const elapsed = now - startRef.current;
      // Sine wave synced to approximate beat
      const beat = (Math.sin((elapsed / BEAT_MS) * Math.PI * 2) + 1) / 2; // 0–1
      const boost = 0.08 + beat * 0.14; // gentle 8–22% boost
      root.style.setProperty("--music-glow-boost", boost.toFixed(3));
      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      root.style.removeProperty("--music-glow-boost");
      root.style.removeProperty("--music-active");
    };
  }, [isPlaying, trackName]);
}
