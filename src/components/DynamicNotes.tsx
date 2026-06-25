import type { ReactNode } from "react";
import { useStore } from "@/store";
import { computeScores } from "@/lib/scoring";
import { BASELINE_SUGGEST } from "@/data/sections";
import { Callout } from "./Callout";
import { Button } from "@/components/ui/button";

export function DynamicNotes({ sectionId }: { sectionId: string }) {
  const s = useStore((st) => st.answers);
  const setField = useStore((st) => st.setField);
  const notes: ReactNode[] = [];

  if (sectionId === "saynogate") {
    const sc = computeScores(s);
    if (sc.no > 0)
      notes.push(
        <Callout key="say" tone="danger" title="Say no.">
          This fails the 6-Word Test on {sc.no} point(s). Recommend a
          rules/heuristics solution and revisit ML only if that ceiling is
          proven too low.
        </Callout>,
      );
    else if (s.simpler_alt === "yes")
      notes.push(
        <Callout key="rule" tone="danger" title="Say no.">
          A simpler rule already works — ship that. (Google Rule of ML #1.)
        </Callout>,
      );
    else if (sc.answered < 6)
      notes.push(
        <Callout key="go" tone="info" title="Keep going.">
          Answer all six to clear the gate.
        </Callout>,
      );
    else if (sc.unsure > 0)
      notes.push(
        <Callout key="unsure" tone="warn" title="Resolve the unknowns.">
          All six answered but some are "unsure" — turn those into yes/no before
          committing.
        </Callout>,
      );
    else
      notes.push(
        <Callout key="ok" tone="ok" title="Gate cleared.">
          Genuine ML candidate. Continue — but you will still start with a
          baseline.
        </Callout>,
      );
    if (s.repetitive_scale === "no")
      notes.push(
        <Callout key="vol" tone="warn" title="Low volume.">
          This is a rare/one-off decision. ML's fixed costs (pipeline,
          monitoring, retraining) may never amortize — consider a human or a
          one-time analysis.
        </Callout>,
      );
  }

  if (sectionId === "lenses" && s.risk_profile === "critical" && !s.risk_mitigation)
    notes.push(
      <Callout key="crit" tone="danger" title="Mitigation required.">
        Critical-risk projects are BLOCKED until you document human-in-loop,
        thresholds, appeals and fairness review.
      </Callout>,
    );

  if (sectionId === "metrics") {
    if (
      s.m_offline === "accuracy" &&
      (s.class_balance === "severe" || s.class_balance === "extreme")
    )
      notes.push(
        <Callout key="acc" tone="warn" title="Accuracy Trap.">
          Your data is severely imbalanced — accuracy will look great and mean
          nothing. Use Precision/Recall (and PR-AUC).
        </Callout>,
      );
  }

  if (sectionId === "baseline") {
    const pt = s.problem_type as string | undefined;
    if (pt && BASELINE_SUGGEST[pt])
      notes.push(
        <Callout key="bl" tone="info" title="Suggested baseline:">
          {BASELINE_SUGGEST[pt]}{" "}
          <Button
            size="sm"
            variant="outline"
            className="ml-1 mt-1.5 h-7"
            onClick={() => setField("baseline_chosen", BASELINE_SUGGEST[pt])}
          >
            Use this
          </Button>
        </Callout>,
      );
    if (s.build_buy === "scratch")
      notes.push(
        <Callout key="scratch" tone="warn" title="Why from scratch?">
          Training from scratch only pays off with a real data/accuracy moat or
          a data-sovereignty constraint. Otherwise an API or a fine-tune is
          faster, cheaper and usually just as accurate.
        </Callout>,
      );
  }

  if (sectionId === "data") {
    if (s.serving_time_features === "no")
      notes.push(
        <Callout key="serve" tone="danger" title="Serving-time gap.">
          A feature that only exists after the event is unusable at inference
          and usually signals target leakage. Confirm every feature is
          computable at prediction time.
        </Callout>,
      );
    if (s.proxy_label === "proxy")
      notes.push(
        <Callout key="proxy" tone="warn" title="Proxy label.">
          "Clicked" ≠ "satisfied". A proxy caps your ceiling — name the gap and
          validate it against the true outcome on a sample.
        </Callout>,
      );
  }

  if (sectionId === "features") {
    if (s.transform_parity === "different")
      notes.push(
        <Callout key="skew" tone="danger" title="Skew risk.">
          Different transform code in train vs serve is the #1 cause of silent
          production failure. Unify it (shared lib or feature store).
        </Callout>,
      );
    if (s.temporal_validation === "random")
      notes.push(
        <Callout key="ttl" tone="danger" title="Time-travel leakage.">
          A random k-fold split on time-dependent data leaks the future into
          training. Switch to out-of-time / point-in-time validation before
          trusting any metric.
        </Callout>,
      );
  }

  if (sectionId === "ops") {
    if (s.eu_risk_tier === "unacceptable")
      notes.push(
        <Callout key="prohib" tone="danger" title="Prohibited use.">
          This falls in the EU AI Act prohibited tier and cannot ship as
          designed. Re-scope or stop.
        </Callout>,
      );
    if (s.eu_risk_tier === "high")
      notes.push(
        <Callout key="annex" tone="warn" title="High-risk (Annex III).">
          Plan now for conformity assessment, event logging, human oversight,
          technical documentation and post-market monitoring — these are legal
          obligations, not nice-to-haves.
        </Callout>,
      );
    if (
      (s.risk_profile === "high" || s.risk_profile === "critical") &&
      s.interpretability === "blackbox"
    )
      notes.push(
        <Callout key="explain" tone="warn" title="Explainability gap.">
          High-risk decisions usually need an explanation you can give a
          regulator or customer. Reconsider black-box models.
        </Callout>,
      );
  }

  if (!notes.length) return null;
  return <div className="mt-5 space-y-3">{notes}</div>;
}
