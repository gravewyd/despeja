// components/Screening.tsx
"use client";
import { useState } from "react";
import type { Household, Language } from "@/lib/types";
import { t } from "@/lib/i18n";
import { QUESTIONS } from "./questionData";
import QuestionCard from "./QuestionCard";
import ProgressBar from "./ProgressBar";
import { ArrowRight, Shield } from "./icons";

const DEFAULTS: Household = {
  state: "", householdSize: 1, monthlyIncome: 0, numChildrenUnder18: 0,
  pregnantOrChildUnder5: false, childrenInK12: false, someoneOver60: false,
};

// Shown right next to the specific question it explains — reassurance works
// best exactly where the hesitation happens, not just once in the hero.
const TRUST_NOTES: Partial<Record<keyof Household, Record<Language, string>>> = {
  state: {
    en: "We ask because program names and income limits differ by state. This never leaves your device.",
    es: "Preguntamos porque los nombres y límites de ingreso varían por estado. Esto nunca sale de su dispositivo.",
  },
  monthlyIncome: {
    en: "Used only to estimate eligibility, calculated right here in your browser — never saved, never sent anywhere.",
    es: "Se usa solo para estimar elegibilidad, calculado aquí en su navegador — nunca se guarda ni se envía.",
  },
  householdSize: {
    en: "Program income limits depend on household size — that's the only reason we ask.",
    es: "Los límites de ingreso de los programas dependen del tamaño del hogar — por eso lo preguntamos.",
  },
};

export default function Screening({ lang, onComplete }: { lang: Language; onComplete: (h: Household) => void }) {
  const [draft, setDraft] = useState<Household>(DEFAULTS);
  const [index, setIndex] = useState(0);
  const question = QUESTIONS[index];
  const isLast = index === QUESTIONS.length - 1;
  const canAdvance = question.key === "state" ? draft.state !== "" : true;
  const trustNote = TRUST_NOTES[question.key];

  return (
    <section className="mx-auto max-w-xl">
      <ProgressBar current={index + 1} total={QUESTIONS.length} lang={lang} />
      <div key={index} className="min-h-[210px] animate-fade-up">
        <QuestionCard
          question={question}
          value={draft[question.key]}
          onChange={(v) => setDraft((d) => ({ ...d, [question.key]: v }))}
          lang={lang}
        />
        {trustNote && (
          <p className="mt-4 flex items-start gap-2 text-sm text-muted">
            <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand" aria-hidden />
            <span>{trustNote[lang]}</span>
          </p>
        )}
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
