import type { Answers, ScorePart, ScoreResult, Verdict } from "@/types";

const VALUE_PTS: Record<string, number> = {
  transformational: 1,
  significant: 0.85,
  moderate: 0.55,
  marginal: 0.25,
  none: 0,
};
const OPFIT_KEYS = [
  "team_skills",
  "data_pipeline",
  "mlops_stack",
  "compute",
  "monitoring_staff",
  "budget_ongoing",
];

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const arr = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : []);
const filledV = (v: unknown) => v != null && String(v).trim() !== "";

export function computeScores(s: Answers): ScoreResult {
  const has = (id: string, k: string) => arr(s[id]).includes(k);
  const filled = (id: string) => filledV(s[id]);
  const frac = (id: string, n: number) => clamp01(arr(s[id]).length / n);
  const ptsOf = (map: Record<string, number>, id: string) =>
    map[String(s[id] ?? "")] ?? 0;

  const reasons: string[] = [];
  let gateFail = false;
  let gateWarn = false;

  // --- 6-word test ---
  const T = [
    "t_learn",
    "t_complex",
    "t_patterns",
    "t_existingdata",
    "t_predictions",
    "t_unseendata",
  ];
  let yes = 0,
    no = 0,
    unsure = 0,
    answered = 0;
  T.forEach((k) => {
    const v = s[k];
    if (v) {
      answered++;
      if (v === "yes") yes++;
      else if (v === "no") no++;
      else unsure++;
    }
  });
  if (no > 0) {
    gateFail = true;
    reasons.push(
      `Fails the 6-Word Test on ${no} criterion${no > 1 ? "a" : ""} — ML is likely the wrong tool here.`,
    );
  }
  if (unsure > 0 && no === 0) {
    gateWarn = true;
    reasons.push(
      `${unsure} of the 6-Word criteria are still "unsure" — resolve before committing.`,
    );
  }

  // --- simpler alternative ---
  if (s.simpler_alt === "yes") {
    gateFail = true;
    reasons.push(
      "A simpler rule/SQL/heuristic can already solve this — start there, say no to ML.",
    );
  } else if (s.simpler_alt === "partial") {
    gateWarn = true;
    reasons.push(
      "A rule covers part of this — ship the rule first, scope ML to the gap.",
    );
  }

  // --- critical risk unmitigated ---
  const critUnmit = s.risk_profile === "critical" && !filled("risk_mitigation");
  if (critUnmit)
    reasons.push(
      "Critical risk profile with no mitigation documented — block until human-in-loop / fairness / appeals are defined.",
    );
  if (
    (s.risk_profile === "high" || s.risk_profile === "critical") &&
    s.interpretability === "blackbox"
  )
    reasons.push(
      'High/critical risk but black-box interpretability — likely incompatible with a "right to explanation".',
    );

  // --- metric ladder ---
  if (s.m_l3_drives_l1 === "no")
    reasons.push(
      "Offline metric is NOT confirmed to drive the business outcome — risk of a technical success / business failure.",
    );
  if (
    s.m_offline === "accuracy" &&
    (s.class_balance === "severe" || s.class_balance === "extreme")
  )
    reasons.push(
      "Accuracy chosen on a severely imbalanced problem — the Accuracy Trap. Switch to Precision/Recall.",
    );

  // --- leakage / skew ---
  if (s.transform_parity === "different")
    reasons.push(
      "Training & serving use different transform paths — training-serving skew risk.",
    );
  if (s.leakage_review === "not") gateWarn = true;
  if (s.serving_time_features === "no")
    reasons.push(
      "A required feature is NOT available at serving time — the model would be unusable in production (likely target leakage).",
    );
  if (s.temporal_validation === "random")
    reasons.push(
      'Random split planned on time-dependent data — "sees the future" leakage. Use out-of-time / point-in-time validation.',
    );
  if (s.proxy_label === "proxy")
    reasons.push(
      "Label is a proxy, not the true outcome — validate the proxy against reality or the project ceiling is capped.",
    );

  // --- regulatory gate (EU AI Act) ---
  if (s.eu_risk_tier === "unacceptable") {
    gateFail = true;
    reasons.push(
      "Use falls in the EU AI Act PROHIBITED tier — this cannot ship as designed.",
    );
  }
  if (s.eu_risk_tier === "high")
    reasons.push(
      "EU AI Act HIGH-RISK (Annex III) use — requires conformity assessment, logging, human oversight and documentation. Budget for it now.",
    );

  // --- repetitiveness / scale ---
  if (s.repetitive_scale === "no") {
    gateWarn = true;
    reasons.push(
      "Decision is rare/low-volume — ML's fixed costs may not amortize; a human or one-off analysis may be cheaper.",
    );
  }

  // --- readiness components ---
  const parts: ScorePart[] = [];
  const add = (label: string, val: number, weight: number) =>
    parts.push({ label, val: clamp01(val), weight });

  add(
    "Use-case fit (6-Word Test)",
    answered ? (yes + unsure * 0.4) / 6 : 0,
    3,
  );
  add("Value gain", ptsOf(VALUE_PTS, "value_gain"), 2);
  add("Operational fit", frac("op_fit", OPFIT_KEYS.length), 2);

  let riskScore = 1;
  if (s.risk_profile === "high")
    riskScore = filled("risk_mitigation") ? 0.85 : 0.4;
  if (s.risk_profile === "critical")
    riskScore = filled("risk_mitigation") ? 0.7 : 0.1;
  if (!s.risk_profile) riskScore = 0.5;
  add("Risk handled", riskScore, 1.5);

  let met = 0;
  if (filled("m_business")) met += 0.3;
  if (filled("m_product")) met += 0.2;
  if (filled("m_offline") && s.m_offline) met += 0.2;
  if (s.m_l3_drives_l1 === "yes") met += 0.3;
  if (s.m_l3_drives_l1 === "no") met -= 0.1;
  add("Metrics defined & aligned", met, 1.5);

  let bl = 0;
  if (filled("baseline_chosen")) bl += 0.5;
  if (s.rollback_defined === "yes") bl += 0.5;
  else if (s.rollback_defined === "planned") bl += 0.25;
  add("Baseline & rollback", bl, 1.5);

  let dt = 0;
  if (s.data_exists === "yes") dt += 0.4;
  else if (s.data_exists === "partial") dt += 0.2;
  if (s.labels_available === "yes") dt += 0.25;
  else if (s.labels_available === "partial") dt += 0.12;
  else if (arr(s.label_strategy).length) dt += 0.12;
  if (s.class_balance && s.class_balance !== "") dt += 0.12;
  if (arr(s.sampling_strategy).length) dt += 0.08;
  if (has("data_access", "have_access")) dt += 0.08;
  if (s.serving_time_features === "yes") dt += 0.12;
  else if (s.serving_time_features === "no") dt -= 0.15;
  if (s.proxy_label === "true") dt += 0.05;
  add("Data readiness", dt, 2);

  let ft = 0;
  if (s.leakage_review === "done") ft += 0.3;
  else if (s.leakage_review === "planned") ft += 0.15;
  if (s.transform_parity === "same") ft += 0.35;
  else if (s.transform_parity === "unsure") ft += 0.1;
  if (s.feature_store === "yes") ft += 0.2;
  else if (s.feature_store === "planned") ft += 0.1;
  if (s.binning_consistency === "yes") ft += 0.1;
  if (s.temporal_validation === "oot" || s.temporal_validation === "na")
    ft += 0.1;
  else if (s.temporal_validation === "random") ft -= 0.1;
  add("Feature stability", ft, 1.5);

  let fb = 0;
  if (s.feedback_window && s.feedback_window !== "") fb += 0.45;
  if (arr(s.feedback_type).length) fb += 0.25;
  if (s.implicit_negative === "handled") fb += 0.15;
  if (s.bias_amplification === "mitigated" || s.bias_amplification === "na")
    fb += 0.15;
  add("Feedback loop", fb, 1);

  let op = 0;
  if (s.latency_budget) op += 0.2;
  if (filled("throughput_peak")) op += 0.1;
  if (s.interpretability) op += 0.15;
  const mon = frac("monitoring_plan", 6);
  op += mon * 0.55;
  add("Operational health", op, 1.5);

  add("Definition of Done", frac("dod_core", 4), 1);

  const wsum = parts.reduce((a, p) => a + p.weight, 0);
  const readiness = Math.round(
    (100 * parts.reduce((a, p) => a + p.val * p.weight, 0)) / wsum,
  );

  let verdict: Verdict;
  if (gateFail) verdict = "NO-GO";
  else if (critUnmit) verdict = "BLOCKED";
  else if (readiness >= 75 && !gateWarn) verdict = "GO";
  else if (readiness >= 50) verdict = "CAUTION";
  else verdict = "NOT READY";

  if (verdict === "GO" && reasons.length === 0)
    reasons.push(
      "Passes the say-no gate and scores well across data, metrics, stability and operations. Proceed — start with the baseline.",
    );
  if (verdict === "CAUTION" && !reasons.length)
    reasons.push(
      "No hard blockers, but readiness is moderate — close the lowest bars below before committing budget.",
    );
  if (verdict === "NOT READY" && !reasons.length)
    reasons.push(
      "Too many unknowns to commit. Gather data/metric/operational answers and re-score.",
    );

  return { readiness, verdict, reasons, parts, yes, no, unsure, answered };
}

export type VerdictTone =
  | "success"
  | "warning"
  | "destructive"
  | "block"
  | "muted";

export function verdictTone(v: Verdict): VerdictTone {
  switch (v) {
    case "GO":
      return "success";
    case "CAUTION":
      return "warning";
    case "NO-GO":
      return "destructive";
    case "BLOCKED":
      return "block";
    default:
      return "muted";
  }
}
