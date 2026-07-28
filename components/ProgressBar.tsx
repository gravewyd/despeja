// components/ProgressBar.tsx
"use client";
import type { Language } from "@/lib/types";
import { t } from "@/lib/i18n";

export default function ProgressBar({ current, total, lang }: { current: number; total: number; lang: Language }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center justify-between text-sm font-medium text-muted">
        <span>{t(lang, "step")} {current} {t(lang, "of")} {total}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-brand transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
