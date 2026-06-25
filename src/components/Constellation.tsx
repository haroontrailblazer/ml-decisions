import { useEffect, useRef } from "react";

/**
 * Interactive constellation / network graph — the signature "live" graphic from
 * the ausdata.ai reference. Nodes drift across a faint blueprint field, link to
 * their neighbours with hairlines, twinkle, and react to the cursor (nearby
 * nodes lean toward the pointer and a live web of links lights up around it).
 *
 * Pure canvas + requestAnimationFrame — no dependencies. DPR-aware, sized to its
 * container via ResizeObserver, and fully static when the user prefers reduced
 * motion.
 */

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  hue: "violet" | "amber" | "star";
  tw: number; // twinkle phase
  tws: number; // twinkle speed
  anchor?: boolean;
};

function readColor(el: HTMLElement, varName: string, fallback: string) {
  const raw = getComputedStyle(el).getPropertyValue(varName).trim();
  return raw ? `hsl(${raw})` : fallback;
}
function readColorA(el: HTMLElement, varName: string, alpha: number, fallback: string) {
  const raw = getComputedStyle(el).getPropertyValue(varName).trim();
  return raw ? `hsl(${raw} / ${alpha})` : fallback;
}

export function Constellation({
  className,
  count = 26,
}: {
  className?: string;
  count?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let w = 0;
    let h = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let nodes: Node[] = [];
    const pointer = { x: -9999, y: -9999, active: false };

    let cViolet = "hsl(258 92% 76%)";
    let cAmber = "hsl(35 96% 62%)";
    let cStar = "hsl(40 30% 96%)";
    let linkBase = "hsl(258 92% 76% / 0.16)";
    const colorOf = (n: Node) =>
      n.hue === "violet" ? cViolet : n.hue === "amber" ? cAmber : cStar;

    const refreshColors = () => {
      cViolet = readColor(canvas, "--c-violet", cViolet);
      cAmber = readColor(canvas, "--c-amber", cAmber);
      cStar = readColor(canvas, "--c-star", cStar);
      linkBase = readColorA(canvas, "--c-violet", 0.16, linkBase);
    };

    const seed = () => {
      const n = Math.max(10, Math.round((count * Math.min(w, 720)) / 560));
      nodes = [];
      // central anchor node (the glowing core in the reference)
      nodes.push({
        x: w * 0.5,
        y: h * 0.46,
        vx: 0,
        vy: 0,
        r: 3.6,
        hue: "violet",
        tw: 0,
        tws: 0.6,
        anchor: true,
      });
      for (let i = 1; i < n; i++) {
        const hue: Node["hue"] =
          i % 7 === 0 ? "amber" : i % 3 === 0 ? "star" : "violet";
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.16,
          vy: (Math.random() - 0.5) * 0.16,
          r: hue === "star" ? 1.1 + Math.random() * 0.9 : 1.6 + Math.random() * 1.6,
          hue,
          tw: Math.random() * Math.PI * 2,
          tws: 0.4 + Math.random() * 0.9,
        });
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const LINK = 132; // px link threshold

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);

      // advance + integrate
      for (const n of nodes) {
        if (!n.anchor && !reduced) {
          n.x += n.vx;
          n.y += n.vy;
          // pointer attraction — nodes lean gently toward the cursor
          if (pointer.active) {
            const dx = pointer.x - n.x;
            const dy = pointer.y - n.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < 200 * 200 && d2 > 1) {
              const f = 0.045 / Math.sqrt(d2);
              n.vx += dx * f;
              n.vy += dy * f;
            }
          }
          // damping + wrap
          n.vx *= 0.992;
          n.vy *= 0.992;
          if (n.x < -10) n.x = w + 10;
          if (n.x > w + 10) n.x = -10;
          if (n.y < -10) n.y = h + 10;
          if (n.y > h + 10) n.y = -10;
        }
      }

      // links between nearby nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < LINK) {
            const close = 1 - d / LINK;
            ctx.strokeStyle = linkBase;
            ctx.globalAlpha = close * (a.anchor || b.anchor ? 0.9 : 0.55);
            ctx.lineWidth = a.anchor || b.anchor ? 0.9 : 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;

      // live web around the pointer
      if (pointer.active && !reduced) {
        for (const n of nodes) {
          const d = Math.hypot(pointer.x - n.x, pointer.y - n.y);
          if (d < 168) {
            ctx.strokeStyle = colorOf(n);
            ctx.globalAlpha = (1 - d / 168) * 0.5;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(pointer.x, pointer.y);
            ctx.lineTo(n.x, n.y);
            ctx.stroke();
          }
        }
        ctx.globalAlpha = 1;
      }

      // nodes (with glow + twinkle)
      for (const n of nodes) {
        const col = colorOf(n);
        const tw = reduced ? 0.85 : 0.55 + 0.45 * Math.sin(t * 0.001 * n.tws + n.tw);
        const r = n.anchor ? n.r + Math.sin(t * 0.0016) * 0.6 : n.r;

        ctx.globalAlpha = n.anchor ? 0.35 : 0.22 * tw;
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r * (n.anchor ? 5 : 3.4), 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = n.anchor ? 1 : 0.55 + 0.45 * tw;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (!reduced) raf = requestAnimationFrame(draw);
    };

    let raf = 0;
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
      pointer.x = -9999;
      pointer.y = -9999;
    };

    refreshColors();
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);

    if (reduced) {
      draw(0); // single static frame
    } else {
      raf = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block", width: "100%", height: "100%", touchAction: "none" }}
      aria-hidden="true"
    />
  );
}
