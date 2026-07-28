// lib/fpl.ts
// Federal Poverty Level (FPL) helpers.
//
// ⚠️ UPDATE ANNUALLY. These are the HHS Poverty Guidelines for the 48
// contiguous states + DC. They change every January. Alaska and Hawaii use
// HIGHER numbers — a real production version should branch on `state`.
//
// Verify the current figures here before you submit:
//   https://aspe.hhs.gov/topics/poverty-economic-mobility/poverty-guidelines
//
// The values below are approximate and provided so the app runs out of the
// box. Confirm and correct them — accuracy is the whole point of Despeja.

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
