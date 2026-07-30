// app/about/page.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import type { Language } from "@/lib/types";
import { t } from "@/lib/i18n";
import { APP_NAME, APP_MEANING } from "@/lib/brand";
import { Logo, Home, ArrowRight } from "@/components/icons";
import LanguageToggle from "@/components/LanguageToggle";

export default function AboutPage() {
  const [lang, setLang] = useState<Language>("en");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-paper/85 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-7 w-7 text-brand" aria-hidden />
            <span className="font-display text-xl font-bold tracking-tight text-ink">
              {APP_NAME}
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="hidden items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink sm:flex"
            >
              <Home className="h-4 w-4" aria-hidden />
              {lang === "es" ? "Volver a la app" : "Back to the app"}
            </Link>
            <LanguageToggle lang={lang} onChange={setLang} />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:py-16">
        {/* Hero */}
        <section className="animate-fade-up text-center">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-muted">
            {lang === "es"
              ? "Congressional App Challenge · Distrito 19 de California"
              : "Congressional App Challenge · California's 19th District"}
          </p>
          <h1 className="mx-auto mt-3 max-w-xl font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
            {lang === "es" ? "Por qué construimos Despeja" : "Why we built Despeja"}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-muted">
            {lang === "es"
              ? "Un proyecto estudiantil de Armez Bhatti y Siddhant Kaushik."
              : "A student project by Armez Bhatti and Siddhant Kaushik."}
          </p>
        </section>

        {/* Stat callout */}
        <section className="mt-12 animate-fade-up rounded-xl2 border border-line bg-surface p-8 text-center shadow-card">
          <p className="font-display text-5xl font-bold text-brand sm:text-6xl">$60B+</p>
          <p className="mt-2 text-sm text-muted">
            {lang === "es"
              ? "en beneficios del gobierno no se reclaman cada año"
              : "in government benefits go unclaimed every year"}
          </p>
        </section>

        {/* The idea */}
        <section className="mt-14 animate-fade-up">
          <h2 className="font-display text-2xl font-bold text-ink">
            {lang === "es" ? "La idea" : "The idea"}
          </h2>
          <div className="mt-4 space-y-4 leading-relaxed text-ink/90">
            <p>
              {lang === "es" ? (
                <>
                  Despeja nació a partir de <strong>Tessera</strong>, una organización sin
                  fines de lucro que ayuda a familias de bajos ingresos a entender los
                  sistemas del gobierno. Ver de cerca ese trabajo nos mostró el verdadero
                  problema: casi nunca es que la gente no califique para recibir ayuda. Es
                  que el proceso es confuso, y gran parte ni siquiera está disponible en su
                  idioma.
                </>
              ) : (
                <>
                  Despeja started with <strong>Tessera</strong>, a nonprofit that helps
                  low-income families navigate government systems. Looking closely at that
                  work pointed us to the real problem: it's rarely that people don't
                  qualify for help. It's that the process is confusing, and most of it
                  isn't even offered in their language.
                </>
              )}
            </p>
            <p>
              {lang === "es" ? (
                <>
                  De ahí viene el nombre: <strong>&ldquo;Despeja&rdquo;</strong> significa
                  &ldquo;aclara&rdquo; o &ldquo;pon en claro&rdquo; en español, justo lo
                  que queríamos que hiciera la app: convertir un laberinto de reglas de
                  elegibilidad en una respuesta directa.
                </>
              ) : (
                <>
                  That's where the name comes from &mdash;{" "}
                  <strong>&ldquo;Despeja&rdquo;</strong> is Spanish for &ldquo;it clears
                  things up,&rdquo; which is exactly what we wanted the app to do: turn a
                  maze of eligibility rules into a straight answer.
                </>
              )}
            </p>
            <p>
              {lang === "es" ? (
                <>
                  También queríamos mostrar algo que la mayoría de las herramientas de
                  detección ignoran: el <strong>abismo de beneficios</strong>, el punto en
                  el que un pequeño aumento de sueldo puede hacer que una familia pierda
                  más en beneficios de lo que gana en ingresos. Es un problema real que
                  desalienta el trabajo, y casi ninguna herramienta lo visualiza con
                  claridad.
                </>
              ) : (
                <>
                  We also wanted to surface something most screening tools leave out: the{" "}
                  <strong>benefits cliff</strong> &mdash; the point where a small raise can
                  cost a family more in lost benefits than it gains in income. It's a real
                  problem that discourages work, and almost nothing visualizes it clearly.
                </>
              )}
            </p>
          </div>
        </section>

        {/* Team */}
        <section className="mt-14 animate-fade-up">
          <h2 className="font-display text-2xl font-bold text-ink">
            {lang === "es" ? "El equipo" : "The team"}
          </h2>
          <p className="mt-2 text-muted">
            {lang === "es"
              ? "Construido por dos estudiantes para el Congressional App Challenge."
              : "Built by two students for the Congressional App Challenge."}
          </p>
          <div className="stagger mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl2 border border-line bg-surface p-6 shadow-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-light font-display text-lg font-bold text-brand">
                AB
              </div>
              <p className="mt-4 font-display text-lg font-bold text-ink">Armez Bhatti</p>
              <p className="mt-1 text-sm text-muted">
                {lang === "es" ? "Cocreador" : "Co-creator"}
              </p>
            </div>
            <div className="rounded-xl2 border border-line bg-surface p-6 shadow-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft font-display text-lg font-bold text-accent">
                SK
              </div>
              <p className="mt-4 font-display text-lg font-bold text-ink">
                Siddhant Kaushik
              </p>
              <p className="mt-1 text-sm text-muted">
                {lang === "es" ? "Cocreador" : "Co-creator"}
              </p>
            </div>
          </div>
        </section>

        {/* CTA back to the tool */}
        <section className="mt-14 animate-fade-up text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-semibold text-white shadow-lift transition-transform hover:scale-[1.02]"
          >
            {lang === "es" ? "Probar Despeja" : "Try Despeja"}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </section>
      </main>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto max-w-4xl px-4 py-8 text-sm text-muted">
          <p className="max-w-2xl">{t(lang, "disclaimer")}</p>
          <p className="mt-3 max-w-2xl">{t(lang, "footer")}</p>
          <p className="mt-3 italic">{APP_MEANING[lang]}</p>
        </div>
      </footer>
    </div>
  );
}
