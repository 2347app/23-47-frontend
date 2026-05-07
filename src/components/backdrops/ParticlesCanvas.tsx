import { useEffect, useRef } from "react";

type Mode = "fireflies" | "snow" | "embers" | "leaves";

interface P {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
  hueShift: number;
}

export function ParticlesCanvas({
  mode = "fireflies",
  color = "#ffd29a",
  density = 80,
}: {
  mode?: Mode;
  color?: string;
  density?: number;
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
      parts = Array.from({ length: density }, spawn);
    }

    function spawn(): P {
      const base: P = {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.2,
        r: Math.random() * 1.6 + 0.6,
        a: Math.random() * 0.7 + 0.2,
        hueShift: 0,
      };
      if (mode === "snow") {
        base.vy = 0.3 + Math.random() * 0.6;
        base.vx = (Math.random() - 0.5) * 0.4;
        base.r = Math.random() * 1.4 + 0.5;
      } else if (mode === "embers") {
        base.vy = -0.4 - Math.random() * 0.6;
        base.vx = (Math.random() - 0.5) * 0.4;
        base.r = Math.random() * 1.2 + 0.4;
      } else if (mode === "leaves") {
        base.vy = 0.2 + Math.random() * 0.4;
        base.vx = -0.4 - Math.random() * 0.4;
        base.r = Math.random() * 2.2 + 1.2;
      }
      return base;
    }
    setup();

    const [r, g, b] = hexToRgb(color);
    let raf = 0;
    function tick() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.x += p.vx;
        p.y += p.vy;
        if (mode === "fireflies") {
          p.a += (Math.random() - 0.5) * 0.04;
          if (p.a > 0.9) p.a = 0.9;
          if (p.a < 0.15) p.a = 0.15;
        }
        if (p.x < -10 || p.x > w + 10 || p.y < -10 || p.y > h + 10) {
          Object.assign(p, spawn(), { y: mode === "snow" || mode === "leaves" ? -5 : Math.random() * h });
        }
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.a})`;
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.6)`;
        ctx.shadowBlur = mode === "fireflies" || mode === "embers" ? 8 : 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    window.addEventListener("resize", setup);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", setup);
    };
  }, [mode, color, density]);

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-0" aria-hidden />;
}

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace("#", "").match(/.{2}/g);
  if (!m) return [255, 255, 255];
  return [parseInt(m[0], 16), parseInt(m[1], 16), parseInt(m[2], 16)];
}
