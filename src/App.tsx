import { useEffect } from "react";
import { useStore } from "@/store";
import { SECTIONS } from "@/data/sections";
import { Navbar } from "@/components/Navbar";
import { Landing } from "@/components/Landing";
import { SectionPanel } from "@/components/SectionPanel";
import { SummaryPanel } from "@/components/SummaryPanel";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function App() {
  const current = useStore((st) => st.current);
  const theme = useStore((st) => st.theme);
  const entered = useStore((st) => st.entered);
  const next = useStore((st) => st.next);
  const back = useStore((st) => st.back);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // jump back to the top whenever the view or section changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [current, entered]);

  useEffect(() => {
    if (!entered) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName || "").toUpperCase();
      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, back, entered]);

  const section = SECTIONS[current];

  return (
    <TooltipProvider delayDuration={150}>
      <div className="min-h-screen">
        <Navbar mode={entered ? "intake" : "home"} />

        {!entered ? (
          <Landing />
        ) : (
          <main className="mx-auto w-full px-5 py-10 sm:px-8">
            {section.summary ? (
              <SummaryPanel />
            ) : (
              <SectionPanel section={section} />
            )}
          </main>
        )}
      </div>
    </TooltipProvider>
  );
}
