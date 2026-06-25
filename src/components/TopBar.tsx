import { Moon, Sun, FloppyDisk } from "@phosphor-icons/react";
import { useStore } from "@/store";
import { computeScores } from "@/lib/scoring";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { VerdictChip } from "./Verdict";

export function TopBar() {
  const answers = useStore((st) => st.answers);
  const theme = useStore((st) => st.theme);
  const toggleTheme = useStore((st) => st.toggleTheme);
  const sc = computeScores(answers);

  return (
    <header className="shrink-0 border-b border-white/[0.06]">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card">
            <svg
              viewBox="0 0 24 24"
              className="h-[18px] w-[18px] text-foreground"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="6.5" cy="6.5" r="1.7" />
              <circle cx="6.5" cy="17.5" r="1.7" />
              <circle cx="17.5" cy="12" r="1.7" />
              <path d="M8.2 6.5H12a2 2 0 0 1 2 2v0M8.2 17.5H12a2 2 0 0 0 2-2v0" />
            </svg>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">
              ML Intake <span className="text-muted-foreground">/ Scoping</span>
            </div>
            <div className="hidden text-[11px] text-muted-foreground sm:block">
              say no to ML when the world says yes
            </div>
          </div>
        </div>

        <div className="flex-1" />

        <div className="hidden items-center gap-1.5 text-[11px] text-muted-foreground md:flex">
          <FloppyDisk weight="fill" className="h-3.5 w-3.5 text-success" />
          Auto-saved
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden w-40 sm:block">
            <div className="mb-1 flex items-center justify-between text-[11px]">
              <span className="font-medium text-muted-foreground">Readiness</span>
              <span className="font-bold">{sc.readiness}%</span>
            </div>
            <Progress
              value={sc.readiness}
              className="h-2"
              indicatorClassName="bg-brand"
            />
          </div>
          <VerdictChip verdict={sc.verdict} />
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="h-9 w-9"
        >
          {theme === "dark" ? (
            <Sun weight="fill" className="h-4 w-4" />
          ) : (
            <Moon weight="fill" className="h-4 w-4" />
          )}
        </Button>
      </div>
    </header>
  );
}
