import { Check } from "@phosphor-icons/react";
import { useStore } from "@/store";
import { SECTIONS } from "@/data/sections";
import { SectionGlyph } from "@/data/icons";
import type { Answers, Section } from "@/types";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export function sectionDone(sec: Section, answers: Answers): boolean {
  if (sec.summary) return false;
  const ids = sec.fields.map((f) => f.id);
  if (!ids.length) return false;
  let filled = 0;
  ids.forEach((id) => {
    const v = answers[id];
    if (Array.isArray(v) ? v.length : v != null && String(v).trim() !== "")
      filled++;
  });
  return filled / ids.length >= 0.6;
}

export function Sidebar() {
  const current = useStore((st) => st.current);
  const goto = useStore((st) => st.goto);
  const answers = useStore((st) => st.answers);

  const doneCount = SECTIONS.filter((s) => sectionDone(s, answers)).length;
  const total = SECTIONS.length - 1; // exclude summary from the count

  return (
    <nav className="hidden w-72 shrink-0 overflow-y-auto border-r border-white/[0.06] px-3 py-5 lg:block">
      <div className="px-3 pb-4">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-semibold uppercase tracking-wider text-muted-foreground">
            Progress
          </span>
          <span className="font-bold text-foreground">
            {doneCount}/{total}
          </span>
        </div>
        <Progress
          value={(doneCount / total) * 100}
          className="h-1.5"
          indicatorClassName="bg-brand"
        />
      </div>

      <div className="space-y-1">
        {SECTIONS.map((sec, i) => {
          const active = i === current;
          const done = sectionDone(sec, answers);
          return (
            <button
              key={sec.id}
              onClick={() => goto(i)}
              className={cn(
                "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                active
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
              )}
            >
              {active && (
                <span className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-brand" />
              )}
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors",
                  done
                    ? "border-success bg-success text-success-foreground"
                    : active
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-border text-muted-foreground group-hover:border-foreground/30",
                )}
              >
                {done ? (
                  <Check weight="bold" className="h-4 w-4" />
                ) : (
                  <SectionGlyph
                    name={sec.icon}
                    weight={active ? "fill" : "regular"}
                    className="h-4 w-4"
                  />
                )}
              </span>
              <span className="truncate font-medium">{sec.title}</span>
              {sec.gate && (
                <span className="ml-auto rounded-full border border-warning/40 bg-warning/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-warning">
                  Gate
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
