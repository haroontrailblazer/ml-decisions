import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useStore } from "@/store";
import { SECTIONS } from "@/data/sections";
import { SectionGlyph } from "@/data/icons";
import type { Section } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FieldRenderer } from "./fields/FieldRenderer";
import { DynamicNotes } from "./DynamicNotes";

function SectionHeader({
  sec,
  index,
  total,
}: {
  sec: Section;
  index: number;
  total: number;
}) {
  return (
    <div className="surface relative overflow-hidden rounded-2xl p-6">
      {/* soft accent glow, echoing the reference's orb halo */}
      <div className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-brand/25 blur-[80px]" />
      <div className="relative flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-border bg-secondary text-brand">
          <SectionGlyph
            name={sec.icon}
            weight="duotone"
            className="h-7 w-7 text-brand"
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand">
              Step {String(index + 1).padStart(2, "0")} / {total}
            </span>
            {sec.gate && <Badge variant="warning">Say-No Gate</Badge>}
          </div>
          <h1 className="font-display text-[clamp(1.6rem,3vw,2rem)] font-medium leading-tight">
            {sec.title}
          </h1>
        </div>
      </div>
      <p className="relative mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
        {sec.sub}
      </p>
    </div>
  );
}

export function SectionPanel({ section }: { section: Section }) {
  const current = useStore((st) => st.current);
  const next = useStore((st) => st.next);
  const back = useStore((st) => st.back);
  const goto = useStore((st) => st.goto);
  const total = SECTIONS.length;

  return (
    <div className="mx-auto max-w-3xl animate-fade-in pb-20">
      <SectionHeader
        key={section.id}
        sec={section}
        index={current}
        total={total}
      />
      <Card className="mt-5">
        <CardContent className="grid grid-cols-1 gap-x-6 gap-y-7 p-6 sm:grid-cols-2">
          {section.fields.map((f) => (
            <div
              key={f.id}
              className={cn(f.half ? "sm:col-span-1" : "sm:col-span-2")}
            >
              <FieldRenderer field={f} />
            </div>
          ))}
        </CardContent>
      </Card>

      <DynamicNotes sectionId={section.id} />

      <div className="mt-8 flex items-center gap-3">
        <Button variant="outline" onClick={back} disabled={current === 0}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div className="flex-1" />
        <Button
          variant="ghost"
          onClick={() => goto(total - 1)}
          className="hidden sm:inline-flex"
        >
          Jump to verdict
        </Button>
        <Button onClick={next}>
          {current === total - 2 ? "See verdict" : "Next"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
