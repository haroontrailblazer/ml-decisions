import { useEffect, useRef, useState } from "react";
import { useStore } from "@/store";
import { cn } from "@/lib/utils";

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Point2D {
  x: number;
  y: number;
}

// Generate points along a line segment in 2D
function generateLinePoints2D(p1: Point2D, p2: Point2D, count: number): Point2D[] {
  const points: Point2D[] = [];
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    points.push({
      x: p1.x + (p2.x - p1.x) * t,
      y: p1.y + (p2.y - p1.y) * t,
    });
  }
  return points;
}

const NODES_DATA = [
  {
    index: 1, // "The Say-No Gate" (Gate 01)
    name: "01 The Say-No Gate",
    desc: "Should we use ML at all? The 6-word test: if SQL or rules work, say no.",
    color: "hsl(35, 96%, 62%)",
    glowColor: "rgba(249, 115, 22, 0.2)",
    rayColor: "rgba(249, 115, 22, 0.45)",
    edgeColor: "rgba(249, 115, 22, 0.35)",
    edgeHoverColor: "rgba(249, 115, 22, 0.8)",
    // Fixed 3D coordinate position inside the sphere
    x: -140,
    y: 100,
    z: 90,
  },
  {
    index: 2, // "Three Lenses" (Method)
    name: "02 Three Lenses",
    desc: "Value gain, operational fit, and risk profile. Scope early.",
    color: "hsl(258, 92%, 76%)",
    glowColor: "rgba(167, 139, 250, 0.2)",
    rayColor: "rgba(167, 139, 250, 0.45)",
    edgeColor: "rgba(167, 139, 250, 0.35)",
    edgeHoverColor: "rgba(167, 139, 250, 0.8)",
    x: 155,
    y: 90,
    z: -100,
  },
  {
    index: 5, // "Data Architecture" (Foundation)
    name: "03 Data Architecture",
    desc: "The living fuel: volume, freshness, labels, and serving-time parity.",
    color: "hsl(190, 95%, 50%)",
    glowColor: "rgba(6, 182, 212, 0.2)",
    rayColor: "rgba(6, 182, 212, 0.45)",
    edgeColor: "rgba(6, 182, 212, 0.35)",
    edgeHoverColor: "rgba(6, 182, 212, 0.8)",
    x: -130,
    y: -120,
    z: -90,
  },
  {
    index: 6, // "GO / NO-GO Verdict" (Output)
    name: "04 GO / NO-GO Verdict",
    desc: "A weighted readiness score and an exportable one-page scope.",
    color: "hsl(320, 90%, 60%)",
    glowColor: "rgba(236, 72, 153, 0.2)",
    rayColor: "rgba(236, 72, 153, 0.45)",
    edgeColor: "rgba(236, 72, 153, 0.35)",
    edgeHoverColor: "rgba(236, 72, 153, 0.8)",
    x: 140,
    y: -100,
    z: 100,
  },
];

export function SphereAnimation({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const enter = useStore((st) => st.enter);

  const [hoveredNodeIdx, setHoveredNodeIdx] = useState<number | null>(null);

  // Persistent 3D physics state for the nodes
  const physicsNodesRef = useRef(
    NODES_DATA.map((node) => ({
      x: node.x,
      y: node.y,
      z: node.z,
      vx: 0,
      vy: 0,
      vz: 0,
    }))
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;

    // Camera parameters
    const fov = 380;
    const cameraDistance = 450;

    // Sphere configuration (Increased size from 160 to 210)
    const sphereRadius = 210;
    const spherePoints: Point3D[] = [];
    const ringsCount = 18;
    const pointsPerRing = 36;

    // Generate sphere shell points
    for (let i = 1; i < ringsCount; i++) {
      const theta = (i / ringsCount) * Math.PI;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);
      const ringRadius = sphereRadius * sinTheta;
      const y = sphereRadius * cosTheta;

      for (let j = 0; j < pointsPerRing; j++) {
        const phi = (j / pointsPerRing) * Math.PI * 2;
        const x = ringRadius * Math.cos(phi);
        const z = ringRadius * Math.sin(phi);
        spherePoints.push({ x, y, z });
      }
    }

    // Generate Ausdata logo paths (front & back layers)
    const basePaths = [
      generateLinePoints2D({ x: -24, y: -32 }, { x: 6, y: 32 }, 12),  // left leg
      generateLinePoints2D({ x: 6, y: 32 }, { x: 26, y: -32 }, 12),   // right leg
      generateLinePoints2D({ x: 26, y: -32 }, { x: 2, y: -32 }, 8),   // base
      generateLinePoints2D({ x: 2, y: -32 }, { x: 12, y: -8 }, 8),    // inner leg up
      generateLinePoints2D({ x: 12, y: -8 }, { x: 17, y: -18 }, 5),   // closing connection
    ];

    const logoDepth = 10;
    const logoPointsFront: Point3D[][] = [];
    const logoPointsBack: Point3D[][] = [];

    basePaths.forEach((path) => {
      const fPath: Point3D[] = path.map((p) => ({ x: p.x, y: p.y, z: logoDepth / 2 }));
      const bPath: Point3D[] = path.map((p) => ({ x: p.x, y: p.y, z: -logoDepth / 2 }));
      logoPointsFront.push(fPath);
      logoPointsBack.push(bPath);
    });

    // Interaction state
    const pointer = { x: -9999, y: -9999, active: false };
    let tiltX = 0;
    let tiltY = 0;
    let targetTiltX = 0;
    let targetTiltY = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // 3D rotation and projection helper
    const project = (pt: Point3D, rx: number, ry: number): (Point2D & { zDepth: number }) | null => {
      // Rotate around Y axis
      let x1 = pt.x * Math.cos(ry) - pt.z * Math.sin(ry);
      let z1 = pt.x * Math.sin(ry) + pt.z * Math.cos(ry);

      // Rotate around X axis
      let y2 = pt.y * Math.cos(rx) - z1 * Math.sin(rx);
      let z2 = pt.y * Math.sin(rx) + z1 * Math.cos(rx);

      // Perspective projection
      const depth = cameraDistance + z2;
      if (depth <= 0) return null;
      const scale = fov / depth;
      return {
        x: w / 2 + x1 * scale,
        y: h / 2 - y2 * scale, // invert Y for canvas coords
        zDepth: z2,
      };
    };

    // Render loop
    let lastHoveredIdx: number | null = null;
    // A "pinned" node is the one being hovered: it freezes on screen (stops
    // orbiting) and anchors the toast until the cursor leaves it.
    let pinnedIdx: number | null = null;
    let pinnedPos: Point2D | null = null;

    const draw = (time: number) => {
      ctx.clearRect(0, 0, w, h);

      // Slowly rotate background base angles
      const angleY = time * 0.00015;
      const angleX = time * 0.00006;

      // Interpolate tilt from mouse interaction
      tiltX += (targetTiltX - tiltX) * 0.08;
      tiltY += (targetTiltY - tiltY) * 0.08;

      const rx = angleX + tiltX;
      const ry = angleY + tiltY;

      // Project all sphere shell points
      const projectedShell = spherePoints
        .map((p) => project(p, rx, ry))
        .filter((p): p is NonNullable<typeof p> => p !== null);

      // Split into back and front halves for depth layering
      const backShell = projectedShell.filter((p) => p.zDepth < 0);
      const frontShell = projectedShell.filter((p) => p.zDepth >= 0);

      // Calculate nodes positions using 3D spring-mass-damper physics
      const projectedNodes = NODES_DATA.map((node, idx) => {
        const pNode = physicsNodesRef.current[idx];

        // A pinned (hovered) node freezes in place — no orbit, no drift.
        if (idx === pinnedIdx) {
          pNode.vx = 0;
          pNode.vy = 0;
          pNode.vz = 0;
          const proj = project({ x: pNode.x, y: pNode.y, z: pNode.z }, rx, ry);
          return { ...node, proj, pt3d: { x: pNode.x, y: pNode.y, z: pNode.z } };
        }

        // Target orbital position (nodes share speed & spacing to prevent collision)
        const orbitAngle = time * 0.00025 + idx * (Math.PI / 2);
        const targetRadius = 145;
        const targetX = targetRadius * Math.cos(orbitAngle);
        const targetZ = targetRadius * Math.sin(orbitAngle);
        const targetY = 70 * Math.sin(idx * 1.7);

        // Spring force towards target
        const springK = 0.015;
        const ax = (targetX - pNode.x) * springK;
        const ay = (targetY - pNode.y) * springK;
        const az = (targetZ - pNode.z) * springK;

        // Mouse cursor attraction force in 3D
        let worldFx = 0;
        let worldFy = 0;
        let worldFz = 0;

        const currentProj = project({ x: pNode.x, y: pNode.y, z: pNode.z }, rx, ry);
        if (pointer.active && currentProj && pinnedIdx === null) {
          const dx = pointer.x - currentProj.x;
          const dy = pointer.y - currentProj.y;
          const dist2D = Math.hypot(dx, dy);
          
          if (dist2D < 160) {
            const force = (1 - dist2D / 160) * 0.35;
            const fx = dx * force * 0.012;
            const fy = -dy * force * 0.012;
            
            worldFx = fx * Math.cos(ry) + fy * Math.sin(rx) * Math.sin(ry);
            worldFy = fy * Math.cos(rx);
            worldFz = fx * Math.sin(ry) - fy * Math.sin(rx) * Math.cos(ry);
          }
        }

        // Integrate equations of motion
        const damping = 0.88;
        pNode.vx = (pNode.vx + ax + worldFx) * damping;
        pNode.vy = (pNode.vy + ay + worldFy) * damping;
        pNode.vz = (pNode.vz + az + worldFz) * damping;

        pNode.x += pNode.vx;
        pNode.y += pNode.vy;
        pNode.z += pNode.vz;

        const proj = project({ x: pNode.x, y: pNode.y, z: pNode.z }, rx, ry);
        return {
          ...node,
          proj,
          pt3d: { x: pNode.x, y: pNode.y, z: pNode.z },
        };
      });

      // 1. Draw back half of the sphere shell (with larger size dots and higher opacity)
      ctx.fillStyle = "rgba(156, 163, 175, 0.13)";
      for (const p of backShell) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.3, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Draw central 3D wireframe logo (Teal/Green)
      ctx.strokeStyle = "rgba(20, 184, 166, 0.18)";
      ctx.lineWidth = 0.8;
      ctx.fillStyle = "rgba(20, 184, 166, 0.25)";

      // Project logo points (static center element, no rotation)
      const projFront = logoPointsFront.map((path) =>
        path.map((pt) => project(pt, 0, 0))
      );
      const projBack = logoPointsBack.map((path) =>
        path.map((pt) => project(pt, 0, 0))
      );

      // Draw wireframe paths for front and back layers
      for (let pIdx = 0; pIdx < projFront.length; pIdx++) {
        const pf = projFront[pIdx];
        const pb = projBack[pIdx];

        // Draw front path lines
        ctx.beginPath();
        for (let i = 0; i < pf.length; i++) {
          const pt = pf[i];
          if (!pt) continue;
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();

        // Draw back path lines
        ctx.beginPath();
        for (let i = 0; i < pb.length; i++) {
          const pt = pb[i];
          if (!pt) continue;
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();

        // Draw Z-connecting lines between layers
        for (let i = 0; i < pf.length; i += 2) {
          const ptf = pf[i];
          const ptb = pb[i];
          if (ptf && ptb) {
            ctx.beginPath();
            ctx.moveTo(ptf.x, ptf.y);
            ctx.lineTo(ptb.x, ptb.y);
            ctx.stroke();
          }
        }
      }

      // Draw logo dots (slightly jittery/shimmering)
      const shimmer = Math.sin(time * 0.005) * 0.2;
      for (let pIdx = 0; pIdx < projFront.length; pIdx++) {
        const pf = projFront[pIdx];
        const pb = projBack[pIdx];
        for (let i = 0; i < pf.length; i++) {
          const ptf = pf[i];
          const ptb = pb[i];
          if (ptf) {
            ctx.beginPath();
            ctx.arc(ptf.x, ptf.y, 0.9 + shimmer, 0, Math.PI * 2);
            ctx.fill();
          }
          if (ptb) {
            ctx.beginPath();
            ctx.arc(ptb.x, ptb.y, 0.6 + shimmer, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Draw central static focal node
      const centerProj = project({ x: 0, y: 0, z: 0 }, 0, 0);
      if (centerProj) {
        ctx.fillStyle = "rgba(20, 184, 166, 0.25)";
        ctx.beginPath();
        ctx.arc(centerProj.x, centerProj.y, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(20, 184, 166, 0.85)";
        ctx.beginPath();
        ctx.arc(centerProj.x, centerProj.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Pin / unpin the hovered node. A pinned node stops moving (drawn at its
      //    frozen screen position) and stays pinned until the cursor leaves it.
      if (pinnedIdx !== null) {
        const stillNear =
          pointer.active &&
          pinnedPos !== null &&
          Math.hypot(pointer.x - pinnedPos.x, pointer.y - pinnedPos.y) < 30;
        if (!stillNear) {
          pinnedIdx = null;
          pinnedPos = null;
        }
      }
      if (pinnedIdx === null && pointer.active) {
        for (let i = 0; i < projectedNodes.length; i++) {
          const node = projectedNodes[i];
          if (!node.proj) continue;
          const dist = Math.hypot(pointer.x - node.proj.x, pointer.y - node.proj.y);
          if (dist < 18) {
            pinnedIdx = i;
            pinnedPos = { x: node.proj.x, y: node.proj.y };
            break;
          }
        }
      }
      const hoveredIdx: number | null = pinnedIdx;

      // Screen position to draw a node at — the pinned one is frozen in place.
      const drawPos = (idx: number, proj: Point2D | null | undefined): Point2D | null =>
        idx === pinnedIdx && pinnedPos ? pinnedPos : proj ?? null;

      // 3. Draw connection lines (edges) from center logo to nodes (with vibrant custom colors)
      projectedNodes.forEach((node, idx) => {
        const dp = drawPos(idx, node.proj);
        if (!dp) return;
        const centerProj = project({ x: 0, y: 0, z: 0 }, rx, ry);
        if (centerProj) {
          const isHovered = hoveredIdx === idx;
          ctx.strokeStyle = isHovered ? node.edgeHoverColor : node.edgeColor;
          ctx.lineWidth = isHovered ? 1.0 : 0.75;
          ctx.beginPath();
          ctx.moveTo(centerProj.x, centerProj.y);
          ctx.lineTo(dp.x, dp.y);
          ctx.stroke();
        }
      });

      // Update hover state if changed
      if (hoveredIdx !== lastHoveredIdx) {
        setHoveredNodeIdx(hoveredIdx);
        lastHoveredIdx = hoveredIdx;
      }

      // Set pointer cursor on hover
      canvas.style.cursor = hoveredIdx !== null ? "pointer" : "default";

      // 6. Draw front half of the sphere shell (drawn before nodes so they are never muted)
      ctx.fillStyle = "rgba(243, 244, 246, 0.32)";
      for (const p of frontShell) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.9, 0, Math.PI * 2);
        ctx.fill();
      }

      // 5. Draw Orbiting Nodes last (on top of front shell, with larger shapes and glows)
      projectedNodes.forEach((node, idx) => {
        const dp = drawPos(idx, node.proj);
        if (!dp) return;

        const isHovered = hoveredIdx === idx;
        const px = dp.x;
        const py = dp.y;

        // Draw connecting beams of light if hovered
        if (isHovered) {
          const centerProj = project({ x: 0, y: 0, z: 0 }, rx, ry);
          if (centerProj) {
            ctx.strokeStyle = node.rayColor;
            ctx.lineWidth = 1.0;
            for (let r = 0; r < 3; r++) {
              const jitterX = (Math.random() - 0.5) * 6;
              const jitterY = (Math.random() - 0.5) * 6;
              ctx.beginPath();
              ctx.moveTo(centerProj.x, centerProj.y);
              ctx.lineTo(px + jitterX, py + jitterY);
              ctx.stroke();
            }
          }
        }

        // Draw radial halo glow (larger size)
        ctx.fillStyle = node.glowColor;
        ctx.beginPath();
        const glowRadius = isHovered ? 32 + Math.sin(time * 0.01) * 3 : 20;
        ctx.arc(px, py, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Draw colored sphere node center (larger size)
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(px, py, isHovered ? 7.2 : 5.0, 0, Math.PI * 2);
        ctx.fill();

        // Draw small inner core sparkle (larger size)
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.beginPath();
        ctx.arc(px - 1.2, py - 1.2, isHovered ? 1.8 : 1.2, 0, Math.PI * 2);
        ctx.fill();
      });


      // Anchor the toast to the pinned (frozen) node position
      if (hoveredIdx !== null && pinnedPos && tooltipRef.current) {
        const tooltip = tooltipRef.current;
        const tooltipWidth = tooltip.offsetWidth || 250;
        const tooltipHeight = tooltip.offsetHeight || 90;

        let tx = pinnedPos.x - tooltipWidth / 2;
        let ty = pinnedPos.y - tooltipHeight - 16;

        // Constraints to keep tooltip within canvas container
        if (tx < 10) tx = 10;
        if (tx + tooltipWidth > w - 10) tx = w - tooltipWidth - 10;
        if (ty < 10) ty = pinnedPos.y + 16;

        tooltip.style.left = `${tx}px`;
        tooltip.style.top = `${ty}px`;
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    // Event listeners
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      pointer.x = clientX;
      pointer.y = clientY;
      pointer.active = true;

      // Mouse position relative to center for tilt effect
      targetTiltX = ((clientY / h) - 0.5) * 0.45;
      targetTiltY = ((clientX / w) - 0.5) * 0.45;
    };

    const onLeave = () => {
      pointer.active = false;
      pointer.x = -9999;
      pointer.y = -9999;
      targetTiltX = 0;
      targetTiltY = 0;
      setHoveredNodeIdx(null);
      lastHoveredIdx = null;
      pinnedIdx = null;
      pinnedPos = null;
    };

    const onClick = () => {
      if (lastHoveredIdx !== null) {
        const node = NODES_DATA[lastHoveredIdx];
        enter(node.index);
      }
    };

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("click", onClick);
    };
  }, [enter]);

  const activeNode = hoveredNodeIdx !== null ? NODES_DATA[hoveredNodeIdx] : null;

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full h-full select-none", className)}
      style={{ touchAction: "none" }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        aria-label="Interactive 3D network sphere presenting ML intake categories"
      />

      {/* Interactive Floating Tooltip */}
      <div
        ref={tooltipRef}
        className={cn(
          "absolute pointer-events-none rounded-xl border border-cyan-500/25 bg-background/90 px-4 py-3 shadow-[0_0_24px_rgba(6,182,212,0.18)] backdrop-blur-md transition-all duration-300 w-[260px] ease-out z-30",
          activeNode ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}
        style={{
          display: activeNode ? "block" : "none",
        }}
      >
        {activeNode && (
          <div>
            <div
              className="text-xs font-mono font-bold uppercase tracking-wider"
              style={{ color: activeNode.color }}
            >
              {activeNode.name}
            </div>
            <div className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">
              {activeNode.desc}
            </div>
            <div className="mt-2 text-[9px] font-mono uppercase tracking-[0.16em] text-white/40 flex items-center gap-1">
              <span>Click to open</span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span>Gate {activeNode.index}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
