import { useEffect, useRef, useState } from "react";
import { CaretDown, Check, House, Moon, Sun } from "@phosphor-icons/react";
import { useStore } from "@/store";
import { SECTIONS } from "@/data/sections";
import { SectionGlyph } from "@/data/icons";
import { computeScores } from "@/lib/scoring";
import { sectionDone } from "@/lib/progress";
import { cn } from "@/lib/utils";
import { VerdictChip } from "./Verdict";

function Logo({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex h-full items-center gap-4"
      aria-label="Home"
    >
      <span className="flex h-12 w-12 items-center justify-center text-foreground">
        {/* Stylized A Logo */}
        <svg
          viewBox="0 0 24 24"
          className="h-8 w-8 text-foreground"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 20 L13 4 M13 4 L20 20 M20 20 L12 20 M12 20 L15 13 M15 13 L8 13" />
        </svg>
      </span>
      <span className="hidden h-full w-px bg-border/40 sm:block" />
    </button>
  );
}

const NAV_LINKS = [
  ["The Gates", "#gates"],
  ["Method", "#method"],
  ["Framework", "#suite"],
  ["Verdict", "#verdict"],
  ["References", "#footer"],
] as const;

function ThemeToggle() {
  const theme = useStore((st) => st.theme);
  const toggleTheme = useStore((st) => st.toggleTheme);
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="flex h-[54px] w-[54px] items-center justify-center rounded-[3px] border border-white/18 bg-black/20 text-white transition-colors hover:border-white/45 hover:bg-white/5"
    >
      {theme === "dark" ? (
        <Moon weight="regular" className="h-4 w-4" />
      ) : (
        <Sun weight="regular" className="h-4 w-4" />
      )}
    </button>
  );
}

function SectionsMenu() {
  const current = useStore((st) => st.current);
  const enter = useStore((st) => st.enter);
  const answers = useStore((st) => st.answers);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-border/80 bg-card/20 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground transition-colors hover:border-foreground/30 hover:bg-accent"
      >
        Sections
        <CaretDown
          className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-xl border border-border bg-popover p-1.5 shadow-2xl shadow-black/50">
          {SECTIONS.map((sec, i) => {
            const active = i === current;
            const done = sectionDone(sec, answers);
            return (
              <button
                key={sec.id}
                onClick={() => {
                  enter(i);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  active
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border",
                    done
                      ? "border-success bg-success text-success-foreground"
                      : active
                        ? "border-brand bg-brand/10 text-brand"
                        : "border-border text-muted-foreground",
                  )}
                >
                  {done ? (
                    <Check weight="bold" className="h-3.5 w-3.5" />
                  ) : (
                    <SectionGlyph name={sec.icon} className="h-3.5 w-3.5" />
                  )}
                </span>
                <span className="truncate">{sec.title}</span>
                {sec.gate && (
                  <span className="ml-auto rounded-full border border-warning/40 bg-warning/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-warning">
                    Gate
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Navbar({ mode }: { mode: "home" | "intake" }) {
  const enter = useStore((st) => st.enter);
  const exitHome = useStore((st) => st.exitHome);
  const answers = useStore((st) => st.answers);
  const sc = computeScores(answers);

  const scrollTo = (hash: string) => {
    const el = document.querySelector(hash);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-transparent px-4 py-5 sm:px-8">
      <div className="mx-auto flex h-[86px] max-w-[1600px] items-center justify-between rounded-[4px] border border-white/18 bg-black/78 px-7 py-0 shadow-[0_18px_55px_rgba(0,0,0,0.34)] backdrop-blur-xl">
        <Logo onClick={exitHome} />

        {mode === "home" ? (
          <nav className="hidden items-center gap-8 lg:flex xl:gap-10">
            {NAV_LINKS.map(([label, hash]) => (
              <button
                key={label}
                onClick={() => scrollTo(hash)}
                className="nav-link font-display text-[13px] font-semibold uppercase tracking-[0.2em] text-white/72 transition-colors hover:text-white"
              >
                {label}
              </button>
            ))}
          </nav>
        ) : (
          <button onClick={exitHome} className="nav-link ml-2 hidden items-center gap-1.5 sm:flex text-[10px] tracking-[0.2em]">
            <House weight="fill" className="h-3.5 w-3.5" />
            Home
          </button>
        )}

        {mode === "intake" ? (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Readiness
              </div>
              <div className="font-display text-base font-medium leading-none">
                {sc.readiness}%
              </div>
            </div>
            <VerdictChip verdict={sc.verdict} />
            <SectionsMenu />
          </div>
        ) : (
          <div className="hidden h-full items-center gap-2 border-l border-white/10 pl-5 sm:flex">
            <button className="home-contact-fix hidden h-[54px] items-center justify-center rounded-[3px] border border-white/18 bg-black/20 px-5 font-display text-[13px] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:border-white/45 hover:bg-white/5 sm:inline-flex">
              <span className="contact-copy">• Contact •</span>
              • Contact •
            </button>
            <ThemeToggle />
            <button className="hidden h-[54px] min-w-[54px] items-center justify-center rounded-[3px] border border-white/18 bg-black/20 px-3 font-display text-[13px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:border-white/45 hover:bg-white/5 sm:flex">
              EN
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
