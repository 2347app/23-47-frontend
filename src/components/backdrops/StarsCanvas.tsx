import { useEffect, useRef } from "react";

interface Star {
  baseX: number;
  baseY: number;
  r: number;
  a: number;
  da: number;
  depth: number; // 0 = far/static, 1 = close/moves most
}

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace("#", "").match(/.{2}/g);
  if (!m) return [255, 255, 255];
  return [parseInt(m[0], 16), parseInt(m[1], 16), parseInt(m[2], 16)];
}

export function StarsCanvas({
  density = 160,
  color = "#bae6fd",
  mouseRef,
}: {
  density?: number;
  color?: string;
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
    let stars: Star[] = [];

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
      stars = Array.from({ length: density }, () => {
        const depth = Math.random(); // 0=far, 1=near
        return {
          baseX: Math.random() * w,
          baseY: Math.random() * h,
          r: (0.2 + Math.random() * 1.4) * (0.4 + depth * 0.6),
          a: Math.random() * 0.7 + 0.2,
          da: (Math.random() - 0.5) * 0.012,
          depth,
        };
      });
    }
    setup();

    let raf = 0;
    function tick() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      const [r, g, b] = hexToRgb(color);

      // Smoothed mouse parallax (–0.5 to 0.5 of screen)
      const rawMx = mouseRef?.current ? mouseRef.current.x / w - 0.5 : 0;
      const rawMy = mouseRef?.current ? mouseRef.current.y / h - 0.5 : 0;

      for (const s of stars) {
        s.a += s.da;
        if (s.a > 0.95 || s.a < 0.1) s.da *= -1;

        // Near stars shift more, far stars almost static
        const px = s.baseX + rawMx * s.depth * 26;
        const py = s.baseY + rawMy * s.depth * 16;

        ctx.shadowColor = `rgba(${r},${g},${b},${s.a * 0.6 * s.depth})`;
        ctx.shadowBlur = s.depth > 0.7 ? 4 : 0;
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${s.a})`;
        ctx.beginPath();
        ctx.arc(px, py, s.r, 0, Math.PI * 2);
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
  }, [density, color, mouseRef]);

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-0" aria-hidden />;
}
