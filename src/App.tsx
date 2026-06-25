import { useEffect, useRef } from "react";
import { useStore } from "@/store";
import { SECTIONS } from "@/data/sections";
import { TopBar } from "@/components/TopBar";
import { Sidebar } from "@/components/Sidebar";
import { SectionPanel } from "@/components/SectionPanel";
import { SummaryPanel } from "@/components/SummaryPanel";
import { TooltipProvider } from "@/components/ui/tooltip";

const WALLPAPER =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=55";

export default function App() {
  const current = useStore((st) => st.current);
  const theme = useStore((st) => st.theme);
  const next = useStore((st) => st.next);
  const back = useStore((st) => st.back);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // scroll the panel's main column back to top when the section changes
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [current]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName || "").toUpperCase();
      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, back]);

  const section = SECTIONS[current];

  return (
    <TooltipProvider delayDuration={150}>
      {/* ambient wallpaper photo over the CSS mesh (grayscale, faint) */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-cover bg-center opacity-[0.10] grayscale"
        style={{ backgroundImage: `url("${WALLPAPER}")` }}
      />
      <div className="h-screen w-full p-2 sm:p-3.5 lg:p-5">
        <div className="app-shell mx-auto flex h-full max-w-[1500px] flex-col overflow-hidden rounded-[1.75rem]">
          <TopBar />
          <div className="flex min-h-0 flex-1">
            <Sidebar />
            <main
              ref={mainRef}
              className="min-w-0 flex-1 overflow-y-auto px-4 py-8 sm:px-8"
            >
              {section.summary ? (
                <SummaryPanel />
              ) : (
                <SectionPanel section={section} />
              )}
            </main>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
