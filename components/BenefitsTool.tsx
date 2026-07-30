// components/BenefitsTool.tsx
"use client";
import { useState } from "react";
import type { Household, Language } from "@/lib/types";
import { t } from "@/lib/i18n";
import { PROGRAMS } from "@/lib/programs";
import Screening from "./Screening";
import Results from "./Results";
import { ArrowRight, Shield } from "./icons";

export default function BenefitsTool({ lang }: { lang: Language }) {
  const [phase, setPhase] = useState<"intro" | "screening" | "results">("intro");
  const [household, setHousehold] = useState<Household | null>(null);

  if (phase === "screening") {
    return <Screening lang={lang} onComplete={(h) => { setHousehold(h); setPhase("results"); }} />;
  }
  if (phase === "results" && household) {
    return <Results household={household} lang={lang} onStartOver={() => { setHousehold(null); setPhase("intro"); }} />;
  }

  return (
    <section className="mx-auto max-w-2xl animate-fade-up">

      {/* ── Hero stat ── */}
      <div className="mb-6 text-center">
        <p className="font-display text-5xl font-bold text-brand sm:text-6xl">$60B+</p>
        <p className="mt-1 text-sm text-muted">
          {lang === "es"
            ? "en beneficios del gobierno no se reclaman cada año"
            : "in government benefits go unclaimed every year"}
        </p>
        <div className="mx-auto my-5 h-0.5 w-8 rounded-full bg-brand opacity-20" />
      </div>

      {/* ── Headline + CTA ── */}
      <div className="text-center">
        <h1 className="mx-auto max-w-xl text-3xl text-ink sm:text-[2.6rem] sm:leading-[1.12]">
          {t(lang, "appTagline")}
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-lg text-muted">{t(lang, "intro")}</p>

        <button
          type="button"
          onClick={() => setPhase("screening")}
          className="group mt-8 inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-lg font-semibold text-white shadow-lift transition-transform hover:-translate-y-0.5 hover:bg-brand-dark"
        >
          {t(lang, "start")}
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </button>

        <div className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-sm text-muted">
          <Shield className="h-4 w-4 text-low" aria-hidden />
          {t(lang, "privacyChip")}
        </div>
      </div>

      {/* ── Quick stats row ── */}
      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { num: String(PROGRAMS.length), label: lang === "es" ? "programas revisados" : "programs checked" },
          { num: "2 min", label: lang === "es" ? "tiempo promedio" : "average time" },
          { num: "EN/ES", label: lang === "es" ? "totalmente bilingüe" : "fully bilingual" },
          { num: "$0", label: lang === "es" ? "costo, para siempre" : "cost, forever" },
        ].map((s) => (
          <div key={s.num} className="rounded-xl border border-line bg-surface p-3 text-center">
            <p className="font-display text-xl font-bold text-ink">{s.num}</p>
            <p className="mt-0.5 text-xs text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Program pills ── */}
      <div className="mt-8 text-center">
        <p className="mb-3 text-xs uppercase tracking-widest text-muted">
          {lang === "es" ? "Programas que revisamos" : "Programs we check"}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {PROGRAMS.map((p) => (
            <span key={p.id} className="rounded-full border border-line bg-surface px-3 py-1 text-sm text-muted">
              {p.name[lang]}
            </span>
          ))}
        </div>
      </div>

    </section>
  );
}
