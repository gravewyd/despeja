// lib/i18n.ts
import type { Language } from "./types";

export const STRINGS = {
  // common
  back: { en: "Back", es: "Atrás" },
  next: { en: "Next", es: "Siguiente" },
  yes: { en: "Yes", es: "Sí" },
  no: { en: "No", es: "No" },
  step: { en: "Step", es: "Paso" },
  of: { en: "of", es: "de" },

  // landing
  appTagline: {
    en: "See what government help you may qualify for — in plain language, in your language.",
    es: "Descubre a qué ayuda del gobierno podrías calificar — en lenguaje claro, en tu idioma.",
  },
  intro: {
    en: "Answer a few quick questions and we'll show the programs you may qualify for, why, and how to apply. No account. Nothing is saved.",
    es: "Responde unas preguntas rápidas y te mostraremos los programas para los que podrías calificar, por qué y cómo solicitar. Sin cuenta. Nada se guarda.",
  },
  start: { en: "Get started", es: "Comenzar" },
  privacyChip: {
    en: "No account · nothing stored on a server",
    es: "Sin cuenta · nada se guarda en un servidor",
  },

  // screening
  selectState: { en: "Select your state", es: "Selecciona tu estado" },
  seeResults: { en: "See results", es: "Ver resultados" },

  // results
  resultsLead: {
    en: "Programs you may qualify for. Tap one for the details and how to apply.",
    es: "Programas para los que podrías calificar. Toca uno para ver detalles y cómo solicitar.",
  },
  matchCount: { en: "You may qualify for {n}", es: "Podrías calificar para {n}" },
  matchNone: {
    en: "No likely match from these answers — but rules vary, so it's worth checking the official sources below.",
    es: "Ninguna coincidencia probable — pero las reglas varían, así que vale la pena revisar las fuentes oficiales.",
  },
  statusLikely: { en: "Likely", es: "Probable" },
  statusMaybe: { en: "Maybe", es: "Posible" },
  statusUnlikely: { en: "Probably not", es: "Probablemente no" },
  estimateLabel: { en: "Estimated value", es: "Valor estimado" },
  whatYoullNeed: { en: "What you'll need", es: "Lo que necesitarás" },
  officialSource: { en: "Official source", es: "Fuente oficial" },
  applyNow: { en: "Apply or learn more", es: "Solicitar o más información" },
  explainSimply: { en: "Explain this simply", es: "Explícamelo de forma simple" },
  explaining: { en: "Writing…", es: "Escribiendo…" },
  aiTag: { en: "From the official source", es: "Desde la fuente oficial" },
  startOver: { en: "Start over", es: "Empezar de nuevo" },

  // income-change preview (the small extra feature)
  cliffTitle: { en: "What if my income changes?", es: "¿Y si cambian mis ingresos?" },
  cliffLead: {
    en: "Most checkers stop here. Drag the slider to see how a raise or fewer hours would change what you qualify for.",
    es: "La mayoría de los verificadores se detienen aquí. Mueve el control para ver cómo un aumento o menos horas cambiarían a qué calificas.",
  },
  monthlyIncome: { en: "Monthly income", es: "Ingreso mensual" },
  youdKeep: { en: "You'd likely keep", es: "Probablemente mantendrías" },
  youdLose: { en: "You may lose", es: "Podrías perder" },
  cliffNote: {
    en: "Estimates only — a small raise rarely leaves you worse off overall, and a caseworker can run your exact numbers.",
    es: "Solo estimaciones — un aumento pequeño rara vez te deja peor en general, y un trabajador social puede calcular tus números exactos.",
  },

  // disclaimer / footer
  disclaimer: {
    en: "Despeja gives plain-language estimates, not official or legal decisions. Always confirm with the official source before relying on a result.",
    es: "Despeja ofrece estimaciones en lenguaje claro, no decisiones oficiales ni legales. Confirma siempre con la fuente oficial antes de confiar en un resultado.",
  },
  footer: {
    en: "A student project for the Congressional App Challenge. Not affiliated with any government agency. No personal information is stored on a server.",
    es: "Un proyecto estudiantil para el Congressional App Challenge. No afiliado a ninguna agencia gubernamental. No se almacena información personal en un servidor.",
  },
} as const;

export type StringKey = keyof typeof STRINGS;

export function t(lang: Language, key: StringKey): string {
  return STRINGS[key][lang];
}

/** t() with {n}-style placeholder replacement. */
export function tf(lang: Language, key: StringKey, vars: Record<string, string | number>): string {
  let s: string = STRINGS[key][lang];
  for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
  return s;
}
