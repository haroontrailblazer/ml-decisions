import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SECTIONS } from "@/data/sections";
import type { Answers, AnswerValue } from "@/types";

type Theme = "dark" | "light";
const LAST = SECTIONS.length - 1;

interface AppState {
  answers: Answers;
  current: number;
  theme: Theme;
  /** false = ausdata-style landing page, true = intake questionnaire */
  entered: boolean;
  setField: (id: string, value: AnswerValue) => void;
  toggleCheck: (id: string, v: string) => void;
  goto: (i: number) => void;
  next: () => void;
  back: () => void;
  /** enter the questionnaire, optionally jumping to a section */
  enter: (i?: number) => void;
  exitHome: () => void;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  reset: () => void;
  importAnswers: (a: Answers) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      answers: {},
      current: 0,
      theme: "dark",
      entered: false,
      setField: (id, value) =>
        set((st) => ({ answers: { ...st.answers, [id]: value } })),
      toggleCheck: (id, v) =>
        set((st) => {
          const list = Array.isArray(st.answers[id])
            ? [...(st.answers[id] as string[])]
            : [];
          const i = list.indexOf(v);
          if (i >= 0) list.splice(i, 1);
          else list.push(v);
          return { answers: { ...st.answers, [id]: list } };
        }),
      goto: (i) => set({ current: Math.max(0, Math.min(i, LAST)) }),
      next: () => set((st) => ({ current: Math.min(st.current + 1, LAST) })),
      back: () => set((st) => ({ current: Math.max(st.current - 1, 0) })),
      enter: (i) =>
        set((st) => ({
          entered: true,
          current: i == null ? st.current : Math.max(0, Math.min(i, LAST)),
        })),
      exitHome: () => set({ entered: false }),
      setTheme: (t) => set({ theme: t }),
      toggleTheme: () =>
        set((st) => ({ theme: st.theme === "dark" ? "light" : "dark" })),
      reset: () => set({ answers: {}, current: 0 }),
      importAnswers: (a) => set({ answers: a, current: 0 }),
    }),
    {
      name: "mlIntakeV2",
      partialize: (st) => ({
        answers: st.answers,
        current: st.current,
        theme: st.theme,
        entered: st.entered,
      }),
    },
  ),
);
