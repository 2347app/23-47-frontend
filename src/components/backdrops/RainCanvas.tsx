import { useEffect, useRef } from "react";

interface Drop {
  x: number;
  y: number;
  l: number;
  vy: number;
  vx: number;
  alpha: number;
  layer: 0 | 1;
}

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace("#", "").padStart(6, "0").match(/.{2}/g);
  if (!m) return [180, 200, 255];
  return [parseInt(m[0], 16), parseInt(m[1], 16), parseInt(m[2], 16)];
}

export function RainCanvas({ density = 260, color = "#9bbcff" }: { density?: number; color?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = window.innerWidth;
    let h = window.innerHeight;
    let raf = 0;
    let drops: Drop[] = [];
    const [r, g, b] = hexToRgb(color);

    function resize() {
      if (!canvas || !ctx) return;
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }

    function spawnDrop(layer: 0 | 1): Drop {
      const isFar = layer === 0;
      return {
        x: Math.random() * (w + 60) - 30,
        y: -Math.random() * h * 0.6,
        l:  isFar ? 6  + Math.random() * 8   : 14 + Math.random() * 20,
        vy: isFar ? 4  + Math.random() * 3   : 9  + Math.random() * 7,
        vx: isFar ? -0.4 - Math.random() * 0.3 : -1.2 - Math.random() * 0.8,
        alpha: isFar ? 0.04 + Math.random() * 0.08 : 0.09 + Math.random() * 0.14,
        layer,
      };
    }

    resize();
    const far  = Math.floor(density * 0.55);
    const near = density - far;
    drops = [
      ...Array.from({ length: far  }, () => spawnDrop(0)),
      ...Array.from({ length: near }, () => spawnDrop(1)),
    ];

    function tick() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "round";

      for (const d of drops) {
        const lw = d.layer === 0 ? 0.7 : 1.2;
        ctx.lineWidth = lw;
        ctx.strokeStyle = `rgba(${r},${g},${b},${d.alpha})`;

        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + d.vx * (d.l / d.vy), d.y + d.l);
        ctx.stroke();

        d.x += d.vx;
        d.y += d.vy;

        if (d.y > h + d.l + 10) {
          const layer = d.layer;
          Object.assign(d, spawnDrop(layer));
        }
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [density, color]);

  return (
    <canvas
      ref={ref}
      className="pointer-events-none fixed inset-0 z-0 mix-blend-screen"
      style={{ opacity: 0.75 }}
      aria-hidden
    />
  );
}
