// components/PrintResults.tsx
"use client";
import type { EligibilityResult, Household, Language } from "@/lib/types";
import { t } from "@/lib/i18n";
import { percentOfFpl } from "@/lib/fpl";

interface Props {
  results: EligibilityResult[];
  household: Household;
  lang: Language;
}

export default function PrintResults({ results, household, lang }: Props) {
  const likely = results.filter(r => r.status === "likely");
  const maybe = results.filter(r => r.status === "maybe");
  const pct = percentOfFpl(household.monthlyIncome * 12, household.householdSize);

  function handlePrint() {
    const date = new Date().toLocaleDateString(lang === "es" ? "es-US" : "en-US", {
      year: "numeric", month: "long", day: "numeric"
    });

    const programRow = (r: EligibilityResult) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e3e8ef;font-weight:600">${r.program.name[lang]}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e3e8ef;color:#5c6573">${r.program.tagline[lang]}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e3e8ef;white-space:nowrap">
          ${r.program.documents[lang].slice(0, 2).join(", ")}
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #e3e8ef">
          <a href="${r.program.applyUrl}" style="color:#2f5fb0">${lang === "es" ? "Solicitar" : "Apply"}</a>
        </td>
      </tr>`;

    const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <title>Despeja — ${lang === "es" ? "Resultados" : "Results"}</title>
  <style>
    body { font-family: 'Public Sans', Arial, sans-serif; color: #1b1f27; padding: 32px; max-width: 800px; margin: 0 auto; font-size: 14px; }
    h1 { color: #2f5fb0; margin-bottom: 4px; font-size: 24px; }
    .meta { color: #5c6573; margin-bottom: 24px; font-size: 13px; }
    h2 { font-size: 16px; margin: 24px 0 8px; color: #1b1f27; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th { background: #f4f6f9; padding: 8px 12px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: .05em; color: #5c6573; }
    .disclaimer { background: #f7edda; border-left: 4px solid #c07d1e; padding: 12px 16px; border-radius: 4px; font-size: 12px; color: #5c6573; margin-top: 24px; }
    .next-steps { background: #eaf1fb; border-left: 4px solid #2f5fb0; padding: 12px 16px; border-radius: 4px; margin-top: 16px; }
    .next-steps h3 { margin: 0 0 8px; font-size: 14px; color: #2f5fb0; }
    .next-steps p { margin: 4px 0; font-size: 13px; }
    @media print { body { padding: 16px; } }
  </style>
</head>
<body>
  <h1>Despeja</h1>
  <p class="meta">
    ${lang === "es" ? "Resultados del" : "Results from"} ${date} &nbsp;·&nbsp;
    ${lang === "es" ? "Hogar de" : "Household of"} ${household.householdSize} &nbsp;·&nbsp;
    ${lang === "es" ? "Ingreso" : "Income"} ~${pct}% ${lang === "es" ? "del nivel de pobreza" : "of poverty line"}
  </p>

  ${likely.length > 0 ? `
  <h2>✅ ${lang === "es" ? "Probablemente califica para" : "Likely qualifies for"} (${likely.length})</h2>
  <table>
    <thead><tr>
      <th>${lang === "es" ? "Programa" : "Program"}</th>
      <th>${lang === "es" ? "Beneficio" : "Benefit"}</th>
      <th>${lang === "es" ? "Documentos clave" : "Key Documents"}</th>
      <th>${lang === "es" ? "Enlace" : "Link"}</th>
    </tr></thead>
    <tbody>${likely.map(programRow).join("")}</tbody>
  </table>` : ""}

  ${maybe.length > 0 ? `
  <h2>🔶 ${lang === "es" ? "Posiblemente califica para" : "May qualify for"} (${maybe.length})</h2>
  <table>
    <thead><tr>
      <th>${lang === "es" ? "Programa" : "Program"}</th>
      <th>${lang === "es" ? "Beneficio" : "Benefit"}</th>
      <th>${lang === "es" ? "Documentos clave" : "Key Documents"}</th>
      <th>${lang === "es" ? "Enlace" : "Link"}</th>
    </tr></thead>
    <tbody>${maybe.map(programRow).join("")}</tbody>
  </table>` : ""}

  <div class="next-steps">
    <h3>${lang === "es" ? "Próximos pasos" : "Next Steps"}</h3>
    <p>1. ${lang === "es" ? "Reúna sus documentos antes de ir a solicitar." : "Gather your documents before you go to apply."}</p>
    <p>2. ${lang === "es" ? "Solicite por internet en BenefitsCal.com o llame al 1-877-847-3663." : "Apply online at BenefitsCal.com or call 1-877-847-3663."}</p>
    <p>3. ${lang === "es" ? "Vuelva a verificar si su situación cambia (nuevo bebé, cambio de trabajo, etc.)." : "Re-check if your situation changes (new baby, job change, etc.)."}</p>
  </div>

  <div class="disclaimer">
    ${lang === "es"
      ? "Despeja ofrece estimaciones en lenguaje claro, no decisiones oficiales. Confirme siempre con la fuente oficial. No afiliado a ninguna agencia gubernamental."
      : "Despeja gives plain-language estimates, not official decisions. Always confirm with the official source. Not affiliated with any government agency."}
  </div>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  }

  return (
    <button
      type="button"
      onClick={handlePrint}
      className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold text-muted shadow-sm transition-colors hover:border-brand/30 hover:text-brand"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" />
      </svg>
      {lang === "es" ? "Guardar / Imprimir resultados" : "Save / Print results"}
    </button>
  );
}
