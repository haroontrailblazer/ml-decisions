import { SECTIONS } from "@/data/sections";
import type { Answers, ScoreResult } from "@/types";

function optLabel(secId: string, fid: string, val: string): string {
  const sec = SECTIONS.find((s) => s.id === secId);
  const f = sec?.fields.find((x) => x.id === fid);
  if (f?.options) {
    const o = f.options.find((opt) => opt.v === val);
    if (o) return o.l;
  }
  return val;
}

function valStr(s: Answers, secId: string, fid: string): string {
  const v = s[fid];
  if (v == null || v === "") return "—";
  if (Array.isArray(v))
    return v.length ? v.map((x) => optLabel(secId, fid, x)).join(", ") : "—";
  return optLabel(secId, fid, v);
}

const t = (s: Answers, id: string): string =>
  s[id] != null && String(s[id]).trim() !== "" ? String(s[id]) : "—";

export function buildMarkdown(s: Answers, sc: ScoreResult): string {
  const L: string[] = [];
  L.push(`# ML Project Intake — ${t(s, "proj_title") === "—" ? "(untitled)" : s.proj_title}`);
  L.push(
    `**Requester:** ${t(s, "req_name")}  ·  **Company:** ${t(s, "req_company")}  ·  **Date:** ${t(s, "req_date")}`,
  );
  L.push(
    `**Sponsor:** ${t(s, "sponsor")}  ·  **Deadline:** ${t(s, "deadline")}  ·  **Budget:** ${t(s, "budget")}`,
  );
  L.push("");
  L.push(`## Verdict: ${sc.verdict}  ·  Readiness ${sc.readiness}%`);
  sc.reasons.forEach((r) => L.push(`- ${r}`));
  L.push("");
  L.push(`**Problem (client's words):** ${t(s, "problem_stmt")}`);
  L.push("");
  L.push("## 1. Should we use ML? (Say-No gate)");
  L.push(
    `- 6-Word Test: Learn=${t(s, "t_learn")}, Complex=${t(s, "t_complex")}, Patterns=${t(s, "t_patterns")}, Data=${t(s, "t_existingdata")}, Predictions=${t(s, "t_predictions")}, Unseen=${t(s, "t_unseendata")}`,
  );
  L.push(
    `- Simpler rule possible: ${valStr(s, "saynogate", "simpler_alt")} — ${t(s, "simpler_alt_desc")}`,
  );
  L.push(`- High-volume / repeated decision: ${valStr(s, "saynogate", "repetitive_scale")}`);
  L.push("");
  L.push("## 2. Three Lenses");
  L.push(`- Value gain: ${valStr(s, "lenses", "value_gain")} (${t(s, "value_gain_desc")})`);
  L.push(`- Operational fit: ${valStr(s, "lenses", "op_fit")}`);
  L.push(`- Risk: ${valStr(s, "lenses", "risk_profile")} — worst case: ${t(s, "risk_desc")}`);
  L.push(`- Mitigation: ${t(s, "risk_mitigation")}`);
  L.push("");
  L.push("## 3. Metric Ladder");
  L.push(`- L1 Business: ${t(s, "m_business")}`);
  L.push(`- L2 Product: ${t(s, "m_product")}`);
  L.push(`- L3 Offline: ${valStr(s, "metrics", "m_offline")} — target: ${t(s, "m_offline_target")}`);
  L.push(`- L3 confirmed to drive L1: ${valStr(s, "metrics", "m_l3_drives_l1")}`);
  L.push(`- Error-cost asymmetry: ${valStr(s, "metrics", "error_cost")}`);
  L.push(`- Guardrails: ${t(s, "m_guardrails")}`);
  L.push("");
  L.push("## 4. Baseline & Rollback");
  L.push(`- Problem type: ${valStr(s, "baseline", "problem_type")}`);
  L.push(`- Baseline: ${t(s, "baseline_chosen")}`);
  L.push(
    `- Baseline already enough: ${valStr(s, "baseline", "baseline_value")}  ·  Rollback path: ${valStr(s, "baseline", "rollback_defined")}`,
  );
  L.push(`- Build vs buy: ${valStr(s, "baseline", "build_buy")}`);
  L.push("");
  L.push("## 5. Data");
  L.push(
    `- Data exists/accessible: ${valStr(s, "data", "data_exists")}  ·  Volume: ${valStr(s, "data", "data_volume")}  ·  Freshness: ${valStr(s, "data", "data_freshness")}`,
  );
  L.push(`- Features available at serving time: ${valStr(s, "data", "serving_time_features")}`);
  L.push(`- Governance: ${valStr(s, "data", "data_access")}`);
  L.push(
    `- Labels: ${valStr(s, "data", "labels_available")}  ·  Label is true outcome/proxy: ${valStr(s, "data", "proxy_label")}  ·  Label strategy: ${valStr(s, "data", "label_strategy")}`,
  );
  L.push(
    `- Class balance: ${valStr(s, "data", "class_balance")}  ·  Sampling: ${valStr(s, "data", "sampling_strategy")}`,
  );
  L.push(`- Bias concerns: ${t(s, "data_bias_concern")}`);
  L.push("");
  L.push("## 6. Features & Stability");
  L.push(
    `- Leakage review: ${valStr(s, "features", "leakage_review")}  ·  Ablation planned: ${valStr(s, "features", "ablation_planned")}`,
  );
  L.push(`- Suspect features: ${t(s, "leakage_suspects")}`);
  L.push(
    `- Transform parity: ${valStr(s, "features", "transform_parity")}  ·  Feature store: ${valStr(s, "features", "feature_store")}  ·  Binning pinned: ${valStr(s, "features", "binning_consistency")}`,
  );
  L.push(`- Validation scheme: ${valStr(s, "features", "temporal_validation")}`);
  L.push("");
  L.push("## 7. Feedback Loop");
  L.push(
    `- Feedback window: ${valStr(s, "feedback", "feedback_window")}  ·  Signals: ${valStr(s, "feedback", "feedback_type")}`,
  );
  L.push(
    `- Implicit negatives: ${valStr(s, "feedback", "implicit_negative")}  ·  Bias amplification: ${valStr(s, "feedback", "bias_amplification")}`,
  );
  L.push("");
  L.push("## 8. Operational Health");
  L.push(`- Latency: ${valStr(s, "ops", "latency_budget")}  ·  Throughput/peak: ${t(s, "throughput_peak")}`);
  L.push(`- EU AI Act risk tier: ${valStr(s, "ops", "eu_risk_tier")}`);
  L.push(
    `- Compliance: ${valStr(s, "ops", "compliance")}  ·  Interpretability: ${valStr(s, "ops", "interpretability")}  ·  Cost ceiling: ${t(s, "cost_ceiling")}`,
  );
  L.push(`- Monitoring: ${valStr(s, "ops", "monitoring_plan")}`);
  L.push("");
  L.push("## 9. Definition of Done");
  L.push(`- Core: ${valStr(s, "dod", "dod_core")}`);
  L.push(`- Extra: ${valStr(s, "dod", "dod_extra")}`);
  L.push(`- Production owner: ${t(s, "dod_owner")}`);
  L.push("");
  L.push("---");
  L.push(
    "_Core philosophy: say no to ML when the world says yes; say yes when the data and constraints say yes. Focus on the system, not just the algorithm._",
  );
  return L.join("\n");
}
