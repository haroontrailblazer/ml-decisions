import type { ReactNode } from "react";
import { Info, Warning, XCircle, CheckCircle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export type CalloutTone = "info" | "warn" | "danger" | "ok";

const CFG = {
  info: {
    icon: Info,
    cls: "border-brand/30 bg-brand/[0.07]",
    ic: "text-brand",
  },
  warn: {
    icon: Warning,
    cls: "border-warning/40 bg-warning/10",
    ic: "text-warning",
  },
  danger: {
    icon: XCircle,
    cls: "border-destructive/40 bg-destructive/10",
    ic: "text-destructive",
  },
  ok: {
    icon: CheckCircle,
    cls: "border-success/40 bg-success/10",
    ic: "text-success",
  },
} as const;

export function Callout({
  tone,
  title,
  children,
}: {
  tone: CalloutTone;
  title: string;
  children?: ReactNode;
}) {
  const c = CFG[tone];
  const Icon = c.icon;
  return (
    <div
      className={cn(
        "flex animate-fade-in gap-3 rounded-lg border p-3.5 text-sm",
        c.cls,
      )}
    >
      <Icon weight="fill" className={cn("mt-0.5 h-5 w-5 shrink-0", c.ic)} />
      <div className="space-y-1 leading-relaxed">
        <span className="font-semibold text-foreground">{title} </span>
        <span className="text-muted-foreground">{children}</span>
      </div>
    </div>
  );
}
