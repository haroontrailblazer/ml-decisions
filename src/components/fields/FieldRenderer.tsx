import type { ReactNode } from "react";
import { Info } from "@phosphor-icons/react";
import { useStore } from "@/store";
import type { Field, OptionKind } from "@/types";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function WhyTip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="mt-0.5 shrink-0 text-muted-foreground/60 transition-colors hover:text-brand"
          aria-label="Why this matters"
        >
          <Info weight="fill" className="h-4 w-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <span className="font-semibold text-brand">Why: </span>
        {text}
      </TooltipContent>
    </Tooltip>
  );
}

function FieldShell({
  field,
  children,
}: {
  field: Field;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2.5">
      {field.label && (
        <div className="flex items-start gap-1.5">
          <Label className="text-[15px] font-semibold leading-snug">
            {field.label}
          </Label>
          {field.why && <WhyTip text={field.why} />}
        </div>
      )}
      {field.help && (
        <p className="-mt-1 text-[13px] text-muted-foreground">{field.help}</p>
      )}
      {children}
    </div>
  );
}

const PILL_BASE =
  "rounded-md border px-3.5 py-2 text-sm font-medium transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function selClass(k?: OptionKind) {
  switch (k) {
    case "good":
      return "border-success bg-success text-success-foreground";
    case "bad":
      return "border-destructive bg-destructive text-destructive-foreground";
    case "warn":
      return "border-warning bg-warning text-warning-foreground";
    default:
      return "border-primary bg-primary text-primary-foreground";
  }
}

function RadioPills({ field }: { field: Field }) {
  const value = useStore((st) => st.answers[field.id]) as string | undefined;
  const setField = useStore((st) => st.setField);
  return (
    <div className="flex flex-wrap gap-2">
      {field.options!.map((o) => {
        const sel = value === o.v;
        return (
          <button
            key={o.v}
            type="button"
            onClick={() => setField(field.id, sel ? "" : o.v)}
            className={cn(
              PILL_BASE,
              sel
                ? selClass(o.k)
                : "border-input bg-secondary/40 text-muted-foreground hover:border-foreground/40 hover:bg-accent hover:text-foreground",
            )}
          >
            {o.l}
          </button>
        );
      })}
    </div>
  );
}

function Checks({ field }: { field: Field }) {
  const value =
    (useStore((st) => st.answers[field.id]) as string[] | undefined) ?? [];
  const toggle = useStore((st) => st.toggleCheck);
  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {field.options!.map((o) => {
        const sel = value.includes(o.v);
        return (
          <button
            key={o.v}
            type="button"
            onClick={() => toggle(field.id, o.v)}
            className={cn(
              "flex items-start gap-3 rounded-lg border p-3 text-left transition-all hover:-translate-y-px",
              sel
                ? "border-brand bg-brand/10 shadow-sm shadow-brand/20"
                : "border-input bg-secondary/30 hover:border-foreground/30 hover:bg-accent/60",
            )}
          >
            <Checkbox
              checked={sel}
              tabIndex={-1}
              className="pointer-events-none mt-0.5"
            />
            <span className="space-y-0.5">
              <span className="block text-sm font-medium leading-tight">
                {o.l}
              </span>
              {o.d && (
                <span className="block text-xs text-muted-foreground">
                  {o.d}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function SelectField({ field }: { field: Field }) {
  const value = useStore((st) => st.answers[field.id]) as string | undefined;
  const setField = useStore((st) => st.setField);
  const opts = field.options!.filter((o) => o.v !== "");
  const placeholderOpt = field.options!.find((o) => o.v === "");
  const placeholder = placeholderOpt ? placeholderOpt.l : "Select…";
  return (
    <Select
      value={value ? value : undefined}
      onValueChange={(v) => setField(field.id, v)}
    >
      <SelectTrigger className="max-w-xl">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {opts.map((o) => (
          <SelectItem key={o.v} value={o.v}>
            {o.l}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function TextArea({ field }: { field: Field }) {
  const value = useStore((st) => st.answers[field.id]) as string | undefined;
  const setField = useStore((st) => st.setField);
  return (
    <Textarea
      value={value ?? ""}
      placeholder={field.placeholder}
      onChange={(e) => setField(field.id, e.target.value)}
    />
  );
}

function TextLike({ field }: { field: Field }) {
  const value = useStore((st) => st.answers[field.id]) as string | undefined;
  const setField = useStore((st) => st.setField);
  const type =
    field.type === "number" ? "number" : field.type === "date" ? "date" : "text";
  return (
    <Input
      type={type}
      value={value ?? ""}
      placeholder={field.placeholder}
      onChange={(e) => setField(field.id, e.target.value)}
      className="max-w-xl"
    />
  );
}

export function FieldRenderer({ field }: { field: Field }) {
  return (
    <FieldShell field={field}>
      {field.type === "radio" ? (
        <RadioPills field={field} />
      ) : field.type === "checks" ? (
        <Checks field={field} />
      ) : field.type === "select" ? (
        <SelectField field={field} />
      ) : field.type === "textarea" ? (
        <TextArea field={field} />
      ) : (
        <TextLike field={field} />
      )}
    </FieldShell>
  );
}
