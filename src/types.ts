export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "select"
  | "radio"
  | "checks";

export type OptionKind = "good" | "bad" | "warn";

export interface FieldOption {
  v: string;
  l: string;
  k?: OptionKind;
  d?: string;
}

export interface Field {
  id: string;
  type: FieldType;
  label?: string;
  help?: string;
  why?: string;
  placeholder?: string;
  options?: FieldOption[];
  /** render at half width (two-up) on >= sm screens */
  half?: boolean;
}

export interface Section {
  id: string;
  title: string;
  icon: string;
  sub: string;
  gate?: boolean;
  summary?: boolean;
  fields: Field[];
}

export type AnswerValue = string | string[];
export type Answers = Record<string, AnswerValue>;

export type Verdict = "GO" | "CAUTION" | "NO-GO" | "BLOCKED" | "NOT READY";

export interface ScorePart {
  label: string;
  val: number;
  weight: number;
}

export interface ScoreResult {
  readiness: number;
  verdict: Verdict;
  reasons: string[];
  parts: ScorePart[];
  yes: number;
  no: number;
  unsure: number;
  answered: number;
}
