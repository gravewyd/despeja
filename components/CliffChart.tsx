// components/CliffChart.tsx
// Visual benefits cliff chart — shows total benefit value vs income as a line chart.
// Uses HTML canvas with Chart.js loaded via CDN (works in Next.js client components).
"use client";
import { useEffect, useRef, useMemo } from "react";
import type { Household, Language } from "@/lib/types";
import { screen } from "@/lib/eligibility";
import { percentOfFpl } from "@/lib/fpl";

// Rough annual dollar value of each program for chart purposes
const PROGRAM_VALUES: Record<string, number> = {
  snap: 3600,         // ~$300/mo avg CalFresh
  medicaid: 6000,     // Medi-Cal value
  wic: 1200,          // ~$100/mo
  eitc: 4000,         // mid-range EITC
  "school-meals": 1500, // ~$3/day x 180 school days x 2 kids
  liheap: 600,        // avg one-time or annual
  lifeline: 111,      // $9.25/mo
  ssi: 14184,         // $1182/mo SSI/SSP
  calworks: 10800,    // ~$900/mo
  "covered-ca": 3600, // avg subsidy
  "care-fera": 300,   // avg annual utility discount
};

interface Props {
  household: Household;
  lang: Language;
}

export default function CliffChart({ household, lang }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { dataPoints, maxIncome } = useMemo(() => {
    const current = household.monthlyIncome;
    const max = Math.max(6000, Math.ceil((current * 2) / 500) * 500);
    const step = Math.ceil(max / 40 / 100) * 100;
    const points: { income: number; value: number; pct: number }[] = [];

    for (let inc = 0; inc <= max; inc += step) {
      const results = screen({ ...household, monthlyIncome: inc });
      const value = results
        .filter(r => r.status !== "unlikely")
        .reduce((sum, r) => sum + (PROGRAM_VALUES[r.program.id] ?? 0), 0);
      const pct = percentOfFpl(inc * 12, household.householdSize);
      points.push({ income: inc, value, pct });
    }
    return { dataPoints: points, maxIncome: max };
  }, [household]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dataPoints.length === 0) return;

    let chartInstance: unknown = null;

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js";
    script.onload = () => {
      // @ts-expect-error Chart is loaded dynamically
      const Chart = window.Chart;
      if (!Chart || !canvasRef.current) return;

      const isDark = document.documentElement.getAttribute("data-mode") === "dark";
      const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
      const textColor = isDark ? "#9ca3af" : "#6b7280";

      chartInstance = new Chart(canvasRef.current, {
        type: "line",
        data: {
          labels: dataPoints.map(d => `$${(d.income / 1000).toFixed(1)}k`),
          datasets: [
            {
              label: lang === "es" ? "Valor anual de beneficios" : "Annual benefit value",
              data: dataPoints.map(d => d.value),
              borderColor: "#2f5fb0",
              backgroundColor: "rgba(47,95,176,0.08)",
              fill: true,
              tension: 0.3,
              pointRadius: 0,
              pointHoverRadius: 5,
              pointHoverBackgroundColor: "#2f5fb0",
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                title: (items: { dataIndex: number }[]) => {
                  const d = dataPoints[items[0].dataIndex];
                  return `$${d.income.toLocaleString()}/mo · ${d.pct}% FPL`;
                },
                label: (item: { raw: number }) =>
                  `${lang === "es" ? "Beneficios" : "Benefits"}: $${Math.round(item.raw as number).toLocaleString()}${lang === "es" ? "/año" : "/yr"}`,
              },
            },
          },
          scales: {
            x: {
              grid: { color: gridColor },
              ticks: {
                color: textColor,
                maxTicksLimit: 8,
                font: { size: 11 },
              },
            },
            y: {
              grid: { color: gridColor },
              ticks: {
                color: textColor,
                font: { size: 11 },
                callback: (v: number) => `$${(v / 1000).toFixed(0)}k`,
              },
            },
          },
        },
      });
    };
    document.head.appendChild(script);

    return () => {
      // @ts-expect-error destroy exists on Chart instances
      if (chartInstance?.destroy) chartInstance.destroy();
    };
  }, [dataPoints, lang]);

  const currentValue = useMemo(() => {
    const results = screen(household);
    return results
      .filter(r => r.status !== "unlikely")
      .reduce((sum, r) => sum + (PROGRAM_VALUES[r.program.id] ?? 0), 0);
  }, [household]);

  return (
    <div className="mt-6 rounded-xl2 border border-line bg-surface p-5">
      <h3 className="font-display text-lg font-bold text-ink">
        {lang === "es" ? "El precipicio de beneficios" : "The benefits cliff"}
      </h3>
      <p className="mt-1 text-sm text-muted">
        {lang === "es"
          ? "Este gráfico muestra cómo el valor total de los beneficios cae cuando aumentan los ingresos. El punto más alto es a menudo más valioso que un aumento de sueldo."
          : "This chart shows how total benefit value drops as income rises. The cliff is often worth more than a pay raise."}
      </p>

      <div className="mt-3 mb-4 inline-flex items-baseline gap-1.5 rounded-lg border border-brand/20 bg-brand-light/40 px-3 py-2">
        <span className="text-sm text-muted">{lang === "es" ? "Tu valor estimado actual:" : "Your estimated current value:"}</span>
        <span className="font-mono text-lg font-bold text-brand">${currentValue.toLocaleString()}</span>
        <span className="text-sm text-muted">{lang === "es" ? "/año" : "/yr"}</span>
      </div>

      <div style={{ height: 220, position: "relative" }}>
        <canvas ref={canvasRef} />
      </div>

      <p className="mt-3 text-xs text-muted">
        {lang === "es"
          ? "Estimaciones aproximadas de valor anual por programa. Confirma con fuentes oficiales."
          : "Rough annual value estimates per program. Confirm with official sources."}
      </p>
    </div>
  );
}
