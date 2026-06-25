interface Ref {
  title: string;
  href: string;
  note?: string;
}
interface RefGroup {
  tag: string;
  items: Ref[];
}

const REFS: RefGroup[] = [
  {
    tag: "Should we use ML? / feasibility",
    items: [
      { title: "Rules of Machine Learning — Zinkevich, Google", href: "https://developers.google.com/machine-learning/guides/rules-of-ml", note: "Rule #1: launch without ML; skew rules" },
      { title: "Managing ML Projects: Feasibility — Google", href: "https://developers.google.com/machine-learning/managing-ml-projects/feasibility", note: "5 gating dimensions" },
      { title: "When to use ML — Chip Huyen", href: "https://huyenchip.com/machine-learning-systems-design/design-a-machine-learning-system.html" },
      { title: "Towards CRISP-ML(Q)", href: "https://arxiv.org/pdf/2003.05155", note: "time-boxed feasibility, valid 'no ML' outcome" },
      { title: "LLM Build vs Buy decision framework", href: "https://www.techtarget.com/searchenterpriseai/tip/LLM-build-vs-buy-A-decision-framework-for-LLM-adoption" },
    ],
  },
  {
    tag: "Requirements & framing",
    items: [
      { title: "The Machine Learning Canvas — Louis Dorard", href: "https://www.ownml.co/machine-learning-canvas" },
      { title: "MLOps Phase Zero — ML Canvas questions", href: "https://ml-ops.org/content/phase-zero" },
      { title: "Gathering Requirements for ML-Enabled Systems — Kästner", href: "https://ckaestne.medium.com/gathering-requirements-for-ml-enabled-systems-4f0a7a23730f" },
    ],
  },
  {
    tag: "Data: labels, imbalance, bias",
    items: [
      { title: "Datasheets for Datasets — Gebru et al.", href: "https://arxiv.org/pdf/1803.09010" },
      { title: "Snorkel: Weak Supervision — Ratner et al.", href: "https://arxiv.org/pdf/1711.10160" },
      { title: "ROC-AUC vs PR for imbalanced data", href: "https://machinelearningmastery.com/roc-auc-vs-precision-recall-for-imbalanced-data/" },
      { title: "Oversampling before CV leaks (bias)", href: "https://www.nature.com/articles/s41598-024-62585-z" },
      { title: "DVC — Data Version Control", href: "https://doc.dvc.org/start" },
    ],
  },
  {
    tag: "Features: leakage & skew",
    items: [
      { title: "Training-serving skew monitoring — Vertex AI", href: "https://cloud.google.com/blog/topics/developers-practitioners/monitor-models-training-serving-skew-vertex-ai" },
      { title: "Leakage (machine learning)", href: "https://en.wikipedia.org/wiki/Leakage_(machine_learning)" },
      { title: "Point-in-time correctness", href: "https://apxml.com/courses/feature-stores-for-ml/chapter-3-data-consistency-quality/point-in-time-correctness" },
      { title: "Feast — open-source feature store", href: "https://docs.feast.dev/" },
    ],
  },
  {
    tag: "Feedback loops & continual learning",
    items: [
      { title: "Data Distribution Shifts & Monitoring — Huyen", href: "https://huyenchip.com/2022/02/07/data-distribution-shifts-and-monitoring.html" },
      { title: "Feedback Loop & Bias Amplification in Recommenders — Mansoury et al.", href: "https://arxiv.org/abs/2007.13019" },
    ],
  },
  {
    tag: "Monitoring & ops",
    items: [
      { title: "Data & concept drift — Evidently AI", href: "https://www.evidentlyai.com/blog/machine-learning-monitoring-data-and-concept-drift" },
      { title: "MLOps levels 0/1/2 — Google Cloud", href: "https://docs.cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning" },
      { title: "MLOps Maturity Model — Azure", href: "https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/mlops-maturity-model" },
      { title: "ML Model Production Checklist — Microsoft", href: "https://microsoft.github.io/code-with-engineering-playbook/machine-learning/ml-model-checklist/" },
    ],
  },
  {
    tag: "Responsible AI, risk & compliance",
    items: [
      { title: "NIST AI RMF 1.0", href: "https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf", note: "Govern/Map/Measure/Manage" },
      { title: "Model Cards for Model Reporting — Mitchell et al.", href: "https://arxiv.org/abs/1810.03993" },
      { title: "EU AI Act — risk tiers & timeline", href: "https://artificialintelligenceact.eu/implementation-timeline/" },
      { title: "GDPR Article 22 — automated decisions", href: "https://gdpr-text.com/read/article-22/" },
      { title: "Fairlearn — fairness metrics", href: "https://fairlearn.org/v0.5.0/user_guide/fairness_in_machine_learning.html" },
      { title: "SOC 2 Trust Services Criteria", href: "https://cloudsecurityalliance.org/blog/2023/10/05/the-5-soc-2-trust-services-criteria-explained" },
    ],
  },
];

export function References() {
  return (
    <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
      {REFS.map((g) => (
        <div key={g.tag}>
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {g.tag}
          </div>
          <ul className="space-y-1.5">
            {g.items.map((it) => (
              <li key={it.href} className="text-[13px] leading-snug">
                <a
                  href={it.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground underline-offset-2 hover:text-brand hover:underline"
                >
                  {it.title}
                </a>
                {it.note && (
                  <span className="text-muted-foreground"> — {it.note}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
