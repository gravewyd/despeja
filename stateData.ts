// lib/stateData.ts
// Verified, state-level facts that actually change eligibility for a few
// programs. Kept separate from programs.ts so it's easy to find and update.
//
// Sources (check these before your presentation, and update if they've
// changed by the time you submit):
//   - Medicaid expansion status: KFF / healthinsurance.org, current as of 2026.
//   - Universal free school meals: FRAC / state education department sites.
//
// Works whether your state picker stores the full name ("California") or
// the two-letter code ("CA") — normalizeState() handles both.

const STATE_NAME_TO_ABBR: Record<string, string> = {
  alabama: "AL", alaska: "AK", arizona: "AZ", arkansas: "AR", california: "CA",
  colorado: "CO", connecticut: "CT", delaware: "DE", "district of columbia": "DC",
  florida: "FL", georgia: "GA", hawaii: "HI", idaho: "ID", illinois: "IL",
  indiana: "IN", iowa: "IA", kansas: "KS", kentucky: "KY", louisiana: "LA",
  maine: "ME", maryland: "MD", massachusetts: "MA", michigan: "MI",
  minnesota: "MN", mississippi: "MS", missouri: "MO", montana: "MT",
  nebraska: "NE", nevada: "NV", "new hampshire": "NH", "new jersey": "NJ",
  "new mexico": "NM", "new york": "NY", "north carolina": "NC",
  "north dakota": "ND", ohio: "OH", oklahoma: "OK", oregon: "OR",
  pennsylvania: "PA", "rhode island": "RI", "south carolina": "SC",
  "south dakota": "SD", tennessee: "TN", texas: "TX", utah: "UT",
  vermont: "VT", virginia: "VA", washington: "WA", "west virginia": "WV",
  wisconsin: "WI", wyoming: "WY",
};

/** Accepts "California" or "CA" (any case) and returns the 2-letter code. */
export function normalizeState(state: string): string {
  const s = (state || "").trim();
  if (s.length === 2) return s.toUpperCase();
  return STATE_NAME_TO_ABBR[s.toLowerCase()] ?? s.toUpperCase();
}

/** States that have NOT adopted ACA Medicaid expansion, as of 2026. */
const MEDICAID_NON_EXPANSION = new Set([
  "AL", "FL", "GA", "KS", "MS", "SC", "TN", "TX", "WI", "WY",
]);

/** States with a permanent, income-blind free-meals-for-all-students policy. */
const UNIVERSAL_SCHOOL_MEALS = new Set([
  "CA", "CO", "ME", "MA", "MI", "MN", "NM", "NY", "VT",
]);

export function isMedicaidExpansionState(state: string): boolean {
  return !MEDICAID_NON_EXPANSION.has(normalizeState(state));
}

export function hasUniversalSchoolMeals(state: string): boolean {
  return UNIVERSAL_SCHOOL_MEALS.has(normalizeState(state));
}

export function isCalifornia(state: string): boolean {
  return normalizeState(state) === "CA";
}
