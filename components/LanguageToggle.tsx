// components/LanguageToggle.tsx
"use client";
import type { Language } from "@/lib/types";
import { Globe } from "./icons";

export default function LanguageToggle({ lang, onChange }: { lang: Language; onChange: (l: Language) => void }) {
  const opts: { v: Language; l: string }[] = [{ v: "en", l: "EN" }, { v: "es", l: "ES" }];
  return (
    <div role="group" aria-label="Language" className="flex items-center gap-1 rounded-full border border-line bg-surface p-1">
      <Globe className="ml-1.5 mr-0.5 h-4 w-4 text-muted" aria-hidden />
      {opts.map((o) => {
        const active = lang === o.v;
        return (
          <button
            key={o.v}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.v)}
            className={`rounded-full px-2.5 py-1 text-sm font-semibold transition-colors ${active ? "bg-brand text-white" : "text-muted hover:text-ink"}`}
          >
            {o.l}
          </button>
        );
      })}
    </div>
  );
}
