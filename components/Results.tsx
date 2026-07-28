// components/Results.tsx
"use client";
import type { Household, Language } from "@/lib/types";
import { t, tf } from "@/lib/i18n";
import { screen, countMatches } from "@/lib/eligibility";
import { percentOfFpl } from "@/lib/fpl";
import ProgramCard from "./ProgramCard";
import IncomePreview from "./IncomePreview";
import { Info } from "./icons";

export default function Results({
  household, lang, onStartOver,
}: {
  household: Household; lang: Language; onStartOver: () => void;
}) {
  const results = screen(household);
  const matches = countMatches(results);
  const facts = {
    householdSize: household.householdSize,
    percentOfFpl: percentOfFpl(household.monthlyIncome * 12, household.householdSize),
    numChildrenUnder18: household.numChildrenUnder18,
  };
  const programWord = (n: number) =>
    lang === "es" ? `${n} programa${n === 1 ? "" : "s"}` : `${n} program${n === 1 ? "" : "s"}`;
  const summary = matches > 0 ? tf(lang, "matchCount", { n: programWord(matches) }) : t(lang, "matchNone");

  return (
    <section className="mx-auto max-w-2xl">
      <div className="animate-fade-up">
        <h2 className="text-3xl text-ink sm:text-4xl">{summary}</h2>
        <p className="mt-3 text-muted">{t(lang, "resultsLead")}</p>
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-xl border border-accent/30 bg-accent-soft/50 px-4 py-3">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden />
        <p className="text-sm text-ink">{t(lang, "disclaimer")}</p>
      </div>

      <div className="stagger mt-6 space-y-3">
        {results.map((r, i) => (
          <ProgramCard
            key={r.program.id} result={r} facts={facts} lang={lang}
            defaultOpen={i === 0 && r.status !== "unlikely"}
          />
        ))}
      </div>

      {/* The small extra feature: see how income changes affect eligibility. */}
      <IncomePreview lang={lang} household={household} />

      <div className="mt-8 flex justify-center">
        <button type="button" onClick={onStartOver}
          className="rounded-full px-5 py-2 font-semibold text-muted transition-colors hover:text-ink">
          {t(lang, "startOver")}
        </button>
      </div>
    </section>
  );
}
