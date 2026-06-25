import type { FieldOption, Section } from "@/types";

const YNU: FieldOption[] = [
  { v: "yes", l: "Yes", k: "good" },
  { v: "no", l: "No", k: "bad" },
  { v: "unsure", l: "Unsure", k: "warn" },
];

export const SECTIONS: Section[] = [
  /* ---------------- 0. BRIEF ---------------- */
  {
    id: "brief",
    icon: "clipboard",
    title: "Project Brief",
    sub: "Capture the who/what before judging the how. Fill this with the client at the top of the call.",
    fields: [
      { id: "proj_title", type: "text", label: "Working title for the request", placeholder: 'e.g. "Predict loan default at application"' },
      {
        id: "problem_stmt", type: "textarea",
        label: "In one or two sentences: what do they want, in their words?",
        help: "Resist jargon. Capture the business pain, not the proposed solution.",
        placeholder: '"We approve loans manually and we are losing money on defaults we should have caught."',
      },
      { id: "req_name", type: "text", label: "Requester / point of contact", placeholder: "e.g. Priya Sharma, Head of Risk", half: true },
      { id: "req_company", type: "text", label: "Company / team", placeholder: "e.g. Acme FinServ", half: true },
      { id: "req_date", type: "date", label: "Intake date", half: true },
      { id: "deadline", type: "text", label: "Hard deadline or driving event", placeholder: "e.g. Q4 board review, regulatory date", half: true },
      { id: "sponsor", type: "text", label: "Business sponsor / budget owner", help: "No sponsor = no project.", half: true },
      { id: "budget", type: "text", label: "Budget / appetite (people, compute, $)", placeholder: "e.g. 1 ML eng for 8 weeks", half: true },
    ],
  },

  /* ---------------- 1. SAY-NO GATE ---------------- */
  {
    id: "saynogate",
    icon: "traffic",
    title: "Should we use ML at all?",
    gate: true,
    sub: 'The "Say No" gate. Most ML projects fail before the first line of code. If a SQL query or if-else rule works, say no. Run the 6-Word Test — failing even one criterion is a strong signal ML is the wrong tool.',
    fields: [
      { id: "t_learn", type: "radio", options: YNU, label: "1. LEARN — does the system need to improve from examples over time?", why: "If the logic is fixed and known, you want rules or a lookup table, not a model that needs retraining." },
      { id: "t_complex", type: "radio", options: YNU, label: "2. COMPLEX — are the relationships too messy for hand-written if-else rules?", why: "If a domain expert can write the rules in an afternoon, those rules will be cheaper, faster and explainable." },
      { id: "t_patterns", type: "radio", options: YNU, label: "3. PATTERNS — is there a real, learnable structure in the data?", why: "Predicting a fair lottery is impossible — there is no pattern. ML learns patterns; it cannot invent them." },
      { id: "t_existingdata", type: "radio", options: YNU, label: "4. EXISTING DATA — do we have data that connects inputs to the outcome we want to predict?", why: "No labelled input→output history means no supervised learning. This is the most common silent killer." },
      { id: "t_predictions", type: "radio", options: YNU, label: "5. PREDICTIONS — do we need an estimate BEFORE we act?", why: "In cancer screening you must estimate risk before the biopsy. If the answer is already known when you act, you do not need a predictor." },
      { id: "t_unseendata", type: "radio", options: YNU, label: "6. UNSEEN DATA — will the live environment share the same “world” as the training data?", why: "If production data comes from a different distribution than training, the model is guessing. (See drift, later.)" },
      {
        id: "simpler_alt", type: "radio",
        label: "Can a SQL query, lookup, or simple if-else rule solve this acceptably TODAY?",
        options: [
          { v: "yes", l: "Yes — a rule works", k: "bad" },
          { v: "partial", l: "Partly", k: "warn" },
          { v: "no", l: "No, genuinely needs ML", k: "good" },
        ],
        why: "Google's Rule of ML #1: don't be afraid to launch a product without ML. Ship the heuristic first; reach for ML only when the rule's ceiling is real and costly.",
      },
      { id: "simpler_alt_desc", type: "textarea", label: "If a rule could work — what is it, and why is it not enough?", placeholder: '"Flag any application with debt-to-income > 45%. Works, but misses ~30% of defaults and over-rejects good customers."' },
      { id: "repetitive_scale", type: "radio", options: YNU, label: "Is this a high-volume, REPEATED decision (so ML's fixed costs amortize)?", why: "ML carries heavy fixed costs — pipelines, monitoring, retraining. A rare or one-off decision is better served by a human or a one-time analysis. (Huyen: ML fits repetitive tasks at scale.)" },
    ],
  },

  /* ---------------- 2. THREE LENSES ---------------- */
  {
    id: "lenses",
    icon: "lens",
    title: "Three Lenses — is it worth it?",
    sub: "Value Gain, Operational Fit, Risk Profile. A model can be technically great and still be a bad project.",
    fields: [
      {
        id: "value_gain", type: "select",
        label: "VALUE GAIN — how much extra money/safety does ML add over the simple baseline?",
        options: [
          { v: "transformational", l: "Transformational — core to revenue/safety" },
          { v: "significant", l: "Significant — clear, measurable lift" },
          { v: "moderate", l: "Moderate — nice improvement" },
          { v: "marginal", l: "Marginal — small or uncertain" },
          { v: "none", l: "Negligible / unknown" },
        ],
        why: "A 1% click-through lift is millions for Google and pennies for a small site. Tie the lift to dollars before committing.",
      },
      { id: "value_gain_desc", type: "text", label: "Quantify it if you can", placeholder: 'e.g. "$2M/yr in avoided defaults at 5% recall improvement"' },
      {
        id: "op_fit", type: "checks",
        label: "OPERATIONAL FIT — what does the team already have to run this in production?",
        why: "A hospital may want deep learning on X-rays, but with no MLOps stack, GPU, or staff to watch drift, the project is dead on arrival.",
        options: [
          { v: "team_skills", l: "ML/data skills", d: "People who can build & debug models" },
          { v: "data_pipeline", l: "Data pipeline", d: "Reliable, repeatable data access" },
          { v: "mlops_stack", l: "MLOps/deploy stack", d: "CI/CD, model registry, serving" },
          { v: "compute", l: "Compute (GPU/scale)", d: "Training & serving capacity" },
          { v: "monitoring_staff", l: "Monitoring & on-call", d: "Someone watches drift/skew" },
          { v: "budget_ongoing", l: "Ongoing budget", d: "Funds maintenance, not just build" },
        ],
      },
      {
        id: "risk_profile", type: "select",
        label: "RISK PROFILE — what happens if the model is wrong?",
        options: [
          { v: "low", l: "Low — wrong song / minor annoyance" },
          { v: "medium", l: "Medium — wasted spend, recoverable" },
          { v: "high", l: "High — unfair denial, money loss, reputational" },
          { v: "critical", l: "Critical — safety, legal, or regulatory harm" },
        ],
        why: "Recommending the wrong song is low risk. An unfair loan denial or a missed tumour is a regulatory and human disaster — and demands interpretability, fairness review, and a human in the loop.",
      },
      { id: "risk_desc", type: "textarea", label: "Describe the worst realistic failure and who it hurts" },
      { id: "risk_mitigation", type: "textarea", label: "Mitigation: human-in-loop, confidence thresholds, appeals, fairness checks…", help: "Critical-risk projects must document mitigation here or the verdict will block." },
    ],
  },

  /* ---------------- 3. METRIC LADDER ---------------- */
  {
    id: "metrics",
    icon: "ladder",
    title: "The Metric Ladder",
    sub: "Never optimise in a vacuum. Connect the math to the boardroom: Business outcome → Product metric → Offline metric. If the offline metric does not move the business metric, it is a technical success and a business failure.",
    fields: [
      { id: "m_business", type: "text", label: "Level 1 — Business outcome", placeholder: "e.g. Reduce annual default losses; retention; revenue; safety" },
      { id: "m_product", type: "text", label: "Level 2 — Product / behaviour metric", placeholder: "e.g. Approval-to-default ratio; click-through; conversion" },
      {
        id: "m_offline", type: "select", label: "Level 3 — Offline / ML metric",
        options: [
          { v: "", l: "— select —" },
          { v: "precision_recall", l: "Precision / Recall / F1" },
          { v: "auc", l: "AUC-ROC / PR-AUC" },
          { v: "accuracy", l: "Accuracy" },
          { v: "rmse_mae", l: "RMSE / MAE (regression)" },
          { v: "ranking", l: "MAP / NDCG / Recall@k (ranking)" },
          { v: "business_custom", l: "Custom business metric" },
          { v: "llm_eval", l: "LLM eval (faithfulness, win-rate, rubric)" },
        ],
        why: 'Beware the Accuracy Trap: if 99.5% of transactions are legitimate, "always legit" scores 99.5% accuracy and 0% recall. For imbalanced problems use Precision/Recall, never accuracy.',
      },
      { id: "m_offline_target", type: "text", label: "Target & current baseline for that metric", placeholder: "e.g. recall ≥ 0.80 at precision ≥ 0.30; today the rule gives 0.55/0.20" },
      { id: "m_l3_drives_l1", type: "radio", options: YNU, label: "Have we confirmed the offline metric actually drives the business outcome?", why: "This is the single most-skipped check. A model that maximises AUC can still tank revenue if the threshold or the metric is wrong for the business." },
      {
        id: "error_cost", type: "select", label: "Error-cost asymmetry — which mistake hurts more?",
        options: [
          { v: "", l: "— select —" },
          { v: "fn", l: "False negatives (missing a positive) hurt most" },
          { v: "fp", l: "False positives (false alarms) hurt most" },
          { v: "symmetric", l: "Roughly symmetric" },
          { v: "unsure", l: "Unsure" },
        ],
        why: "The relative cost of a false positive vs a false negative silently dictates your metric, threshold and class weighting — not headline accuracy. A missed tumour ≠ a false alarm; a fraud miss ≠ a blocked good customer.",
      },
      { id: "m_guardrails", type: "textarea", label: "Guardrail metrics (things that must NOT get worse)", placeholder: "e.g. approval rate for protected groups, latency, complaint volume" },
    ],
  },

  /* ---------------- 4. BASELINE ---------------- */
  {
    id: "baseline",
    icon: "stack",
    title: "Baseline & Rollback",
    sub: 'Start with a baseline to eliminate the "will it work?" risk. Prove a simple system adds value and stakeholders fund the complex one. The baseline is also your safety net.',
    fields: [
      {
        id: "problem_type", type: "select", label: "Problem type (drives the recommended baseline)",
        options: [
          { v: "", l: "— select —" },
          { v: "tabular_class", l: "Tabular classification / risk" },
          { v: "tabular_reg", l: "Tabular regression / forecasting" },
          { v: "text_screen", l: "Text screening / classification" },
          { v: "recommendation", l: "Recommendation / ranking" },
          { v: "cv", l: "Computer vision" },
          { v: "genai", l: "Generative AI / LLM task" },
          { v: "clustering", l: "Clustering / segmentation" },
        ],
      },
      { id: "baseline_chosen", type: "text", label: "Agreed baseline (auto-suggested — edit freely)", help: 'The "math to beat". Cheap, interpretable, shippable this week.' },
      { id: "baseline_value", type: "radio", options: YNU, label: "Does that baseline already deliver acceptable value on its own?", why: "If yes — you may not need the ML model at all. That is a win, not a loss." },
      {
        id: "rollback_defined", type: "radio",
        options: [
          { v: "yes", l: "Yes — documented & tested", k: "good" },
          { v: "no", l: "No", k: "bad" },
          { v: "planned", l: "Planned", k: "warn" },
        ],
        label: "Is there a documented, tested rollback path to the baseline?",
        why: "If the deep model misbehaves in production you must be able to fall back to the baseline to keep the business running while you debug.",
      },
      {
        id: "build_buy", type: "select", label: "Build vs. buy — how will we get the model?",
        options: [
          { v: "", l: "— select —" },
          { v: "api", l: "API / foundation model first (no training)" },
          { v: "finetune", l: "Fine-tune a foundation model (LoRA before full)" },
          { v: "scratch", l: "Train a custom model from scratch" },
          { v: "undecided", l: "Undecided" },
        ],
        why: "Default ladder: API → fine-tune → train-from-scratch. Every competitor on the same commercial API has the same accuracy, so APIs rarely create a moat — but building from scratch only pays off with a genuine data/accuracy moat or a data-sovereignty constraint.",
      },
    ],
  },

  /* ---------------- 5. DATA ---------------- */
  {
    id: "data",
    icon: "database",
    title: "Data Architecture — the living fuel",
    sub: "In production, data is a living system, not a static CSV. It grows, drifts and carries bias.",
    fields: [
      {
        id: "data_exists", type: "radio", label: "Does the data that connects inputs to the outcome exist and is it accessible?",
        options: [
          { v: "yes", l: "Yes", k: "good" },
          { v: "partial", l: "Partial", k: "warn" },
          { v: "no", l: "No", k: "bad" },
        ],
        why: '"We have lots of data" ≠ "we have labelled data linking inputs to the thing we predict." Verify the join exists.',
      },
      {
        id: "data_volume", type: "select", label: "Roughly how many usable labelled examples?",
        options: [
          { v: "", l: "— select —" },
          { v: "<1k", l: "< 1,000" },
          { v: "1k-10k", l: "1k – 10k" },
          { v: "10k-100k", l: "10k – 100k" },
          { v: "100k-1M", l: "100k – 1M" },
          { v: ">1M", l: "> 1M" },
        ],
      },
      {
        id: "data_freshness", type: "select", label: "How fresh / how often does the data update?",
        options: [
          { v: "", l: "— select —" },
          { v: "realtime", l: "Real-time / streaming" },
          { v: "daily", l: "Daily" },
          { v: "weekly", l: "Weekly / monthly" },
          { v: "static", l: "Static / one-off dump" },
        ],
      },
      {
        id: "serving_time_features", type: "radio", label: "Will EVERY feature be available at prediction (serving) time — not just in the warehouse afterwards?",
        options: [
          { v: "yes", l: "Yes — all available live", k: "good" },
          { v: "partial", l: "Some are not", k: "warn" },
          { v: "no", l: "No / unsure", k: "bad" },
        ],
        why: "A strong feature that only exists AFTER the event you predict is unusable in production — and usually a sign of target leakage. (Google feasibility: features must be available at serving time.)",
      },
      {
        id: "data_access", type: "checks", label: "Data governance & access",
        options: [
          { v: "have_access", l: "We have legal access", d: "Cleared to use it for this purpose" },
          { v: "pii_present", l: "Contains PII / sensitive data", d: "Needs handling & minimisation" },
          { v: "consent_ok", l: "Consent / purpose covers ML", d: "Users agreed to this use" },
          { v: "residency", l: "Data-residency constraint", d: "e.g. EU-only, China-only storage" },
        ],
      },
      {
        id: "labels_available", type: "radio", label: "Do we have ground-truth labels?",
        options: [
          { v: "yes", l: "Yes", k: "good" },
          { v: "partial", l: "Some", k: "warn" },
          { v: "no", l: "No", k: "bad" },
        ],
      },
      {
        id: "proxy_label", type: "radio", label: "Is the label the TRUE outcome, or a convenient proxy?",
        options: [
          { v: "true", l: "True outcome", k: "good" },
          { v: "proxy", l: "A proxy", k: "warn" },
          { v: "unsure", l: "Unsure", k: "warn" },
        ],
        why: 'A proxy label silently caps the ceiling: "clicked" ≠ "satisfied", "contacted support" ≠ "churned". If you must use a proxy, name the gap explicitly and validate it against the real outcome on a sample.',
      },
      {
        id: "label_strategy", type: "checks", label: "If labels are scarce — strategy to acquire them",
        why: "Industrial shortcuts when you cannot afford 10,000 human labels.",
        options: [
          { v: "manual", l: "Manual labelling", d: "Humans annotate" },
          { v: "weak", l: "Weak supervision", d: 'Noisy rules/heuristics (e.g. "pneumonia" ⇒ emergent)' },
          { v: "semi", l: "Semi-supervised", d: "Small labelled set + pseudo-label high-confidence data" },
          { v: "transfer", l: "Transfer learning", d: "Foundation model, fine-tune on domain labels" },
          { v: "active", l: "Active learning", d: "Model picks the samples it is most confused about" },
          { v: "synthetic", l: "Synthetic / programmatic", d: "Generate or rule-label data" },
        ],
      },
      {
        id: "class_balance", type: "select", label: "Class balance (for classification)",
        options: [
          { v: "", l: "— select —" },
          { v: "balanced", l: "Balanced (~50/50)" },
          { v: "mild", l: "Mild imbalance (e.g. 80/20)" },
          { v: "severe", l: "Severe (e.g. 99/1 — fraud-like)" },
          { v: "extreme", l: "Extreme (e.g. 99.9/0.1)" },
          { v: "na", l: "N/A (regression/other)" },
        ],
        why: "The rarer the positive class, the more the Accuracy Trap bites and the more you need weighted/over-sampling and Precision/Recall.",
      },
      {
        id: "sampling_strategy", type: "checks", label: "Planned sampling strategy",
        options: [
          { v: "random", l: "Random", d: "Default; fine when balanced & i.i.d." },
          { v: "stratified", l: "Stratified", d: "Keep groups (e.g. India vs US) proportionate" },
          { v: "weighted", l: "Weighted / over-sample", d: "Boost rare class (fraud)" },
          { v: "reservoir", l: "Reservoir", d: "Streaming data, memory-bounded sample" },
        ],
      },
      { id: "data_bias_concern", type: "textarea", label: "Known bias / representativeness concerns", placeholder: "e.g. historical approvals encode past discrimination; one region over-represented" },
    ],
  },

  /* ---------------- 6. FEATURES ---------------- */
  {
    id: "features",
    icon: "flask",
    title: "Features & Stability",
    sub: '"Great models fail with bad features." This is where the most common industrial silent killers live.',
    fields: [
      {
        id: "leakage_review", type: "radio", label: "Have we screened for data/target LEAKAGE?",
        options: [
          { v: "done", l: "Done", k: "good" },
          { v: "planned", l: "Planned", k: "warn" },
          { v: "not", l: "Not yet", k: "bad" },
        ],
        why: 'Leakage = the model "cheats" by seeing the answer in the input (e.g. using "refund amount" to predict churn). Offline scores look amazing; production collapses.',
      },
      { id: "leakage_suspects", type: "textarea", label: "Suspect features that might leak the label", placeholder: "e.g. fields populated AFTER the decision; post-outcome timestamps; aggregates over the future" },
      {
        id: "ablation_planned", type: "radio",
        options: [
          { v: "yes", l: "Yes", k: "good" },
          { v: "no", l: "No", k: "bad" },
        ],
        label: "Will we run ablation tests on suspicious features?",
        why: "Defensive check: drop a suspect feature. If performance collapses entirely, it was probably doing the work through leakage.",
      },
      {
        id: "transform_parity", type: "radio", label: "Will training and serving use the EXACT same transform code & artifacts?",
        options: [
          { v: "same", l: "Same code/artifacts", k: "good" },
          { v: "different", l: "Different paths", k: "bad" },
          { v: "unsure", l: "Unsure", k: "warn" },
        ],
        why: "Transformation parity is non-negotiable. If the training mean/std differ from the live ones, you create training-serving skew and silent failure.",
      },
      {
        id: "feature_store", type: "radio",
        options: [
          { v: "yes", l: "Yes", k: "good" },
          { v: "planned", l: "Planned", k: "warn" },
          { v: "no", l: "No / manual", k: "bad" },
        ],
        label: "Feature store or shared feature pipeline?",
        why: "A feature store enforces online/offline consistency and point-in-time correctness — the structural fix for skew.",
      },
      {
        id: "binning_consistency", type: "radio", label: "Are binning / encoding boundaries pinned & versioned across train and serve?",
        options: [
          { v: "yes", l: "Verified", k: "good" },
          { v: "risk", l: "At risk", k: "warn" },
          { v: "na", l: "N/A", k: "good" },
        ],
        why: "The classic silent killer: training bins Age as (0–18),(19–40) but serving uses (0–20),(21–50). Same bin index, different meaning — the model fails confidently.",
      },
      {
        id: "temporal_validation", type: "radio", label: "For time-dependent data — will validation be OUT-OF-TIME (not a random k-fold split)?",
        options: [
          { v: "oot", l: "Yes — out-of-time / point-in-time", k: "good" },
          { v: "random", l: "No — random split", k: "bad" },
          { v: "na", l: "Not time-dependent", k: "good" },
        ],
        why: 'A random split on time-series data lets the model "see the future" and produces metrics that are too good to be true, then collapse in production. Use point-in-time (as-of) joins and out-of-time validation.',
      },
    ],
  },

  /* ---------------- 7. FEEDBACK LOOP ---------------- */
  {
    id: "feedback",
    icon: "loop",
    title: "The Feedback Loop",
    sub: "The heart of the lifecycle: Prediction → User behaviour → Logging → Label extraction → New training data → Retrain. Design the window around business reality.",
    fields: [
      {
        id: "feedback_window", type: "select", label: "How long until ground truth arrives?",
        options: [
          { v: "", l: "— select —" },
          { v: "seconds", l: "Seconds (e.g. ad click)" },
          { v: "minutes", l: "~Minutes (e.g. food delivered/not)" },
          { v: "hours", l: "Hours" },
          { v: "days", l: "Days (e.g. return/refund)" },
          { v: "weeks", l: "Weeks" },
          { v: "months", l: "Months" },
          { v: "years", l: "1–5 years (e.g. loan default)" },
          { v: "none", l: "No natural feedback — needs manual labelling" },
        ],
        why: "Food delivery learns in ~30 min; loan default ground truth may take years. The window sets your retraining speed and how stale your model is allowed to get.",
      },
      {
        id: "feedback_type", type: "checks", label: "What feedback signals do we get?",
        options: [
          { v: "explicit", l: "Explicit", d: "Ratings, thumbs, confirmations" },
          { v: "implicit", l: "Implicit", d: "Clicks, dwell, purchase, no-action" },
          { v: "natural", l: "Natural labels", d: "Outcome observed automatically" },
          { v: "human", l: "Human review", d: "Analysts adjudicate a sample" },
        ],
      },
      {
        id: "implicit_negative", type: "radio", label: 'How do we treat "no action"? (implicit negatives)',
        options: [
          { v: "handled", l: "Modelled deliberately", k: "good" },
          { v: "ignored", l: 'Just assume "No"', k: "warn" },
          { v: "na", l: "N/A", k: "good" },
        ],
        why: "Assuming every non-action is a hard “No” can be wrong (user never saw it) and quietly biases the model.",
      },
      {
        id: "bias_amplification", type: "radio", label: "Feedback-loop bias: could the model reinforce its own past outputs?",
        options: [
          { v: "mitigated", l: "Assessed & mitigated", k: "good" },
          { v: "risk", l: "Risk present", k: "bad" },
          { v: "na", l: "Low risk / N/A", k: "good" },
        ],
        why: "If you only show popular creators, they get more clicks, look more popular, and new talent is stifled. Recommenders especially create degenerate feedback loops.",
      },
    ],
  },

  /* ---------------- 8. OPS HEALTH ---------------- */
  {
    id: "ops",
    icon: "pulse",
    title: "Operational Health & Constraints",
    sub: "Traditional software fails when the code stops. ML fails when the code is perfect but the world changes (drift) or the pipeline lies (skew).",
    fields: [
      {
        id: "latency_budget", type: "select", label: "Latency budget for a prediction",
        options: [
          { v: "", l: "— select —" },
          { v: "<10ms", l: "< 10 ms (ranking in-request)" },
          { v: "<100ms", l: "< 100 ms (interactive, Reels/feed)" },
          { v: "<1s", l: "< 1 s" },
          { v: "seconds", l: "Seconds OK" },
          { v: "batch", l: "Batch / async (minutes, e.g. loan approval)" },
        ],
        why: "A real-time feed needs millisecond inference; a loan decision can take minutes. This constrains model size and serving design.",
      },
      { id: "throughput_peak", type: "text", label: "Throughput & peak load (state the TAIL, p95/p99 — averages hide it)", placeholder: "e.g. 200 req/s steady, 10× during festival sale, p99 < 250 ms" },
      {
        id: "eu_risk_tier", type: "select", label: "EU AI Act risk tier (decide at kickoff — misclassifying is the biggest compliance exposure)",
        options: [
          { v: "", l: "— select / N/A —" },
          { v: "minimal", l: "Minimal risk (e.g. spam filter, recommender)" },
          { v: "limited", l: "Limited risk (transparency duties, e.g. chatbots)" },
          { v: "high", l: "High risk — Annex III (hiring, credit, education, health, biometrics)" },
          { v: "unacceptable", l: "Prohibited use (social scoring, manipulative)" },
        ],
        why: "High-risk (Annex III) uses carry heavy obligations; prohibited uses are illegal (fines up to €35M / 7% turnover). A hiring/credit/education model assumed “minimal” with no analysis is a classic, expensive mistake.",
      },
      {
        id: "compliance", type: "checks", label: "Compliance & regulatory constraints",
        options: [
          { v: "gdpr", l: "GDPR", d: "EU personal-data rules" },
          { v: "eu_ai_act", l: "EU AI Act", d: "Risk-tier obligations (esp. high-risk uses)" },
          { v: "right_explain", l: "Right to explanation", d: "Must justify automated decisions (GDPR Art. 22)" },
          { v: "hipaa", l: "HIPAA / health", d: "Protected health info" },
          { v: "soc2", l: "SOC 2", d: "Security/controls attestation" },
          { v: "residency", l: "Data residency", d: "Region-locked storage/processing" },
        ],
      },
      {
        id: "interpretability", type: "select", label: "Interpretability requirement",
        options: [
          { v: "", l: "— select —" },
          { v: "full", l: "Full — must explain every decision (regulator/doctor)" },
          { v: "partial", l: "Partial — global explanations / feature importance" },
          { v: "blackbox", l: "Black-box acceptable" },
        ],
        why: '"Can you explain a No to a regulator or a doctor?" If yes is required, it may rule out opaque models — decide before you build.',
      },
      { id: "cost_ceiling", type: "text", label: "Cost ceiling (training + serving)", placeholder: "e.g. < $500/mo inference; one-off training budget" },
      {
        id: "monitoring_plan", type: "checks", label: "Monitoring plan (the Live Scoreboard)",
        why: "A system is not done without monitoring of both the math AND the business KPI.",
        options: [
          { v: "drift", l: "Data/concept drift", d: "Input & target distribution shift (heat-wave problem)" },
          { v: "skew", l: "Training-serving skew", d: "Train artifacts vs live values diverge" },
          { v: "perf", l: "Live ML metrics", d: "Precision/recall/RMSE on fresh labels" },
          { v: "kpi", l: "Business KPIs", d: "Revenue/retention/safety, not just math" },
          { v: "alerts", l: "Alerting & on-call", d: "Someone gets paged on regression" },
          { v: "dash", l: "Dashboards", d: "Visible scoreboard for stakeholders" },
        ],
      },
    ],
  },

  /* ---------------- 9. DEFINITION OF DONE ---------------- */
  {
    id: "dod",
    icon: "check",
    title: "Definition of Done",
    sub: "A system is not “done” until all of this is true. The four core items are the contract.",
    fields: [
      {
        id: "dod_core", type: "checks", label: "Core contract",
        options: [
          { v: "transform", l: "Identical transform code", d: "Same feature code & artifacts in training and serving" },
          { v: "versioned", l: "Versioned artifacts", d: "Models AND data versions tracked & reproducible" },
          { v: "scoreboard", l: "Live scoreboard", d: "Monitoring of both ML math and business KPIs" },
          { v: "rollback", l: "Tested rollback path", d: "Proven fallback to the baseline" },
        ],
      },
      {
        id: "dod_extra", type: "checks", label: "Production hygiene (recommended)",
        options: [
          { v: "docs", l: "Model card / design doc", d: "Intended use, limits, eval, owners" },
          { v: "fairness", l: "Fairness/bias eval", d: "For high-risk decisions" },
          { v: "shadow", l: "Shadow / canary plan", d: "De-risk the rollout" },
          { v: "retrain", l: "Retraining cadence", d: "Trigger or schedule defined" },
        ],
      },
      { id: "dod_owner", type: "text", label: "Who OWNS this system in production?", help: "A model with no owner is an incident waiting to happen." },
    ],
  },

  /* ---------------- 10. SUMMARY ---------------- */
  {
    id: "summary",
    icon: "scroll",
    title: "Verdict & One-Pager Blueprint",
    sub: "Live decision and an exportable scope document.",
    summary: true,
    fields: [],
  },
];

/* baseline suggestions keyed by problem_type */
export const BASELINE_SUGGEST: Record<string, string> = {
  tabular_class: 'Logistic regression on a handful of strong features — easy to debug, sets the "math to beat".',
  tabular_reg: "Predict-the-mean / last-value, then simple linear regression.",
  text_screen: 'Keyword / rule counts (e.g. count "Python","Java" in a résumé) — interpretable, zero training data.',
  recommendation: "Most-popular / top-selling items — a simple SQL query, no cold-start problem, immediate value.",
  cv: "Heuristic (size/colour/threshold) or a pretrained off-the-shelf model with no fine-tuning.",
  genai: "A single well-crafted prompt to a foundation model, or a retrieval + template approach, before any fine-tuning.",
  clustering: "Rule-based segments (e.g. RFM buckets) before k-means.",
};
