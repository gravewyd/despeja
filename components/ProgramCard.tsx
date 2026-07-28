// components/ProgramCard.tsx
"use client";
import { useEffect, useState } from "react";
import type { EligibilityResult, Language } from "@/lib/types";
import { t } from "@/lib/i18n";
import { Check, Sparkle, ExternalLink, Chevron } from "./icons";

interface Facts { householdSize: number; percentOfFpl: number; numChildrenUnder18: number }

const META = {
  likely: { ring: "text-low bg-low/10 border-low/25", key: "statusLikely" as const },
  maybe: { ring: "text-mid bg-mid/10 border-mid/25", key: "statusMaybe" as const },
  unlikely: { ring: "text-muted bg-line/50 border-line", key: "statusUnlikely" as const },
};

export default function ProgramCard({
  result, facts, lang, defaultOpen = false,
}: {
  result: EligibilityResult; facts: Facts; lang: Language; defaultOpen?: boolean;
}) {
  const { program, status, reason, estimate } = result;
  const meta = META[status];
  const [open, setOpen] = useState(defaultOpen);
  const [aiText, setAiText] = useState<string | null>(null);
  const [aiUsed, setAiUsed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setAiText(null); setAiUsed(false); }, [lang]);
  const explanation = aiText ?? program.description[lang];

  async function explain() {
    setLoading(true);
    try {
      const res = await fetch("/api/explain", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ programId: program.id, language: lang, facts: { ...facts, status } }),
      });
      const data = await res.json();
      if (data?.text) { setAiText(data.text); setAiUsed(data.source === "ai"); }
    } catch { /* keep built-in text */ } finally { setLoading(false); }
  }

  return (
    <div className="overflow-hidden rounded-xl2 border border-line bg-surface shadow-card">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center gap-4 px-5 py-4 text-left">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${meta.ring}`}>
          <Check className="h-5 w-5" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-ink">{program.name[lang]}</span>
          <span className="block truncate text-sm text-muted">{program.tagline[lang]}</span>
        </span>
        <span className={`hidden shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold sm:block ${meta.ring}`}>{t(lang, meta.key)}</span>
        <Chevron className={`h-5 w-5 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>

      {open && (
        <div className="animate-fade-in border-t border-line px-5 py-5">
          <p className="text-sm font-medium text-muted">{reason[lang]}</p>
          {estimate && (
            <p className="mt-3 inline-block rounded-lg bg-accent-soft px-3 py-1.5 text-sm font-semibold text-accent">
              {t(lang, "estimateLabel")}: {estimate[lang]}
            </p>
          )}
          <p className="mt-4 text-ink">{explanation}</p>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button type="button" onClick={explain} disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/5 px-3 py-1.5 text-sm font-semibold text-brand transition-colors hover:bg-brand/10 disabled:opacity-50">
              <Sparkle className="h-4 w-4" aria-hidden />
              {loading ? t(lang, "explaining") : t(lang, "explainSimply")}
            </button>
            {aiUsed && <span className="text-xs text-muted">{t(lang, "aiTag")}</span>}
          </div>

          <div className="mt-5">
            <h3 className="text-sm font-bold uppercase tracking-wide text-muted">{t(lang, "whatYoullNeed")}</h3>
            <ul className="mt-2 space-y-1.5">
              {program.documents[lang].map((doc, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-ink">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden />{doc}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <a href={program.applyUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark">
              {t(lang, "applyNow")} <ExternalLink className="h-4 w-4" aria-hidden />
            </a>
          </div>
          <a href={program.source.url} target="_blank" rel="noopener noreferrer"
            className="mt-3 inline-block text-sm font-medium text-muted underline-offset-2 hover:text-ink hover:underline">
            {t(lang, "officialSource")}: {program.source.label[lang]}
          </a>
        </div>
      )}
    </div>
  );
}
