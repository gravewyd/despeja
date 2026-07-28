// app/page.tsx
"use client";
import { useState } from "react";
import type { Language } from "@/lib/types";
import { t } from "@/lib/i18n";
import { APP_NAME, APP_MEANING } from "@/lib/brand";
import { Logo } from "@/components/icons";
import LanguageToggle from "@/components/LanguageToggle";
import BenefitsTool from "@/components/BenefitsTool";
import InstallPrompt from "@/components/InstallPrompt";

export default function Page() {
  const [lang, setLang] = useState<Language>("en");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-paper/85 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Logo className="h-7 w-7 text-brand" aria-hidden />
            <span className="font-display text-xl font-bold tracking-tight text-ink">{APP_NAME}</span>
          </div>
          <LanguageToggle lang={lang} onChange={setLang} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:py-16">
        <BenefitsTool lang={lang} />
      </main>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto max-w-4xl px-4 py-8 text-sm text-muted">
          <p className="max-w-2xl">{t(lang, "disclaimer")}</p>
          <p className="mt-3 max-w-2xl">{t(lang, "footer")}</p>
          <p className="mt-3 italic">{APP_MEANING[lang]}</p>
        </div>
      </footer>

      {/* PWA install banner — shows automatically when browser supports it */}
      <InstallPrompt lang={lang} />
    </div>
  );
}
