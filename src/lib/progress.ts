import type { Answers, Section } from "@/types";

/** A section counts as "done" once ≥60% of its fields are filled. */
export function sectionDone(sec: Section, answers: Answers): boolean {
  if (sec.summary) return false;
  const ids = sec.fields.map((f) => f.id);
  if (!ids.length) return false;
  let filled = 0;
  ids.forEach((id) => {
    const v = answers[id];
    if (Array.isArray(v) ? v.length : v != null && String(v).trim() !== "")
      filled++;
  });
  return filled / ids.length >= 0.6;
}
