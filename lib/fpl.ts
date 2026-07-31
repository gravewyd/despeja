// lib/fpl.ts
// Federal Poverty Level (FPL) helpers

/** Base figure for a 1-person household (annual, USD). */
const FPL_BASE = 15650;
/** Added for each additional household member (annual, USD). */
const FPL_PER_PERSON = 5500;

/** Annual poverty line for a household of the given size. */
export function fplForHousehold(size: number): number {
  const n = Math.max(1, Math.floor(size));
  return FPL_BASE + (n - 1) * FPL_PER_PERSON;
}

/**
 * Income as a percentage of the poverty line.
 * Example: a family of 3 earning $30,000 with an FPL of $26,650 -> ~113%.
 */
export function percentOfFpl(annualIncome: number, size: number): number {
  const line = fplForHousehold(size);
  if (line <= 0) return 0;
  return Math.round((annualIncome / line) * 100);
}
