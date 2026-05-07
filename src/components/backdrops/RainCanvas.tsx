import { useEffect, useRef } from "react";

interface Drop {
  x: number;
  y: number;
  l: number;
  vy: number;
  vx: number;
  alpha: number;
}

export function RainCanvas({ density = 220, color = "#9bbcff" }: { density?: number; color?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let drops: Drop[] = [];
    let raf = 0;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    function resize() {
      if (!canvas || !ctx) return;
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(dpr, dpr);
    }

    function spawn(): Drop {
      return {
        x: Math.random() * w,
        y: -Math.random() * h,
        l: 12 + Math.random() * 16,
        vy: 6 + Math.random() * 6,
        vx: -1 - Math.random() * 0.6,
        alpha: 0.08 + Math.random() * 0.18,
      };
    }
    drops = Array.from({ length: density }, spawn);

    function tick() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "round";
      ctx.lineWidth = 1.1;
      for (const d of drops) {
        ctx.strokeStyle = color
          .replace(/^#/, "")
          .padStart(6, "0")
          .match(/.{2}/g)!
          .map((x) => parseInt(x, 16))
          .reduce((acc, v, i) => (acc += `${i === 0 ? "rgba(" : ", "}${v}`), "") + `, ${d.alpha})`;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + d.vx * 2, d.y + d.l);
        ctx.stroke();
        d.x += d.vx;
        d.y += d.vy;
        if (d.y > h + d.l) {
          Object.assign(d, spawn(), { y: -10 });
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
      className="pointer-events-none fixed inset-0 z-0 opacity-70 mix-blend-screen"
      aria-hidden
    />
  );
}
