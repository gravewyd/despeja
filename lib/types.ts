// lib/types.ts
// Shared types for Despeja.

export type Language = "en" | "es";

export interface Household {
  state: string;
  householdSize: number;
  monthlyIncome: number;
  numChildrenUnder18: number;
  pregnantOrChildUnder5: boolean;
  childrenInK12: boolean;
  someoneOver60: boolean;
}

export type EligibilityStatus = "likely" | "maybe" | "unlikely";

export interface EvalContext {
  annualIncome: number;
  percentOfFpl: number;
}

export interface Program {
  id: string;
  name: Record<Language, string>;
  tagline: Record<Language, string>;
  description: Record<Language, string>;
  documents: Record<Language, string[]>;
  source: { label: Record<Language, string>; url: string };
  applyUrl: string;
  evaluate: (h: Household, ctx: EvalContext) => {
    status: EligibilityStatus;
    reason: Record<Language, string>;
    estimate?: Record<Language, string>;
  };
}

export interface EligibilityResult {
  program: Program;
  status: EligibilityStatus;
  reason: Record<Language, string>;
  estimate?: Record<Language, string>;
}
