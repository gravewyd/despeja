// components/LifeChangePrompt.tsx
// "My situation changed" — lets users quickly re-run the screener when life changes.
"use client";
import { useState } from "react";
import type { Language } from "@/lib/types";

const LIFE_EVENTS = [
  { id: "baby", en: "Had a baby or expecting", es: "Tuve un bebé o estoy esperando" },
  { id: "job-loss", en: "Lost my job", es: "Perdí mi trabajo" },
  { id: "pay-cut", en: "Income went down", es: "Mis ingresos bajaron" },
  { id: "raise", en: "Got a raise or new job", es: "Recibí un aumento o nuevo trabajo" },
  { id: "moved", en: "Moved to a new address", es: "Me mudé a una nueva dirección" },
  { id: "child-school", en: "Child started school", es: "Mi hijo(a) empezó la escuela" },
  { id: "turned-65", en: "Someone turned 65", es: "Alguien cumplió 65 años" },
  { id: "household", en: "Household size changed", es: "Cambió el tamaño de mi hogar" },
  { id: "family death", en: "A family member passed away or has illness", es: "Un familiar ha fallecido o está enfermo." },
];

interface Props {
  lang: Language;
  onRestart: () => void;
}

export default function LifeChangePrompt({ lang, onRestart }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-6 rounded-xl2 border border-line bg-surface p-5">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <p className="font-semibold text-ink">
            {lang === "es" ? "¿Cambió tu situación?" : "Did your situation change?"}
          </p>
          <p className="mt-0.5 text-sm text-muted">
            {lang === "es"
              ? "Vuelve a verificar cuando algo importante cambie en tu vida."
              : "Re-check your eligibility when something important changes."}
          </p>
        </div>
        <svg
          width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="mt-4 animate-fade-in">
          <p className="mb-3 text-sm text-muted">
            {lang === "es"
              ? "Elige lo que cambió para volver a empezar con eso en mente:"
              : "Pick what changed and we'll take you back to update your answers:"}
          </p>
          <div className="flex flex-wrap gap-2">
            {LIFE_EVENTS.map(e => (
              <button
                key={e.id}
                type="button"
                onClick={onRestart}
                className="rounded-full border border-brand/25 bg-brand-light/60 px-3 py-1.5 text-sm font-medium text-brand transition-colors hover:bg-brand/10"
              >
                {lang === "es" ? e.es : e.en}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onRestart}
            className="mt-4 text-sm font-semibold text-brand underline-offset-2 hover:underline"
          >
            {lang === "es" ? "Empezar de nuevo desde el principio →" : "Start fresh from the beginning →"}
          </button>
        </div>
      )}
    </div>
  );
}
