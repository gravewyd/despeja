// components/questionData.ts
import type { Language } from "@/lib/types";

export type QuestionKey =
  | "state" | "householdSize" | "monthlyIncome" | "numChildrenUnder18"
  | "pregnantOrChildUnder5" | "childrenInK12" | "someoneOver60";

export type Question = {
  key: QuestionKey;
  type: "select" | "count" | "currency" | "boolean";
  label: Record<Language, string>;
  help?: Record<Language, string>;
  min?: number;
};

export const QUESTIONS: Question[] = [
  {
    key: "state", type: "select",
    label: { en: "Which state do you live in?", es: "¿En qué estado vives?" },
    help: { en: "Benefit rules and amounts are set partly by your state.", es: "Las reglas y montos dependen en parte de tu estado." },
  },
  {
    key: "householdSize", type: "count", min: 1,
    label: { en: "How many people live in your household?", es: "¿Cuántas personas viven en tu hogar?" },
    help: { en: "Count everyone you buy and prepare food with, including yourself.", es: "Cuenta a todos con quienes compras y preparas comida, incluyéndote." },
  },
  {
    key: "monthlyIncome", type: "currency", min: 0,
    label: { en: "About how much does your household earn each month?", es: "¿Aproximadamente cuánto gana tu hogar cada mes?" },
    help: { en: "Before taxes, for everyone in the home. A rough number is fine.", es: "Antes de impuestos, de todos en el hogar. Un número aproximado está bien." },
  },
  {
    key: "numChildrenUnder18", type: "count", min: 0,
    label: { en: "How many children under 18 live with you?", es: "¿Cuántos niños menores de 18 viven contigo?" },
  },
  {
    key: "pregnantOrChildUnder5", type: "boolean",
    label: { en: "Is anyone pregnant, or is there a child under 5 at home?", es: "¿Hay alguien embarazada o un niño menor de 5 años en casa?" },
  },
  {
    key: "childrenInK12", type: "boolean",
    label: { en: "Are any children in K–12 school?", es: "¿Hay niños en la escuela (K–12)?" },
  },
  {
    key: "someoneOver60", type: "boolean",
    label: { en: "Is anyone in the household 60 or older?", es: "¿Hay alguien de 60 años o más en el hogar?" },
  },
];
