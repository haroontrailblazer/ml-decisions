import { useState } from "react";
import { ArrowRight, Plus, ArrowsOut, CornersOut } from "@phosphor-icons/react";
import { useStore } from "@/store";
import { SECTIONS } from "@/data/sections";
import { SectionGlyph } from "@/data/icons";
import { cn } from "@/lib/utils";
import { Constellation } from "./Constellation";
import { SphereAnimation } from "./SphereAnimation";

/* ---------------- data: framework mapped to ausdata's product cards ---------------- */
const CARDS: {
  idx: number;
  title: string;
  desc: string;
  label: string;
  cta: string;
}[] = [
  {
    idx: 1,
    title: "The Say-No Gate",
    desc: "Should we use ML at all? The 6-Word Test — if a SQL query or if-else rule works, say no.",
    label: "Gate 01",
    cta: "Run the gate",
  },
  {
    idx: 2,
    title: "Three Lenses",
    desc: "Value gain, operational fit and risk profile. A model can be technically great and a bad project.",
    label: "Method",
    cta: "Weigh it up",
  },
  {
    idx: 5,
    title: "Data Architecture",
    desc: "The living fuel: volume, freshness, labels, leakage and serving-time parity.",
    label: "Foundation",
    cta: "Audit the data",
  },
  {
    idx: SECTIONS.length - 1,
    title: "GO / NO-GO Verdict",
    desc: "A weighted readiness score and an exportable one-page scope you can hand to the sponsor.",
    label: "Output",
    cta: "See the verdict",
  },
];

const FEATURES = [
  ["First principles", "Every gate traces to a documented rule — Google's Rules of ML, Huyen, the EU AI Act."],
  ["Evidence-based", "Readiness is scored from your answers, with contextual traps — not a gut feel."],
  ["Exportable", "Copy, download or print a one-page scope document in a single click."],
];

const FOOTER = [
  ["Framework", ["The Gates", "Three Lenses", "Data Architecture", "Verdict"]],
  ["Method", ["6-Word Test", "Metric Ladder", "Baseline & Rollback", "Feedback Loop"]],
  ["Explore", ["References", "Export", "About"]],
  ["Legal", ["Privacy", "Terms"]],
] as const;

/* ---------------- the interactive "+ EXPAND" constellation panel ---------------- */
function ExpandPanel() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="mx-auto mt-12 max-w-3xl">
      <div
        className={cn(
          "surface relative overflow-hidden rounded-2xl transition-[height] duration-500",
          expanded ? "h-[460px]" : "h-[300px]",
        )}
      >
        <div className="grid-field absolute inset-0" />
        <Constellation className="absolute inset-0" count={expanded ? 40 : 26} />

        {/* + EXPAND toggle, centered at top like the reference */}
        <button
          onClick={() => setExpanded((e) => !e)}
          className="absolute left-1/2 top-4 inline-flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur transition-colors hover:border-foreground/30 hover:text-foreground"
        >
          {expanded ? (
            <CornersOut weight="bold" className="h-3 w-3" />
          ) : (
            <Plus weight="bold" className="h-3 w-3" />
          )}
          {expanded ? "Collapse" : "Expand"}
        </button>

        <span className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
          decision space · live
        </span>
      </div>
    </div>
  );
}

/* ---------------- landing page ---------------- */
export function Landing() {
  const enter = useStore((st) => st.enter);

  return (
    <main className="animate-fade-in">
      {/* ============ HERO ============ */}
      <section className="hero-reference relative isolate -mt-[126px] grid min-h-screen w-full items-center gap-10 overflow-hidden px-5 pb-14 pt-[172px] sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(390px,0.86fr)] lg:gap-16 lg:px-[max(2rem,calc((100vw-1180px)/2))] lg:pt-[190px]">

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_74%_48%,rgba(14,165,183,0.14),transparent_18%),radial-gradient(circle_at_38%_25%,rgba(56,189,248,0.08),transparent_22%),linear-gradient(180deg,rgba(0,0,0,0.18),rgba(0,0,0,0.72))]"
        />
        
        {/* Vertical dividing line separator in the center of the columns */}
        <div className="pointer-events-none absolute bottom-10 left-1/2 top-[172px] hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/16 to-white/10 lg:block" />

        {/* Scroll indicator at the bottom-center of the separator */}
        <div className="pointer-events-none absolute bottom-[42px] left-1/2 hidden -translate-x-1/2 select-none flex-col items-center gap-3 lg:flex">
          <span className="font-display text-[11px] uppercase tracking-[0.34em] text-white/64">
            Scroll
          </span>
          <span className="h-14 w-px bg-white/10" />
        </div>

        <div className="mx-auto flex max-w-[620px] flex-col items-start text-left">
          <h1 className="font-display text-[clamp(2.7rem,12vw,3.35rem)] font-medium italic leading-[0.86] tracking-normal text-white sm:text-[clamp(3.2rem,14vw,4.25rem)] lg:text-[clamp(4.2rem,7.4vw,6.25rem)]">
            ML Decisions.
            <br />
            <span className="not-italic text-white/[0.28]">Structured.</span>
          </h1>

          <div className="font-display mt-12 space-y-2 text-[clamp(1.25rem,1.8vw,1.62rem)] font-medium leading-snug text-white/76">
            <p>Should you use ML at all?</p>
            <p>A first-principles intake framework</p>
            <p>From brief to GO / NO-GO verdict</p>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-3 font-display text-[13px] font-semibold uppercase tracking-[0.34em] text-white/68">
            <span>Gates</span>
            <span className="hero-clean-bullet text-[#4b46ff]/70">•</span>
            <span className="text-muted-foreground/30">•</span>
            <span>Metrics</span>
            <span className="hero-clean-bullet text-[#4b46ff]/70">•</span>
            <span className="text-muted-foreground/30">•</span>
            <span>Verdict</span>
          </div>

          <div className="mt-14 flex flex-wrap gap-6">
            <button onClick={() => enter(0)} className="btn-aus hero-cta">
              Begin Intake
              <ArrowRight weight="bold" className="ml-3 h-4 w-4" />
            </button>
            <button onClick={() => enter(1)} className="btn-aus hero-cta">
              Run the Say-No Gate
              <ArrowRight weight="bold" className="ml-3 h-4 w-4" />
            </button>
          </div>
        </div>

        {/* circular constellation */}
        <div className="relative mx-auto flex aspect-square w-full max-w-[560px] items-center justify-center lg:max-w-[620px] lg:-translate-y-14">
          <div className="absolute -inset-10">
            <SphereAnimation className="h-full w-full" />
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-6 -z-10 rounded-full bg-cyan-400/8 blur-[70px]"
          />

        </div>
      </section>

      {/* ============ TRUST STRIP ============ */}
      <section className="border-y border-border/60">
        <div className="mx-auto max-w-[1240px] px-5 py-10 sm:px-8">
          <p className="eyebrow text-center">Grounded in production-ML practice</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-75">
            {["Google · Rules of ML", "EU AI Act", "Chip Huyen", "Hugging Face"].map(
              (m) => (
                <span
                  key={m}
                  className="font-display text-base font-medium tracking-tight text-foreground/80"
                >
                  {m}
                </span>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ============ PRODUCT SUITE ============ */}
      <section id="suite" className="mx-auto max-w-[1240px] px-5 pb-8 pt-20 sm:px-8">
        <p className="eyebrow text-center">The Framework</p>
        <h2 className="font-display mt-3 text-center text-[clamp(1.9rem,4vw,2.9rem)] font-medium italic">
          The ML Decision Suite
        </h2>
        <ExpandPanel />
      </section>

      {/* ============ CARD GRID ============ */}
      <section id="gates" className="mx-auto max-w-[1240px] px-5 pt-10 sm:px-8">
        <div className="hairline-grid grid overflow-hidden rounded-2xl border border-border sm:grid-cols-2">
          {CARDS.map((c) => {
            const sec = SECTIONS[c.idx];
            return (
              <button
                key={c.title}
                onClick={() => enter(c.idx)}
                className="group flex min-h-[210px] flex-col items-start gap-4 p-7 text-left transition-colors hover:bg-accent/30 sm:p-9"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-secondary/40 text-brand transition-colors group-hover:border-brand/50">
                  <SectionGlyph
                    name={sec.icon}
                    weight="duotone"
                    className="h-[22px] w-[22px]"
                  />
                </span>
                <div>
                  <h3 className="font-display text-xl font-medium leading-snug">
                    {c.title}
                  </h3>
                  <p className="mt-2 max-w-sm text-[13.5px] leading-relaxed text-muted-foreground">
                    {c.desc}
                  </p>
                </div>
                <span className="mt-auto inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-brand">
                  {c.label}
                  <ArrowRight
                    weight="bold"
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                  />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ============ FEATURE ROW ============ */}
      <section id="method" className="mx-auto max-w-[1240px] px-5 pt-6 sm:px-8">
        <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
          {FEATURES.map(([t, d], i) => (
            <div key={t} className="bg-background p-7">
              <div className="flex items-center gap-2">
                <CornersOut weight="duotone" className="h-4 w-4 text-brand" />
                <span className="eyebrow">0{i + 1}</span>
              </div>
              <div className="font-display mt-3 text-lg font-medium">{t}</div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                {d}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ BOTTOM CTA ============ */}
      <section id="verdict" className="mx-auto max-w-[1240px] px-5 py-28 text-center sm:px-8">
        <h2 className="font-display text-[clamp(2rem,5vw,3.4rem)] font-medium leading-[1.05]">
          Built for consultants.
          <br />
          <span className="text-muted-foreground">Ready for the call.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          A structured intake and a defensible GO / NO-GO verdict, ready before you
          quote the work. Runs entirely in your browser.
        </p>
        <div className="mt-9 flex justify-center">
          <button onClick={() => enter(0)} className="btn-aus btn-aus-solid">
            Begin an Intake
            <ArrowRight weight="bold" className="h-3.5 w-3.5" />
          </button>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer id="footer" className="border-t border-border/60">
        <div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.6fr_1fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-foreground"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="6.5" cy="6.5" r="1.7" />
                  <circle cx="6.5" cy="17.5" r="1.7" />
                  <circle cx="17.5" cy="12" r="1.7" />
                  <path d="M8.2 6.5H12a2 2 0 0 1 2 2v0M8.2 17.5H12a2 2 0 0 0 2-2v0" />
                </svg>
              </span>
              <span className="font-display text-base font-medium">ML Intake.AI</span>
            </div>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              First principles · GO / NO-GO
            </p>
          </div>

          {FOOTER.map(([heading, links]) => (
            <div key={heading}>
              <div className="eyebrow">{heading}</div>
              <ul className="mt-4 space-y-2.5">
                {links.map((l) => (
                  <li key={l}>
                    <span className="cursor-pointer text-[13px] text-muted-foreground transition-colors hover:text-foreground">
                      {l}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-border/60">
          <div className="mx-auto max-w-[1240px] px-5 py-6 text-center text-[11px] tracking-wide text-muted-foreground/70 sm:px-8">
            © 2026 ML Intake · Built on first principles. For client scoping use.
          </div>
        </div>
      </footer>
    </main>
  );
}
