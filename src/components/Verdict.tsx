import {
  CheckCircle,
  Warning,
  XCircle,
  Prohibit,
  CircleDashed,
  type IconProps,
} from "@phosphor-icons/react";
import type { ComponentType } from "react";
import type { Verdict } from "@/types";
import { verdictTone, type VerdictTone } from "@/lib/scoring";
import { cn } from "@/lib/utils";

export const VERDICT_ICON: Record<Verdict, ComponentType<IconProps>> = {
  GO: CheckCircle,
  CAUTION: Warning,
  "NO-GO": XCircle,
  BLOCKED: Prohibit,
  "NOT READY": CircleDashed,
};

export const TONE_CLASS: Record<VerdictTone, string> = {
  success: "border-success/40 bg-success/15 text-success",
  warning: "border-warning/50 bg-warning/15 text-warning",
  destructive: "border-destructive/40 bg-destructive/15 text-destructive",
  block: "border-brand/40 bg-brand/15 text-brand",
  muted: "border-border bg-secondary text-muted-foreground",
};

export function VerdictChip({
  verdict,
  className,
  big,
}: {
  verdict: Verdict;
  className?: string;
  big?: boolean;
}) {
  const tone = verdictTone(verdict);
  const Icon = VERDICT_ICON[verdict];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-bold tracking-wide",
        big ? "px-4 py-1.5 text-sm" : "px-3 py-1 text-xs",
        TONE_CLASS[tone],
        className,
      )}
    >
      <Icon weight="fill" className={big ? "h-4 w-4" : "h-3.5 w-3.5"} />
      {verdict}
    </span>
  );
}
