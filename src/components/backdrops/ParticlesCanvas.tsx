import { useEffect, useRef } from "react";

type Mode = "fireflies" | "snow" | "embers" | "leaves";

interface P {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseVx: number;
  baseVy: number;
  r: number;
  a: number;
  targetA: number;
  depth: number;
  phase: number;
  phaseSpeed: number;
  born: number;
}

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace("#", "").padStart(6, "0").match(/.{2}/g);
  if (!m) return [255, 255, 255];
  return [parseInt(m[0], 16), parseInt(m[1], 16), parseInt(m[2], 16)];
}

export function ParticlesCanvas({
  mode = "fireflies",
  color = "#ffd29a",
  density = 80,
  mouseRef,
}: {
  mode?: Mode;
  color?: string;
  density?: number;
  mouseRef?: React.RefObject<{ x: number; y: number }>;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = window.innerWidth;
    let h = window.innerHeight;
    let parts: P[] = [];
    let tick_n = 0;
    const [cr, cg, cb] = hexToRgb(color);

    // Mouse influence constants per mode
    const MOUSE_RADIUS = 130;
    const MOUSE_FORCE = mode === "fireflies" ? 0.28 : mode === "snow" ? 0.14 : 0.18;
    const DAMPEN = mode === "fireflies" ? 0.93 : 0.95;

    function setup() {
      if (!canvas || !ctx) return;
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      parts = Array.from({ length: density }, () => spawn(true));
    }

    function spawn(initial = false): P {
      const depth = Math.random();
      const depthScale = 0.4 + depth * 0.6;
      const base: P = {
        x: Math.random() * w,
        y: initial ? Math.random() * h : -8,
        vx: 0, vy: 0, baseVx: 0, baseVy: 0,
        r: 0, a: 0, targetA: 0,
        depth,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: 0.006 + Math.random() * 0.012,
        born: tick_n,
      };

      if (mode === "fireflies") {
        base.y = initial ? Math.random() * h : Math.random() * h;
        base.x = initial ? Math.random() * w : Math.random() * w;
        base.baseVx = (Math.random() - 0.5) * 0.18 * depthScale;
        base.baseVy = (Math.random() - 0.5) * 0.12 * depthScale;
        base.vx = base.baseVx; base.vy = base.baseVy;
        base.r = (0.8 + Math.random() * 1.8) * depthScale;
        base.targetA = (0.3 + Math.random() * 0.55) * depthScale;
      } else if (mode === "snow") {
        base.y = initial ? Math.random() * h : -8;
        base.baseVy = (0.25 + Math.random() * 0.5) * depthScale;
        base.baseVx = (Math.random() - 0.5) * 0.3;
        base.vx = base.baseVx; base.vy = base.baseVy;
        base.r = (0.6 + Math.random() * 1.2) * depthScale;
        base.targetA = (0.25 + Math.random() * 0.5) * depthScale;
      } else if (mode === "embers") {
        base.y = initial ? Math.random() * h : h + 8;
        base.baseVy = -(0.35 + Math.random() * 0.65) * depthScale;
        base.baseVx = (Math.random() - 0.5) * 0.3;
        base.vx = base.baseVx; base.vy = base.baseVy;
        base.r = (0.5 + Math.random() * 1.1) * depthScale;
        base.targetA = (0.35 + Math.random() * 0.5) * depthScale;
      } else if (mode === "leaves") {
        base.y = initial ? Math.random() * h : -8;
        base.baseVy = (0.18 + Math.random() * 0.35) * depthScale;
        base.baseVx = (-0.35 - Math.random() * 0.35) * depthScale;
        base.vx = base.baseVx; base.vy = base.baseVy;
        base.r = (1.4 + Math.random() * 2.0) * depthScale;
        base.targetA = (0.2 + Math.random() * 0.45) * depthScale;
      }

      base.a = 0;
      return base;
    }

    setup();
    let raf = 0;

    function tick() {
      if (!ctx) return;
      tick_n++;
      ctx.clearRect(0, 0, w, h);

      const mx = mouseRef?.current?.x ?? -9999;
      const my = mouseRef?.current?.y ?? -9999;

      for (const p of parts) {
        p.phase += p.phaseSpeed;

        const sineX = Math.sin(p.phase) * 0.22 * (0.5 + p.depth * 0.5);
        const sineY = Math.cos(p.phase * 0.7) * 0.12 * (0.5 + p.depth * 0.5);

        // Mouse repulsion
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS && dist > 1) {
          const force = (1 - dist / MOUSE_RADIUS) * MOUSE_FORCE * p.depth;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        // Dampen back toward base velocity
        p.vx = p.vx * DAMPEN + p.baseVx * (1 - DAMPEN);
        p.vy = p.vy * DAMPEN + p.baseVy * (1 - DAMPEN);

        if (mode === "fireflies") {
          p.x += p.vx + sineX;
          p.y += p.vy + sineY;
          const pulsedA = p.targetA * (0.6 + 0.4 * Math.sin(p.phase * 1.4));
          p.a += (pulsedA - p.a) * 0.04;
        } else {
          p.x += p.vx + sineX;
          p.y += p.vy;
          p.a += (p.targetA - p.a) * 0.05;
        }

        const age = tick_n - p.born;
        const fadeIn = Math.min(1, age / 80);
        const displayA = p.a * fadeIn;

        const glowSize = mode === "fireflies" || mode === "embers"
          ? 8 + 4 * Math.sin(p.phase)
          : 3;

        ctx.shadowColor = `rgba(${cr},${cg},${cb},${0.5 * p.depth})`;
        ctx.shadowBlur = glowSize * p.depth;
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${displayA})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        const oob =
          p.x < -20 || p.x > w + 20 ||
          p.y < -20 || p.y > h + 20;
        if (oob) Object.assign(p, spawn(false));
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    window.addEventListener("resize", setup);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", setup);
    };
  }, [mode, color, density, mouseRef]);

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-0" aria-hidden />;
}
