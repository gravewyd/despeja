// lib/eligibility.ts
// The screening engine. Pure + deterministic, so it's easy to reason about
// and easy to test. Give it a Household, get back one result per program,
// sorted so the most promising matches come first.

import type { Household, EligibilityResult } from "./types";
import { PROGRAMS } from "./programs";
import { percentOfFpl } from "./fpl";

const STATUS_ORDER = { likely: 0, maybe: 1, unlikely: 2 } as const;

export function screen(h: Household): EligibilityResult[] {
  const annualIncome = Math.max(0, h.monthlyIncome) * 12;
  const ctx = {
    annualIncome,
    percentOfFpl: percentOfFpl(annualIncome, h.householdSize),
  };

  const results: EligibilityResult[] = PROGRAMS.map((program) => {
    const out = program.evaluate(h, ctx);
    return {
      program,
      status: out.status,
      reason: out.reason,
      estimate: out.estimate,
    };
  });

  // Most promising first; keep program order stable within a status group.
  return results.sort(
    (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status],
  );
}

/** Convenience: count how many programs the household likely/maybe qualifies for. */
export function countMatches(results: EligibilityResult[]): number {
  return results.filter((r) => r.status !== "unlikely").length;
}
