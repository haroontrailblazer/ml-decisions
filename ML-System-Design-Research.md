# ML System Design — Enrichment Pack & References

> Companion research for **ml-intake-tool.html**. Generated from a multi-source web research pass
> (7 dimensions: feasibility, requirements, data, features, feedback, monitoring, responsible-AI),
> then synthesized. Every framework below is folded into the interactive intake tool's questions,
> warnings, and References panel.

---

# ML Project Intake & Scoping — Enrichment Pack

## 1. Top External Frameworks to Cite

Deduplicated, authoritative sources worth naming in the tool's References panel.

| Framework | One-line summary | URL |
|---|---|---|
| **Google – Rules of Machine Learning** (Zinkevich) | 43 battle-tested rules; #1 "launch without ML first," plus the canonical skew rules (#29, #31–33, #37). | https://developers.google.com/machine-learning/guides/rules-of-ml |
| **Google – Managing ML Projects: Feasibility** | Five gating dimensions (data, difficulty, quality bar, technical, cost-benefit) before committing to ML. | https://developers.google.com/machine-learning/managing-ml-projects/feasibility |
| **Chip Huyen – Designing ML Systems** | When-to-use-ML fit test, business→ML objective framing, continual learning, drift, test-in-production. | https://github.com/chiphuyen/dmls-book |
| **ML Canvas** (Louis Dorard) | One-page 10-block scoping tool linking value proposition → prediction → decision → data flywheel. | https://www.ownml.co/machine-learning-canvas |
| **CRISP-ML(Q)** (Studer et al.) | Process model with a quality-assured, time-boxed feasibility phase and explicit "don't use ML" outcome. | https://arxiv.org/pdf/2003.05155 |
| **Datasheets for Datasets** (Gebru et al.) | 57-question dataset documentation standard: provenance, consent, composition, intended uses. | https://arxiv.org/abs/1803.09010 |
| **Model Cards** (Mitchell et al.) | Model reporting standard with disaggregated, per-group performance and intended-use boundaries. | https://arxiv.org/abs/1810.03993 |
| **Snorkel – Weak Supervision** (Ratner et al.) | Programmatic labeling via labeling functions + a generative label model when labels are scarce. | https://arxiv.org/pdf/1711.10160 |
| **DVC – Data Version Control** | Git-for-data so every model ties to exact data+code version (reproducibility, rollback). | https://doc.dvc.org/start |
| **NIST AI Risk Management Framework (AI RMF 1.0)** | Govern / Map / Measure / Manage spine for trustworthy-AI risk. | https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf |
| **EU AI Act (Reg. 2024/1689)** | Four risk tiers; heavy obligations for Annex III high-risk; fines up to €35M / 7% turnover. | https://artificialintelligenceact.eu/implementation-timeline/ |
| **GDPR Article 22** | Restricts solely-automated significant decisions; human-intervention / contest rights. | https://gdpr-text.com/read/article-22/ |
| **Fairlearn** | Demographic parity, equalized odds, equal opportunity — and why they're mutually incompatible. | https://fairlearn.org/v0.5.0/user_guide/fairness_in_machine_learning.html |
| **Google Vertex AI – Training-Serving Skew Monitoring** | Per-feature distribution distance (JS divergence / L∞, 0.3 default threshold) for skew/drift. | https://cloud.google.com/blog/topics/developers-practitioners/monitor-models-training-serving-skew-vertex-ai |
| **NannyML / Evidently AI** | Label-free performance estimation + open-source drift monitoring for production. | https://www.evidentlyai.com/ml-in-production/model-monitoring |
| **Google & Azure MLOps Maturity Models** | L0–2 (Google) / L0–4 (Azure) self-assessment grids tied to automation level. | https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/mlops-maturity-model |
| **SOC 2 (AICPA Trust Services Criteria)** | Security (mandatory) + Availability/Confidentiality/Processing Integrity/Privacy. | https://cloudsecurityalliance.org/blog/2023/10/05/the-5-soc-2-trust-services-criteria-explained |

---

## 2. High-Value Additions Beyond the Existing Notes

The user's draft already covers: **6-Word Test, Three Lenses, Metric Ladder, Baseline, Data, Features, Feedback, Ops, Definition of Done.** Below are items that draft most likely does *not* yet capture, mapped to the relevant section.

### → Baseline / "Should We Use ML?" section
- **Complexity-inversion check (Huyen):** ML is justified *positively* when rule logic is sprawling toward 100+ nested conditionals. Ask: "Is your current rule set small and stable, or already unmaintainable?" — small+stable is a reason *not* to adopt ML.
- **Build-vs-Buy-vs-API ladder:** default to API → fine-tune (LoRA before full) → train-from-scratch. *Why it matters:* every competitor on the same commercial API has the same accuracy — APIs rarely create a moat. Intake Q: "If a foundation-model API solved 80% of this next week, is that acceptable, or do you specifically need a model you own?"
- **Repetitiveness / amortization test:** ML carries heavy fixed costs. Ask "How often is this decision made — high volume, or occasional?" A rare/one-off decision is better served by a human or one-time analysis.
- **Time-boxed feasibility gate with an explicit "NO ML" exit** (CRISP-ML(Q): 4-week first milestone, ≤16 weeks). *Why it matters:* legitimizes "use a heuristic instead" as a *successful, money-saving* outcome rather than a failure.

### → Metric Ladder / Problem-Framing section
- **Multiple-framings exercise:** explicitly enumerate 2–3 alternative framings (classification vs. regression vs. ranking) before locking one — framing changes difficulty, architecture, and metrics dramatically.
- **Decouple conflicting objectives:** when goals conflict (engagement vs. quality, relevance vs. safety), model them separately and combine at serving time so they retrain/tune independently.
- **Error-cost asymmetry:** capture the relative cost of a false positive vs. false negative — this silently dictates metric choice and thresholds, not just headline accuracy.
- **Prediction-quality cost curve:** quality drives cost non-linearly (99.9%→99.99% can cost 10×). Ask for the *minimum useful* bar, not the aspirational one.

### → Data section
- **Class-imbalance / accuracy-paradox guard:** quantify minority-class %; forbid raw accuracy as the headline metric on skewed data (default to PR-AUC, precision/recall, F-beta).
- **Resampling-inside-the-fold rule:** SMOTE/scaling must be fit *only* inside the training fold — doing it before the split leaks test info and inflates offline metrics.
- **Proxy-label trap:** verify the label is the true outcome, not a convenient proxy (e.g., "clicked" ≠ "satisfied"). A proxy label silently caps the project ceiling.
- **Cheap-label ladder + protected GOLD set:** sequence transfer learning → weak supervision (Snorkel) → active learning → synthetic; validate every cheap-label method against a clean human-labeled gold set, never against itself.
- **Per-slice representation & bias check:** confirm every production segment is represented; track per-slice metrics — aggregate numbers hide thin-segment failures.
- **Synthetic-data triple test:** if synthetic data is used, evaluate fidelity *and* downstream utility *and* privacy (membership-inference), not just "looks realistic."

### → Features section
- **Point-in-time (as-of) join requirement:** training rows must use only feature values knowable at the label's event timestamp; a "latest-value" join causes time-travel leakage.
- **Train-like-you-serve logging:** log served feature vectors (sampled) and train on *those*, rather than reconstructing from source tables.
- **Single source of truth for transforms:** shared library or serialized fitted transformer loaded unchanged at serving — never re-implement feature math in two languages/engines.
- **Mutable/backfilled-table leakage:** flag features from tables that get updated after the event (account status, labels, aggregates).
- **Vocab / bin-edge / imputation / float-precision parity:** these must be byte-for-byte identical across train and serve (a 0.0498→0.05 bin crossing flips predictions).
- **Out-of-time validation, not random k-fold,** for time-dependent data; run feature-ablation + adversarial validation before promotion.

### → Feedback section
- **Feedback-loop length & natural-label source:** measure time from prediction to ground-truth; it determines achievable retraining cadence and which methods (bandits vs. batch) are viable.
- **Delayed-feedback / premature-negative handling:** for conversions/CVR, an unlabeled prediction is *not* automatically a negative; choose the label window deliberately.
- **Degenerate feedback loop detection** (recommenders/ranking): monitor diversity, long-tail coverage, hit-rate-by-popularity-bucket; add exploration (ε-greedy/UCB, new-item traffic pools) + positional features neutralized at inference.
- **Value-of-data-freshness experiment:** set retraining cadence empirically (train on old vs. recent, test on current) rather than by calendar.
- **Stateful vs. stateless retraining:** stateful fine-tuning gave Grubhub ~45× compute savings; but keep periodic full retrains for architecture/feature changes.

### → Ops / Monitoring section
- **Diagnose drift type before reacting:** data drift vs. concept drift vs. training-serving skew demand different fixes; blindly auto-retraining on a skew/pipeline bug just reintroduces it.
- **Label-free degradation detection:** monitor prediction-confidence distribution shifts + input drift as leading indicators (e.g., NannyML CBPE) when ground truth is delayed/absent.
- **Progressive delivery sequence:** offline-eval gate → shadow → canary (5–30%) → full, with a registered prior version for minute-scale rollback.
- **Separate on-call & runbook for model-quality incidents** (distinct from service-down) with a *named* owner — drift falls between data-science and platform teams.
- **MLOps maturity self-assessment** matched to data/model change velocity (don't over- or under-automate).

### → Responsible AI / Compliance (likely a gap — consider a new section)
- **EU AI Act risk-tier gate at kickoff** (unacceptable/high/limited/minimal) with documented rationale — misclassifying an Annex III use case (hiring, credit, education) is the single largest compliance exposure.
- **GDPR Article 22 check** for solely-automated significant decisions: defined human-intervention, contest, and explanation path.
- **Serving SLOs quantified:** p95/p99 latency (not average), peak QPS, and a per-prediction/monthly cost ceiling — these constrain architecture and model choice *before* model selection.
- **Explainability method matched to audience + latency** (SHAP for audit-grade; LIME for real-time).
- **Governance / sign-off owner + third-party-model intake review** (NIST GOVERN).

---

## 3. Red Flags / Gotchas to Surface as UI Warnings

**Should-we-use-ML**
- "We'll get the data later" / labels must be hand-created at scale with no budget.
- Team jumps to model/algorithm choice before stating the non-ML baseline or measuring it.
- Plan to train from scratch with no moat or data-sovereignty reason (an API or fine-tune wasn't ruled out).
- Current rules are still small and stable — ML would add complexity with no benefit.

**Problem framing / metrics**
- Goal is a vague aspiration ("use AI," "be data-driven") with no number, baseline, or owning business metric.
- Nobody can name the downstream decision the prediction drives ("we'll figure out how to use it later").
- All errors treated as equally bad in a domain where one mistake clearly hurts more.
- Near-perfect accuracy demanded with no human-in-the-loop fallback.

**Data**
- Accuracy is the headline metric on an imbalanced problem.
- SMOTE/scaling run on the full dataset *before* the split.
- Labels are an unexamined proxy; no inter-annotator agreement measured.
- Pseudo/weak labels used for both training *and* evaluation (no independent ground truth).
- Only aggregate metrics; a known-important segment is thin/absent.
- Synthetic data adopted because it "looks realistic" with no privacy-attack test.

**Features (skew/leakage)**
- A single feature has implausibly dominant importance.
- Training uses Spark/SQL, serving re-implements features in Java/Python — two codebases, no parity test.
- Training joins the "latest/current" value of a feature table onto historical events.
- Random train/test split on time-series data; metrics "too good to be true."
- Features include post-event fields (refund flags, days_since_account_closed, downstream status).

**Feedback**
- Team can't state when/how ground truth arrives for a frequently-updated model.
- A single fixed label window with no analysis of late-arriving positives.
- Recommender tracks only CTR/accuracy; no diversity or popularity-bucket metric; outputs homogenizing unnoticed.
- New items get effectively zero guaranteed exposure (no exploration).
- Retraining is "every night/week" with no decay measurement.

**Ops / Monitoring**
- Monitors only uptime/latency: "the model is fine because the API is up."
- Every quality drop triggers an auto-retrain with no root-cause step.
- Big-bang 100% deploys; no shadow/canary; rollback is slow/manual or never tested.
- No named owner paged for model-quality (vs. service-down) incidents.
- Manual notebook retraining for a system whose data changes daily.

**Responsible AI / Compliance / Serving**
- Annex III use case (hiring, credit, education, healthcare) assumed "minimal/limited" risk with no analysis.
- "The model just auto-decides," no way for a subject to contest, no DPIA.
- Fairness "handled" by dropping the protected attribute (ignores proxies).
- Latency stated only as an average (hides the tail); "as fast as possible"; no cost ceiling.
- Black-box model in a high-stakes decision with no explanation plan.
- Selling to enterprise / processing EU personal data with no SOC 2 plan or unclear data residency.

---

## 4. References & Further Reading

**Should-we-use-ML & feasibility**
- Rules of Machine Learning (Zinkevich, Google) — https://developers.google.com/machine-learning/guides/rules-of-ml
- Managing ML Projects: Feasibility (Google) — https://developers.google.com/machine-learning/managing-ml-projects/feasibility
- Machine Learning Systems Design / When to use ML (Huyen) — https://huyenchip.com/machine-learning-systems-design/design-a-machine-learning-system.html
- Towards CRISP-ML(Q) (Studer et al.) — https://arxiv.org/pdf/2003.05155
- ML Feasibility Study (Microsoft Playbook) — https://playbook.microsoft.com/code-with-engineering/machine-learning/ml-feasibility-study/
- LLM Build vs. Buy: A Decision Framework (TechTarget) — https://www.techtarget.com/searchenterpriseai/tip/LLM-build-vs-buy-A-decision-framework-for-LLM-adoption
- A Practical Guide to LLM Fine Tuning (Databricks) — https://www.databricks.com/blog/llm-fine-tuning

**Requirements & problem framing**
- Machine Learning Canvas (Louis Dorard, OWNML) — https://www.ownml.co/machine-learning-canvas
- MLOps Phase Zero — ML Canvas guiding questions (ml-ops.org) — https://ml-ops.org/content/phase-zero
- Designing ML Systems, Ch. 2 (Huyen, O'Reilly) — https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/
- ML System Design 9-step framework (alirezadir, GitHub) — https://github.com/alirezadir/machine-learning-interviews/blob/main/src/MLSD/ml-system-design.md
- ML System Design Interview (ByteByteGo) — https://bytebytego.com/courses/machine-learning-system-design-interview
- Data Science Project Scoping Guide (DSPP) — https://datasciencepublicpolicy.org/our-work/tools-guides/data-science-project-scoping-guide/
- Gathering Requirements for ML-Enabled Systems (Kästner) — https://ckaestne.medium.com/gathering-requirements-for-ml-enabled-systems-4f0a7a23730f
- The Data Science Project Checklist (Data Science PM) — https://www.datascience-pm.com/data-science-project-checklist/

**Data: labeling, imbalance, versioning, bias**
- Datasheets for Datasets (Gebru et al.) — https://arxiv.org/pdf/1803.09010
- Snorkel: Weak Supervision (Ratner et al.) — https://arxiv.org/pdf/1711.10160
- Active Learning in ML Guide (Encord) — https://encord.com/blog/active-learning-machine-learning-guide/
- Accuracy paradox (Wikipedia) — https://en.wikipedia.org/wiki/Accuracy_paradox
- ROC AUC vs Precision-Recall for Imbalanced Data (MachineLearningMastery) — https://machinelearningmastery.com/roc-auc-vs-precision-recall-for-imbalanced-data/
- Oversampling before CV leads to bias (Nature Sci. Reports) — https://www.nature.com/articles/s41598-024-62585-z
- Get Started with DVC — https://doc.dvc.org/start
- Mitigating Model Bias in ML (Encord) — https://encord.com/blog/reducing-bias-machine-learning/
- Synthetic data: privacy/quality (IBM) — https://www.ibm.com/new/product-blog/synthetic-data-generation-building-trust-by-ensuring-privacy-and-quality

**Features: leakage & training-serving skew**
- Monitor models for training-serving skew with Vertex AI — https://cloud.google.com/blog/topics/developers-practitioners/monitor-models-training-serving-skew-vertex-ai
- Leakage (machine learning) — Wikipedia — https://en.wikipedia.org/wiki/Leakage_(machine_learning)
- Feature leakage: Detect, Prevent, Fix (Hex) — https://hex.tech/blog/feature-leakage/
- Point-in-Time Correctness for Training Data (APXML) — https://apxml.com/courses/feature-stores-for-ml/chapter-3-data-consistency-quality/point-in-time-correctness
- Eliminate Training-Serving Skew in MLOps (Confluent) — https://www.confluent.io/blog/eliminate-training-serving-skew-mlops/
- Feast: Open Source Feature Store — https://docs.feast.dev/

**Feedback loops & continual learning**
- Data Distribution Shifts and Monitoring (Huyen) — https://huyenchip.com/2022/02/07/data-distribution-shifts-and-monitoring.html
- Real-time ML: Challenges and Solutions (Huyen) — https://huyenchip.com/2022/01/02/real-time-machine-learning-challenges-and-solutions.html
- Feedback Loop and Bias Amplification in Recommender Systems (Mansoury et al., CIKM 2020) — https://arxiv.org/abs/2007.13019
- Continual Learning & Test in Production summary (serodriguez68) — https://github.com/serodriguez68/designing-ml-systems-summary/blob/main/09-continual-learning-and-test-in-production.md

**Monitoring & operational health**
- ML Monitoring: Data and Concept Drift (Evidently AI) — https://www.evidentlyai.com/blog/machine-learning-monitoring-data-and-concept-drift
- Model monitoring for ML in production (Evidently AI) — https://www.evidentlyai.com/ml-in-production/model-monitoring
- MLOps: Continuous delivery & automation pipelines (Google Cloud) — https://docs.cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning
- MLOps Maturity Model (Azure) — https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/mlops-maturity-model
- Estimating ML Performance Without Ground Truth (TDS) — https://towardsdatascience.com/estimating-the-performance-of-an-ml-model-in-the-absence-of-ground-truth-cc87dbf6e57/
- ML Model Production Checklist (Microsoft Playbook) — https://microsoft.github.io/code-with-engineering-playbook/machine-learning/ml-model-checklist/

**Responsible AI, risk, compliance & serving**
- NIST AI RMF 1.0 — https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf
- Model Cards for Model Reporting (Mitchell et al.) — https://arxiv.org/abs/1810.03993
- EU AI Act Implementation Timeline — https://artificialintelligenceact.eu/implementation-timeline/
- GDPR Article 22 — Automated decision-making — https://gdpr-text.com/read/article-22/
- ICO: Rights related to automated decision-making — https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/individual-rights/rights-related-to-automated-decision-making-including-profiling/
- Fairness in ML (Fairlearn) — https://fairlearn.org/v0.5.0/user_guide/fairness_in_machine_learning.html
- SHAP and LIME for ML Interpretability — https://arshad-kazi.com/shap-and-lime-for-ml-interpretability/
- The 5 SOC 2 Trust Services Criteria (Cloud Security Alliance) — https://cloudsecurityalliance.org/blog/2023/10/05/the-5-soc-2-trust-services-criteria-explained