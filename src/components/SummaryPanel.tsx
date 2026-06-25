import { useState, type ChangeEvent } from "react";
import {
  Copy,
  DownloadSimple,
  Printer,
  UploadSimple,
  ArrowCounterClockwise,
  ArrowLeft,
} from "@phosphor-icons/react";
import { useStore } from "@/store";
import { computeScores, verdictTone, type VerdictTone } from "@/lib/scoring";
import { buildMarkdown } from "@/lib/markdown";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { VERDICT_ICON } from "./Verdict";
import { References } from "./References";
import { cn } from "@/lib/utils";
import type { Answers } from "@/types";

const BANNER: Record<VerdictTone, string> = {
  success: "border-success/30 bg-success/[0.06]",
  warning: "border-warning/30 bg-warning/[0.06]",
  destructive: "border-destructive/30 bg-destructive/[0.06]",
  block: "border-brand/30 bg-brand/[0.06]",
  muted: "border-border bg-secondary/40",
};
const WORD: Record<VerdictTone, string> = {
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
  block: "text-brand",
  muted: "text-foreground",
};

function download(name: string, text: string, type = "text/plain") {
  const blob = new Blob([text], { type: `${type};charset=utf-8` });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export function SummaryPanel() {
  const answers = useStore((st) => st.answers);
  const back = useStore((st) => st.back);
  const goto = useStore((st) => st.goto);
  const reset = useStore((st) => st.reset);
  const importAnswers = useStore((st) => st.importAnswers);
  const [copied, setCopied] = useState(false);

  const sc = computeScores(answers);
  const md = buildMarkdown(answers, sc);
  const tone = verdictTone(sc.verdict);
  const Icon = VERDICT_ICON[sc.verdict];
  const slug = String(answers.proj_title || "ml-intake").replace(/\s+/g, "-");

  const onImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const data = JSON.parse(String(r.result)) as Answers;
        importAnswers(data);
      } catch {
        window.alert("Invalid JSON file.");
      }
    };
    r.readAsText(file);
  };

  return (
    <div className="mx-auto max-w-4xl animate-fade-in space-y-6 pb-20">
      {/* verdict banner */}
      <div className={cn("rounded-2xl border p-6 sm:p-7", BANNER[tone])}>
        <div className="flex flex-wrap items-center gap-5">
          <Icon weight="fill" className={cn("h-12 w-12", WORD[tone])} />
          <div>
            <div className={cn("text-3xl font-black tracking-tight", WORD[tone])}>
              {sc.verdict}
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {String(answers.proj_title || "(untitled request)")}
              {answers.req_company ? ` · ${String(answers.req_company)}` : ""}
            </p>
          </div>
          <div className="ml-auto text-right">
            <div className="text-4xl font-black leading-none">
              {sc.readiness}%
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Readiness
            </div>
          </div>
        </div>
      </div>

      {/* decision drivers */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Decision drivers
          </h2>
          <ul className="mt-3 space-y-2.5">
            {sc.reasons.map((r, i) => (
              <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* readiness by dimension */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Readiness by dimension
          </h2>
          <div className="mt-4 space-y-3">
            {sc.parts.map((p) => {
              const pc = Math.round(p.val * 100);
              return (
                <div
                  key={p.label}
                  className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 sm:grid-cols-[210px_1fr_44px]"
                >
                  <span className="text-[13px] font-medium">{p.label}</span>
                  <div className="col-span-2 h-2 overflow-hidden rounded-full bg-secondary sm:col-span-1">
                    <div
                      className="h-full rounded-full bg-brand transition-all"
                      style={{ width: `${pc}%` }}
                    />
                  </div>
                  <span className="text-right text-[13px] font-bold text-muted-foreground">
                    {pc}%
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* exportable one-pager */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Exportable one-pager
          </h2>
          <div className="mt-4 flex flex-wrap gap-2 no-print">
            <Button
              onClick={() => {
                navigator.clipboard.writeText(md);
                setCopied(true);
                setTimeout(() => setCopied(false), 1400);
              }}
            >
              <Copy className="h-4 w-4" /> {copied ? "Copied!" : "Copy Markdown"}
            </Button>
            <Button variant="outline" onClick={() => download(`${slug}.md`, md)}>
              <DownloadSimple className="h-4 w-4" /> .md
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                download(
                  `${slug}.json`,
                  JSON.stringify(answers, null, 2),
                  "application/json",
                )
              }
            >
              <DownloadSimple className="h-4 w-4" /> .json
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Print / PDF
            </Button>
            <label
              className={cn(
                buttonVariants({ variant: "outline" }),
                "cursor-pointer",
              )}
            >
              <UploadSimple className="h-4 w-4" /> Import
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={onImport}
              />
            </label>
            <Button
              variant="outline"
              className="ml-auto text-destructive hover:text-destructive"
              onClick={() => {
                if (window.confirm("Clear all answers? This cannot be undone."))
                  reset();
              }}
            >
              <ArrowCounterClockwise className="h-4 w-4" /> Reset
            </Button>
          </div>
          <pre className="mt-4 max-h-[480px] overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-secondary/40 p-4 font-mono text-[12px] leading-relaxed">
            {md}
          </pre>
        </CardContent>
      </Card>

      {/* references */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            References &amp; frameworks this tool is built on
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Curated from a multi-source research pass. Links open in a new tab.
          </p>
          <Separator className="my-4" />
          <References />
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 no-print">
        <Button variant="outline" onClick={back}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div className="flex-1" />
        <Button variant="ghost" onClick={() => goto(0)}>
          Back to start
        </Button>
      </div>
    </div>
  );
}
