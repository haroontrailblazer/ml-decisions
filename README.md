# ML Intake & Scoping — shadcn/ui app

A polished React rebuild of the ML project intake & scoping tool: **dark-first shadcn/ui**, **Phosphor
icons**, Unsplash stock headers, and the same GO / CAUTION / NO-GO / BLOCKED decision engine.

The original single-file version still lives at `../ml-intake-tool.html` (offline, double-click).

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
```

Build a static, hostable bundle:

```bash
npm run build      # → dist/   (open dist/index.html or host it)
npm run preview    # serve the built bundle
npm run typecheck  # tsc --noEmit
```

## Stack

- **Vite + React 18 + TypeScript**
- **Tailwind CSS v3** + **shadcn/ui** components (vendored in `src/components/ui`, lucide swapped for Phosphor)
- **@phosphor-icons/react** icons · **zustand** (+ `persist`) for state & localStorage autosave
- Dark-first theme (toggle in the top bar); authentic shadcn zinc tokens + indigo primary

## Where things live

| Path | Purpose |
|---|---|
| `src/data/sections.ts` | The typed questionnaire — all 11 sections, fields, "why" notes, options. Edit here to add/change questions. |
| `src/data/images.ts` | Unsplash header art + gradient fallback per section. |
| `src/data/icons.tsx` | String-key → Phosphor icon registry. |
| `src/lib/scoring.ts` | `computeScores()` — readiness %, verdict, reasons, per-dimension bars. Verdict-parity tested against the original. |
| `src/lib/markdown.ts` | One-pager Markdown export. |
| `src/store.ts` | zustand store (answers, current section, theme). |
| `src/components/*` | `TopBar`, `Sidebar`, `SectionPanel`, `SummaryPanel`, `DynamicNotes`, `fields/*`, vendored `ui/*`. |

## Behavior preserved from the original

6-Word say-no gate · three lenses · metric ladder · baseline + rollback · data · features · feedback ·
ops · Definition of Done. Hard **NO-GO** on a failed 6-Word test, a workable simpler rule, or an EU
AI-Act prohibited use; **BLOCKED** on unmitigated critical risk; **GO** ≥75% / **CAUTION** ≥50%.
Live contextual warnings (accuracy trap, training-serving skew, serving-time gap, proxy label,
time-travel leakage, EU risk tier). Export: Copy MD / .md / .json / Print / Import / Reset.
