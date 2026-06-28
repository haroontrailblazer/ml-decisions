import { useEffect, useRef, useState } from "react";
import { useStore } from "@/store";
import { SECTIONS } from "@/data/sections";
import { cn } from "@/lib/utils";

/**
 * AttritionLedger — the signature graphic for "The ML Decision Suite".
 *
 * A flat, left-to-right Sankey-style attrition funnel. A thick "100 requests"
 * survivor band enters at the left and bleeds away gate by gate — by far the
 * most loss shedding at the Say-No Gate — until a slim, hue-ripened filament
 * survives to a GO terminus on the right. Discrete request "motes" ride the
 * band and peel off into colored reject cascades at their gate; the survivors
 * bloom into a verdict ring with a readiness readout.
 *
 * It tells the product's core thesis — "most ML projects should be said-no-to
 * early; only a few are a GO" — as area + flow, and is deliberately the
 * structural opposite of the hero's rotating 3D sphere (no rotation, no orbit,
 * no nodes, no links). The four gates rhyme, in order and accent, with the four
 * stage cards directly below; hovering a gate previews it and clicking opens it.
 *
 * Pure Canvas2D + rAF, no deps. DPR-aware, ResizeObserver-sized, theme-aware,
 * and renders a single meaningful frame under prefers-reduced-motion.
 */

/* ---- color tokens: read raw "h s% l%" triples, apply alpha at draw time ---- */
function rawVar(el: HTMLElement, name: string, fallback: string) {
  const raw = getComputedStyle(el).getPropertyValue(name).trim();
  return raw || fallback;
}
const hsla = (triple: string, a: number) => `hsl(${triple} / ${a})`;

type GateDef = {
  key: string;
  frac: number;
  label: string;
  desc: string;
  section: number;
  token: string | null; // CSS var name, or null to use literal
  fallback: string; // raw triple
};

const GATES: GateDef[] = [
  {
    key: "sayno",
    frac: 0.25,
    label: "SAY-NO GATE",
    desc: "Most requests should die here — if a SQL query or if-else rule works, say no.",
    section: 1,
    token: "--c-amber",
    fallback: "35 96% 62%",
  },
  {
    key: "lenses",
    frac: 0.46,
    label: "THREE LENSES",
    desc: "Value gain, operational fit and risk profile.",
    section: 2,
    token: "--c-violet",
    fallback: "258 92% 76%",
  },
  {
    key: "data",
    frac: 0.65,
    label: "DATA ARCH.",
    desc: "Volume, freshness, labels, leakage and serving-time parity.",
    section: 5,
    token: null, // cyan — no token; reuse the hero's Data hue
    fallback: "190 95% 50%",
  },
  {
    key: "verdict",
    frac: 0.8,
    label: "VERDICT",
    desc: "A weighted readiness score and a defensible GO / NO-GO.",
    section: SECTIONS.length - 1,
    token: null, // magenta — reuse the hero's Verdict hue
    fallback: "320 90% 60%",
  },
];

// survivor counts at [intake, post-SayNo, post-Lenses, post-Data]; band fans into 7/3/2 at Verdict
const COUNTS = [100, 36, 21, 12];

type Mote = {
  x: number;
  lane: number; // -0.5..0.5 vertical position within band thickness
  fate: number; // gate index it dies at (0..2) or 3 = survives to verdict
  state: "ride" | "fall";
  vx: number;
  vy: number;
  alpha: number;
  y_?: number; // live y while falling out of the band
};

type Layout = {
  w: number;
  h: number;
  expandT: number;
  intakeX: number;
  gateX: number[];
  termX: number;
  yTop: number;
  yFloor: number;
  unit: number;
  maxThickness: number;
  bandPath: Path2D;
  bandGrad: CanvasGradient;
  lipGrad: CanvasGradient;
  rejects: { path: Path2D; grad: CanvasGradient }[];
};

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

export function AttritionLedger({
  className,
  expanded,
}: {
  className?: string;
  expanded: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const enter = useStore((st) => st.enter);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    /* ---- colors ---- */
    const col = {
      star: "40 30% 96%",
      amber: "35 96% 62%",
      violet: "258 92% 76%",
      cyan: "190 95% 50%",
      magenta: "320 90% 60%",
      success: "150 52% 56%",
      warning: "36 94% 60%",
      destructive: "2 78% 64%",
      border: "245 8% 16%",
      muted: "245 8% 62%",
      foreground: "40 18% 92%",
    };
    const refreshColors = () => {
      col.star = rawVar(canvas, "--c-star", col.star);
      col.amber = rawVar(canvas, "--c-amber", col.amber);
      col.violet = rawVar(canvas, "--c-violet", col.violet);
      col.success = rawVar(canvas, "--success", col.success);
      col.warning = rawVar(canvas, "--warning", col.warning);
      col.destructive = rawVar(canvas, "--destructive", col.destructive);
      col.border = rawVar(canvas, "--border", col.border);
      col.muted = rawVar(canvas, "--muted-foreground", col.muted);
      col.foreground = rawVar(canvas, "--foreground", col.foreground);
    };
    const gateColor = (i: number) => {
      const g = GATES[i];
      if (g.key === "sayno") return col.amber;
      if (g.key === "lenses") return col.violet;
      if (g.key === "data") return col.cyan;
      return col.magenta;
    };

    const snap = (x: number) => Math.round(x / 34) * 34; // align to the 34px blueprint grid

    let L: Layout | null = null;
    const motes: Mote[] = [];
    const blooms: { age: number; x: number; y: number }[] = [];
    let displayPct = reduced ? 7 : 0;

    // native canvas letter-spacing (reset to 0 around serif/non-tracked text)
    const setLS = (px: number) => {
      (ctx as unknown as { letterSpacing: string }).letterSpacing = `${px}px`;
    };

    const weightedFate = () => {
      const r = Math.random();
      if (r < 0.64) return 0;
      if (r < 0.79) return 1;
      if (r < 0.88) return 2;
      return 3;
    };

    const countAt = (x: number, l: Layout) => {
      const [g0, g1, g2] = l.gateX;
      const th = 16;
      if (x <= g0 - th) return COUNTS[0];
      if (x < g0 + th)
        return mix(COUNTS[0], COUNTS[1], smoothstep(g0 - th, g0 + th, x));
      if (x <= g1 - th) return COUNTS[1];
      if (x < g1 + th)
        return mix(COUNTS[1], COUNTS[2], smoothstep(g1 - th, g1 + th, x));
      if (x <= g2 - th) return COUNTS[2];
      if (x < g2 + th)
        return mix(COUNTS[2], COUNTS[3], smoothstep(g2 - th, g2 + th, x));
      return COUNTS[3];
    };

    const build = (): Layout => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const expandT = clamp((h - 300) / (460 - 300), 0, 1);
      const topPad = 50;
      const botPad = 44;
      const usableH = Math.max(60, h - topPad - botPad);
      const intakeX = w * 0.06;
      const gateX = GATES.map((g) => snap(g.frac * w));
      const termX = gateX[3];
      const yTop = topPad + 0.06 * usableH;
      const yFloor = h - botPad;
      const maxThickness = (0.46 + 0.04 * expandT) * usableH;
      const unit = maxThickness / 100;

      const l: Layout = {
        w,
        h,
        expandT,
        intakeX,
        gateX,
        termX,
        yTop,
        yFloor,
        unit,
        maxThickness,
        bandPath: new Path2D(),
        bandGrad: ctx.createLinearGradient(0, 0, 0, 0),
        lipGrad: ctx.createLinearGradient(0, 0, 0, 0),
        rejects: [],
      };

      // survivor band: flat top + stepped bottom
      const band = new Path2D();
      band.moveTo(intakeX, yTop);
      band.lineTo(termX, yTop);
      for (let x = termX; x >= intakeX; x -= 4) {
        band.lineTo(x, yTop + countAt(x, l) * unit);
      }
      band.closePath();
      l.bandPath = band;

      // hue-ripening gradient through the four card accents
      const span = termX - intakeX;
      const stop = (gi: number) => clamp((gateX[gi] - intakeX) / span, 0, 1);
      const bandGrad = ctx.createLinearGradient(intakeX, 0, termX, 0);
      bandGrad.addColorStop(0, hsla(col.star, 0.13));
      bandGrad.addColorStop(stop(0), hsla(col.amber, 0.2));
      bandGrad.addColorStop(stop(1), hsla(col.violet, 0.22));
      bandGrad.addColorStop(stop(2), hsla(col.cyan, 0.22));
      bandGrad.addColorStop(1, hsla(col.success, 0.34));
      l.bandGrad = bandGrad;

      const lipGrad = ctx.createLinearGradient(intakeX, 0, termX, 0);
      lipGrad.addColorStop(0, hsla(col.star, 0.4));
      lipGrad.addColorStop(stop(0), hsla(col.amber, 0.5));
      lipGrad.addColorStop(stop(1), hsla(col.violet, 0.55));
      lipGrad.addColorStop(stop(2), hsla(col.cyan, 0.55));
      lipGrad.addColorStop(1, hsla(col.success, 0.7));
      l.lipGrad = lipGrad;

      // reject cascades at gates 0,1,2
      for (let k = 0; k < 3; k++) {
        const gx = gateX[k];
        const preC = COUNTS[k];
        const postC = COUNTS[k + 1];
        const shed = preC - postC;
        const topY = yTop + postC * unit;
        const botY = yTop + preC * unit;
        const fallDX = clamp(shed * unit * 0.95, 30, 0.14 * w);
        const endX = gx + fallDX;
        const p = new Path2D();
        p.moveTo(gx - 14, topY);
        p.bezierCurveTo(
          gx + fallDX * 0.35,
          topY + (yFloor - topY) * 0.22,
          endX - 4,
          yFloor - 14,
          endX,
          yFloor - 8,
        );
        p.lineTo(endX + 3, yFloor);
        p.bezierCurveTo(
          gx + fallDX * 0.45,
          yFloor,
          gx - 2,
          botY + 8,
          gx - 14,
          botY,
        );
        p.closePath();

        const grad = ctx.createLinearGradient(0, topY, 0, yFloor);
        if (k === 0) {
          grad.addColorStop(0, hsla(col.amber, 0.5));
          grad.addColorStop(0.4, hsla(col.destructive, 0.32));
          grad.addColorStop(1, hsla(col.destructive, 0));
        } else {
          const c = gateColor(k);
          grad.addColorStop(0, hsla(c, 0.42));
          grad.addColorStop(0.45, hsla(c, 0.22));
          grad.addColorStop(1, hsla(c, 0));
        }
        l.rejects.push({ path: p, grad });
      }

      return l;
    };

    const spawnMote = (m: Mote, l: Layout, atStart: boolean) => {
      m.x = atStart
        ? l.intakeX - Math.random() * 40
        : l.intakeX + Math.random() * (l.termX - l.intakeX);
      let f = weightedFate();
      while (f < 3 && m.x >= l.gateX[f]) f++;
      m.fate = f;
      m.lane = (Math.random() - 0.5) * 0.92;
      m.state = "ride";
      m.vx = 64 + Math.random() * 18;
      m.vy = 0;
      m.alpha = 1;
    };

    const seedMotes = (l: Layout) => {
      const n = 12;
      motes.length = 0;
      for (let i = 0; i < n; i++) {
        const m: Mote = {
          x: 0,
          lane: 0,
          fate: 3,
          state: "ride",
          vx: 70,
          vy: 0,
          alpha: 1,
        };
        spawnMote(m, l, false);
        motes.push(m);
      }
    };

    /* ---- drawing ---- */
    const drawBand = (l: Layout) => {
      ctx.fillStyle = l.bandGrad;
      ctx.fill(l.bandPath);
      // soften the intake mouth so it isn't a hard grey rectangle
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      const fade = ctx.createLinearGradient(l.intakeX - 2, 0, l.intakeX + 30, 0);
      fade.addColorStop(0, "rgba(0,0,0,1)");
      fade.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = fade;
      ctx.fillRect(l.intakeX - 2, l.yTop - 2, 34, l.maxThickness + 4);
      ctx.restore();
      // crisp lit top lip
      ctx.strokeStyle = l.lipGrad;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(l.intakeX + 16, l.yTop);
      ctx.lineTo(l.termX, l.yTop);
      ctx.stroke();
    };

    const drawRejects = (l: Layout) => {
      for (const r of l.rejects) {
        ctx.fillStyle = r.grad;
        ctx.fill(r.path);
      }
    };

    const drawStriations = (l: Layout, now: number) => {
      const count = l.expandT > 0.5 ? 3 : 2;
      ctx.save();
      ctx.clip(l.bandPath);
      ctx.globalCompositeOperation = "lighter";
      const span = l.termX - l.intakeX;
      for (let k = 0; k < count; k++) {
        const sx =
          l.intakeX + (((now / 8000 + k / count) % 1) * span);
        const g = ctx.createLinearGradient(sx - 46, 0, sx + 46, 0);
        g.addColorStop(0, hsla(col.star, 0));
        g.addColorStop(0.5, hsla(col.star, 0.1));
        g.addColorStop(1, hsla(col.star, 0));
        ctx.fillStyle = g;
        ctx.fillRect(sx - 46, l.yTop - 2, 92, l.maxThickness + 4);
      }
      ctx.restore();
    };

    const drawMotes = (l: Layout, dt: number, hoverIdx: number) => {
      ctx.save();
      ctx.clip(l.bandPath);
      for (const m of motes) {
        if (m.state === "ride") {
          // examine beat: slow motes crossing a hovered gate
          let speed = m.vx;
          if (hoverIdx >= 0 && Math.abs(m.x - l.gateX[hoverIdx]) < 40)
            speed *= 0.45;
          m.x += speed * dt;
          const cnt = countAt(m.x, l);
          const y = l.yTop + cnt * l.unit * (0.5 + m.lane * 0.42);
          // reached its reject gate?
          if (m.fate < 3 && m.x >= l.gateX[m.fate]) {
            m.state = "fall";
            m.vy = 26 + Math.random() * 26;
            m.vx = 18 + Math.random() * 22;
            m.alpha = 1;
          } else if (m.fate === 3 && m.x >= l.termX) {
            blooms.push({
              age: 0,
              x: l.termX,
              y: l.yTop + COUNTS[3] * l.unit * 0.5,
            });
            spawnMote(m, l, true);
            continue;
          }
          const head = hsla(col.star, 0.85 * m.alpha);
          const tail = hsla(col.star, 0.28 * m.alpha);
          ctx.fillStyle = tail;
          ctx.fillRect(m.x - 6, y - 0.8, 4, 1.6);
          ctx.fillStyle = head;
          ctx.beginPath();
          ctx.arc(m.x, y, 1.7, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // falling motes drawn outside the band clip (they leave the band)
      for (const m of motes) {
        if (m.state !== "fall") continue;
        m.vy += 80 * dt;
        m.x += m.vx * dt;
        m.y_ = (m.y_ ?? l.yTop + countAt(m.x, l) * l.unit) + m.vy * dt;
        m.alpha -= dt / 0.9;
        if (m.alpha <= 0 || m.y_ > l.yFloor) {
          m.y_ = undefined;
          spawnMote(m, l, true);
          continue;
        }
        const c = gateColor(m.fate);
        ctx.fillStyle = hsla(c, clamp(m.alpha, 0, 1) * 0.85);
        ctx.beginPath();
        ctx.arc(m.x, m.y_, 1.7, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawGates = (l: Layout, now: number, hoverIdx: number) => {
      for (let i = 0; i < GATES.length; i++) {
        const gx = l.gateX[i];
        const c = gateColor(i);
        const isHover = i === hoverIdx;
        const breathe = 0.5 + 0.5 * Math.sin(now / 1600 + i);
        const baseA = 0.5 + 0.08 * breathe;
        const a = isHover ? 0.95 : baseA;

        // soft glow column
        const glowA = (isHover ? 0.16 : 0.05 + 0.03 * breathe);
        const gg = ctx.createLinearGradient(gx - 22, 0, gx + 22, 0);
        gg.addColorStop(0, hsla(c, 0));
        gg.addColorStop(0.5, hsla(c, glowA));
        gg.addColorStop(1, hsla(c, 0));
        ctx.fillStyle = gg;
        ctx.fillRect(gx - 22, l.yTop - 12, 44, l.yFloor - l.yTop + 12);

        // post hairline
        ctx.strokeStyle = hsla(c, a);
        ctx.lineWidth = isHover ? 1.1 : 0.75;
        ctx.beginPath();
        ctx.moveTo(gx, l.yTop - 10);
        ctx.lineTo(gx, l.yFloor);
        ctx.stroke();

        // diamond cap
        const cap = l.yTop - 10;
        ctx.fillStyle = hsla(c, isHover ? 1 : 0.85);
        ctx.beginPath();
        ctx.moveTo(gx, cap - 3.4);
        ctx.lineTo(gx + 3.4, cap);
        ctx.lineTo(gx, cap + 3.4);
        ctx.lineTo(gx - 3.4, cap);
        ctx.closePath();
        ctx.fill();

        // label
        ctx.font =
          '600 9px ui-monospace, SFMono-Regular, Menlo, monospace';
        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";
        setLS(1.4);
        ctx.fillStyle = isHover ? hsla(c, 1) : hsla(col.muted, 0.85);
        ctx.fillText(GATES[i].label, gx, l.yTop - 16);
        setLS(0);

        // expanded: per-gate attrition annotation
        if (l.expandT > 0.55 && i < 3) {
          const delta = COUNTS[i] - COUNTS[i + 1];
          ctx.font = '700 8.5px ui-monospace, monospace';
          ctx.textAlign = "left";
          ctx.fillStyle = hsla(i === 0 ? col.destructive : c, 0.85);
          ctx.fillText(
            `−${delta}`,
            gx + 8,
            l.yTop + COUNTS[i + 1] * l.unit + 13,
          );
        }
      }
    };

    const drawBlooms = (l: Layout, dt: number) => {
      for (let i = blooms.length - 1; i >= 0; i--) {
        const b = blooms[i];
        if (dt > 0) b.age += dt;
        const t = clamp(b.age / 1.3, 0, 1);
        if (t >= 1) {
          blooms.splice(i, 1);
          continue;
        }
        const r = 4 + t * 40;
        // ring
        ctx.strokeStyle = hsla(col.magenta, 0.9 * (1 - t));
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
        ctx.stroke();
        // green success core flash
        const coreA = 0.7 * (1 - t);
        const cg = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, 12);
        cg.addColorStop(0, hsla(col.success, coreA));
        cg.addColorStop(1, hsla(col.success, 0));
        ctx.fillStyle = cg;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 12, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawTerminus = (l: Layout, dt: number) => {
      // readiness % easing toward 7 (the GO rate)
      if (dt > 0) displayPct += (7 - displayPct) * Math.min(1, dt * 1.4);
      const tx = l.termX + 16;
      const baseY = l.yTop + l.maxThickness * 0.18;
      const pct = Math.round(displayPct);

      // big serif percentage
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      setLS(0);
      ctx.fillStyle = hsla(col.foreground, 0.94);
      ctx.font = `500 ${l.expandT > 0.5 ? 30 : 25}px Newsreader, Georgia, serif`;
      ctx.fillText(`${pct}%`, tx, baseY + 6);

      setLS(1.2);
      ctx.font = '600 8px ui-monospace, monospace';
      ctx.fillStyle = hsla(col.muted, 0.85);
      ctx.fillText("REACH GO", tx + 1, baseY + 20);

      // outcome chips
      const chips: [string, string, number][] = [
        ["GO", col.success, 7],
        ["CAUTION", col.warning, 3],
        ["NO-GO", col.destructive, 2],
      ];
      let cy = baseY + 40;
      const big = l.expandT > 0.5;
      for (const [label, c, n] of chips) {
        ctx.fillStyle = hsla(c, 0.95);
        ctx.beginPath();
        ctx.arc(tx + 3, cy - 3, 2.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = '600 8.5px ui-monospace, monospace';
        ctx.fillStyle = hsla(col.foreground, 0.8);
        ctx.fillText(`${label} · ${n}`, tx + 12, cy);
        cy += big ? 17 : 15;
      }
      if (big) {
        ctx.fillStyle = hsla(col.muted, 0.5);
        ctx.font = '600 8px ui-monospace, monospace';
        ctx.fillText("BLOCKED · NOT-READY", tx, cy + 2);
      }
      setLS(0);
    };

    const drawHeadline = (l: Layout) => {
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.font = '600 9px ui-monospace, monospace';
      setLS(1);
      ctx.fillStyle = hsla(col.muted, 0.8);
      ctx.fillText(letterSpace("INTAKE · 100"), l.intakeX, l.yTop - 16);
    };

    // crude letter-spacing for tracked caps (ctx.letterSpacing isn't universal)
    const letterSpace = (s: string) => s; // tracking via native ctx.letterSpacing  //("  ");

    /* ---- frame ---- */
    let last = 0;
    const draw = (now: number) => {
      if (!L) L = build();
      const l = L;
      const dt = reduced ? 0 : last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;

      ctx.clearRect(0, 0, l.w, l.h);

      const hoverIdx = hoverRef.current;

      drawRejects(l);
      drawBand(l);
      if (!reduced) drawStriations(l, now);
      drawMotes(l, dt, hoverIdx);
      drawGates(l, now, hoverIdx);
      drawBlooms(l, dt);
      drawTerminus(l, dt);
      drawHeadline(l);

      if (!reduced) raf = requestAnimationFrame(draw);
    };

    /* ---- static frame for reduced motion ---- */
    const drawStatic = () => {
      L = build();
      const l = L;
      // seed a frozen, honest distribution
      seedMotes(l);
      // place motes at representative positions
      motes.forEach((m, i) => {
        if (i < 6) {
          m.x = l.intakeX + (i / 6) * (l.gateX[0] - l.intakeX);
          m.fate = i < 4 ? 0 : 1;
          m.state = "ride";
        } else if (i < 9) {
          m.x = mix(l.gateX[0], l.gateX[1], (i - 6) / 3);
          m.fate = i === 8 ? 1 : 3;
        } else {
          m.x = mix(l.gateX[1], l.termX, (i - 9) / 3);
          m.fate = 3;
        }
      });
      blooms.push({
        age: 0.5,
        x: l.termX,
        y: l.yTop + COUNTS[3] * l.unit * 0.5,
      });
      ctx.clearRect(0, 0, l.w, l.h);
      drawRejects(l);
      drawBand(l);
      // striations at fixed phases
      for (const ph of [0.3, 0.6, 0.9]) drawStriations(l, ph * 8000);
      drawMotes(l, 0, -1);
      drawGates(l, 0, -1);
      drawBlooms(l, 0);
      drawTerminus(l, 0);
      drawHeadline(l);
    };

    /* ---- resize ---- */
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const hadMotes = motes.length > 0;
      L = build();
      if (!hadMotes) seedMotes(L);
      if (reduced) drawStatic();
    };

    /* ---- interaction ---- */
    const hoverRef = { current: -1 };
    const hitTest = (px: number, py: number): number => {
      if (!L) return -1;
      for (let i = 0; i < GATES.length; i++) {
        if (
          Math.abs(px - L.gateX[i]) < 28 &&
          py > L.yTop - 22 &&
          py < L.yFloor
        )
          return i;
      }
      return -1;
    };
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const idx = hitTest(px, py);
      canvas.style.cursor = idx >= 0 ? "pointer" : "default";
      if (idx !== hoverRef.current) {
        hoverRef.current = idx;
        setHover(idx >= 0 ? idx : null);
      }
      if (idx >= 0 && L && tooltipRef.current) {
        const tip = tooltipRef.current;
        const tw = tip.offsetWidth || 230;
        let tx = L.gateX[idx] - tw / 2;
        tx = clamp(tx, 8, L.w - tw - 8);
        const ty = clamp(L.yTop - 18 - (tip.offsetHeight || 70), 6, L.h);
        tip.style.left = `${tx}px`;
        tip.style.top = `${ty}px`;
      }
    };
    const onLeave = () => {
      hoverRef.current = -1;
      canvas.style.cursor = "default";
      setHover(null);
    };
    const onClick = () => {
      if (hoverRef.current >= 0) enter(GATES[hoverRef.current].section);
    };

    refreshColors();
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const mo = new MutationObserver(() => {
      refreshColors();
      L = build();
      if (reduced) drawStatic();
    });
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("click", onClick);

    let raf = 0;
    if (reduced) drawStatic();
    else raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mo.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("click", onClick);
    };
  }, [enter]);

  const activeGate = hover != null ? GATES[hover] : null;

  return (
    <div className={cn("absolute inset-0", className)}>
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        style={{ touchAction: "none" }}
        aria-label="Animated funnel: most ML requests are rejected at the Say-No gate; a few reach a GO verdict"
      />
      <div
        ref={tooltipRef}
        className={cn(
          "pointer-events-none absolute z-30 w-[230px] rounded-xl border bg-background/90 px-3.5 py-2.5 shadow-xl backdrop-blur-md transition-opacity duration-200",
          activeGate ? "opacity-100" : "opacity-0",
        )}
        style={{
          display: activeGate ? "block" : "none",
          borderColor: activeGate
            ? `hsl(${
                activeGate.token
                  ? getComputedStyle(canvasRef.current!).getPropertyValue(
                      activeGate.token,
                    ) || activeGate.fallback
                  : activeGate.fallback
              } / 0.3)`
            : undefined,
        }}
      >
        {activeGate && (
          <div>
            <div
              className="font-mono text-[10px] font-bold uppercase tracking-[0.14em]"
              style={{
                color: `hsl(${
                  activeGate.token
                    ? getComputedStyle(
                        canvasRef.current!,
                      ).getPropertyValue(activeGate.token) ||
                      activeGate.fallback
                    : activeGate.fallback
                })`,
              }}
            >
              {activeGate.label}
            </div>
            <div className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">
              {activeGate.desc}
            </div>
            <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.16em] text-foreground/40">
              Click to open · Section {activeGate.section}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
