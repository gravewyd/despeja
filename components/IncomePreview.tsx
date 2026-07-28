// components/IncomePreview.tsx
"use client";
import { useMemo, useState } from "react";
import type { Household, Language } from "@/lib/types";
import { t } from "@/lib/i18n";
import { screen } from "@/lib/eligibility";
import { percentOfFpl } from "@/lib/fpl";
import { Check, Alert, Info } from "./icons";

/**
 * The one thing a plain benefits screener doesn't do: show what happens to your
 * benefits when your income changes (the "benefits cliff"). Reuses the same
 * screen() engine — we just re-run it as the slider moves.
 */
export default function IncomePreview({ lang, household }: { lang: Language; household: Household }) {
  const current = Math.max(0, household.monthlyIncome);
  const max = Math.max(8000, Math.ceil((current * 1.8) / 500) * 500);
  const [income, setIncome] = useState(current || 2000);

  const { keep, lose, pct } = useMemo(() => {
    const results = screen({ ...household, monthlyIncome: income });
    return {
      keep: results.filter((r) => r.status !== "unlikely").map((r) => r.program.name[lang]),
      lose: results.filter((r) => r.status === "unlikely").map((r) => r.program.name[lang]),
      pct: percentOfFpl(income * 12, household.householdSize),
    };
  }, [income, household, lang]);

  return (
    <div className="mt-8 rounded-xl2 border border-brand/25 bg-brand-light/50 p-5 sm:p-6">
      <h3 className="font-display text-xl font-bold text-ink">{t(lang, "cliffTitle")}</h3>
      <p className="mt-1.5 text-sm text-muted">{t(lang, "cliffLead")}</p>

      <div className="mt-5 rounded-xl border border-line bg-surface p-4">
        <div className="flex items-baseline justify-between">
          <span className="font-semibold text-ink">{t(lang, "monthlyIncome")}</span>
          <span className="font-mono text-lg text-brand">
            ${income.toLocaleString()}<span className="text-sm text-muted">/{lang === "es" ? "mes" : "mo"}</span>
          </span>
        </div>
        <input
          type="range" min={0} max={max} step={100} value={income}
          onChange={(e) => setIncome(Number(e.target.value))}
          aria-label={t(lang, "monthlyIncome")}
          className="mt-3 w-full accent-brand"
        />
        <p className="mt-2 text-sm text-muted">≈ {pct}% {lang === "es" ? "del nivel de pobreza" : "of the poverty line"}</p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-low/25 bg-low/5 p-4">
          <div className="flex items-center gap-2 font-semibold text-low"><Check className="h-5 w-5" aria-hidden />{t(lang, "youdKeep")}</div>
          <ul className="mt-2 space-y-1 text-sm text-ink">
            {keep.length ? keep.map((n, i) => <li key={i}>{n}</li>) : <li className="text-muted">—</li>}
          </ul>
        </div>
        <div className="rounded-xl border border-high/25 bg-high/5 p-4">
          <div className="flex items-center gap-2 font-semibold text-high"><Alert className="h-5 w-5" aria-hidden />{t(lang, "youdLose")}</div>
          <ul className="mt-2 space-y-1 text-sm text-ink">
            {lose.length ? lose.map((n, i) => <li key={i}>{n}</li>) : <li className="text-muted">—</li>}
          </ul>
        </div>
      </div>

      <p className="mt-4 flex items-start gap-2 text-xs text-muted">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{t(lang, "cliffNote")}
      </p>
    </div>
  );
}
