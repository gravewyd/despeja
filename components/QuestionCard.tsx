// components/QuestionCard.tsx
"use client";
import type { Language } from "@/lib/types";
import { t } from "@/lib/i18n";
import { US_STATES } from "@/lib/states";
import type { Question } from "./questionData";

type Value = string | number | boolean;

export default function QuestionCard({
  question, value, onChange, lang,
}: { question: Question; value: Value; onChange: (v: Value) => void; lang: Language }) {
  return (
    <div className="animate-fade-up">
      <h2 className="text-2xl text-ink sm:text-3xl">{question.label[lang]}</h2>
      {question.help && <p className="mt-3 text-muted">{question.help[lang]}</p>}

      <div className="mt-8">
        {question.type === "select" && (
          <select
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            aria-label={question.label[lang]}
            className="w-full rounded-xl border border-line bg-surface px-4 py-3.5 text-lg text-ink focus:border-brand"
          >
            <option value="" disabled>{t(lang, "selectState")}</option>
            {US_STATES.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
          </select>
        )}

        {question.type === "count" && (
          <Stepper value={value as number} min={question.min ?? 0} onChange={(n) => onChange(n)} label={question.label[lang]} />
        )}

        {question.type === "currency" && (
          <div className="flex items-center rounded-xl border border-line bg-surface px-4 py-3.5 focus-within:border-brand">
            <span className="mr-1 text-xl text-muted">$</span>
            <input
              type="number" inputMode="numeric" min={question.min ?? 0}
              value={Number.isFinite(value as number) && (value as number) !== 0 ? (value as number) : ""}
              placeholder="0"
              onChange={(e) => onChange(e.target.value === "" ? 0 : Math.max(0, Number(e.target.value)))}
              aria-label={question.label[lang]}
              className="w-full bg-transparent text-xl text-ink outline-none"
            />
            <span className="ml-2 whitespace-nowrap text-muted">/ {lang === "es" ? "mes" : "month"}</span>
          </div>
        )}

        {question.type === "boolean" && (
          <div className="grid grid-cols-2 gap-3">
            {[true, false].map((b) => {
              const active = value === b;
              return (
                <button
                  key={String(b)} type="button" aria-pressed={active} onClick={() => onChange(b)}
                  className={`rounded-xl border px-4 py-5 text-lg font-semibold transition-colors ${active ? "border-brand bg-brand text-white" : "border-line bg-surface text-ink hover:border-brand/40"}`}
                >
                  {b ? t(lang, "yes") : t(lang, "no")}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Stepper({ value, min, onChange, label }: { value: number; min: number; onChange: (n: number) => void; label: string }) {
  return (
    <div className="flex items-center justify-center gap-6">
      <button
        type="button" aria-label="decrease" disabled={value <= min}
        onClick={() => onChange(Math.max(min, (value || 0) - 1))}
        className="flex h-14 w-14 items-center justify-center rounded-full border border-line bg-surface text-2xl text-ink transition-colors hover:border-brand disabled:opacity-40"
      >−</button>
      <input
        type="number" value={value} min={min} aria-label={label}
        onChange={(e) => onChange(Math.max(min, Number(e.target.value) || min))}
        className="w-24 rounded-xl border border-line bg-surface py-3 text-center text-3xl font-semibold text-ink outline-none focus:border-brand"
      />
      <button
        type="button" aria-label="increase" onClick={() => onChange((value || 0) + 1)}
        className="flex h-14 w-14 items-center justify-center rounded-full border border-line bg-surface text-2xl text-ink transition-colors hover:border-brand"
      >+</button>
    </div>
  );
}
