// components/Screening.tsx
"use client";
import { useState } from "react";
import type { Household, Language } from "@/lib/types";
import { t } from "@/lib/i18n";
import { QUESTIONS } from "./questionData";
import QuestionCard from "./QuestionCard";
import ProgressBar from "./ProgressBar";
import { ArrowRight } from "./icons";

const DEFAULTS: Household = {
  state: "", householdSize: 1, monthlyIncome: 0, numChildrenUnder18: 0,
  pregnantOrChildUnder5: false, childrenInK12: false, someoneOver60: false,
};

export default function Screening({ lang, onComplete }: { lang: Language; onComplete: (h: Household) => void }) {
  const [draft, setDraft] = useState<Household>(DEFAULTS);
  const [index, setIndex] = useState(0);
  const question = QUESTIONS[index];
  const isLast = index === QUESTIONS.length - 1;
  const canAdvance = question.key === "state" ? draft.state !== "" : true;

  return (
    <section className="mx-auto max-w-xl">
      <ProgressBar current={index + 1} total={QUESTIONS.length} lang={lang} />
      <div key={index} className="min-h-[210px]">
        <QuestionCard
          question={question}
          value={draft[question.key]}
          onChange={(v) => setDraft((d) => ({ ...d, [question.key]: v }))}
          lang={lang}
        />
      </div>
      <div className="mt-10 flex items-center justify-between">
        <button
          type="button" disabled={index === 0} onClick={() => setIndex((i) => Math.max(0, i - 1))}
          className="rounded-full px-5 py-3 font-semibold text-muted transition-colors hover:text-ink disabled:invisible"
        >{t(lang, "back")}</button>
        <button
          type="button" disabled={!canAdvance}
          onClick={() => (isLast ? onComplete(draft) : setIndex((i) => i + 1))}
          className="group inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isLast ? t(lang, "seeResults") : t(lang, "next")}
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </button>
      </div>
    </section>
  );
}
