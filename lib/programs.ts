// lib/programs.ts
// -----------------------------------------------------------------------------
// THE HEART OF TESSERA.
//
// Each entry is one assistance program: how to describe it, what documents it
// needs, where to apply, and a `evaluate()` function that decides whether the
// household is "likely", "maybe", or "unlikely" to qualify.
//
// ⚠️ IMPORTANT — READ BEFORE YOU SUBMIT:
//   * Every income cutoff below is a SIMPLIFIED, APPROXIMATE rule. Real
//     eligibility varies by STATE, by FILING STATUS, by year, and by special
//     rules (deductions, assets, immigration status, categorical eligibility).
//   * Tessera presents a *preliminary estimate*, never an official decision.
//     That is why every card links to the official source.
//   * To make this genuinely yours (and accurate): pick YOUR state, look up the
//     real numbers from the linked sources, and tighten these rules. This file
//     is designed so you only edit thresholds + text, not the plumbing.
//
// Sources are official .gov pages and are stable.
// -----------------------------------------------------------------------------

import type { Program, EligibilityStatus } from "./types";

/** Small helper: turn a %FPL value into a status using two thresholds. */
function byFpl(
  pct: number,
  likelyAtOrBelow: number,
  maybeAtOrBelow: number,
): EligibilityStatus {
  if (pct <= likelyAtOrBelow) return "likely";
  if (pct <= maybeAtOrBelow) return "maybe";
  return "unlikely";
}

// Approximate EITC income ceilings by number of qualifying children.
// (Roughly tax-year 2024, married-filing-jointly. VERIFY + UPDATE from the IRS.)
const EITC_INCOME_CEILING = [19100, 50400, 57300, 61600]; // index = min(numChildren, 3)
// Approximate maximum credit by number of children, for the "up to ~$X" estimate.
const EITC_MAX_CREDIT = [632, 4213, 6960, 7830];

export const PROGRAMS: Program[] = [
  // ---------------------------------------------------------------------------
  {
    id: "snap",
    name: { en: "SNAP — Food Assistance", es: "SNAP — Asistencia de alimentos" },
    tagline: {
      en: "Monthly money for groceries.",
      es: "Dinero mensual para comprar comida.",
    },
    description: {
      en: "SNAP (formerly food stamps) puts money on a card each month to help your household buy groceries. Most households qualify if their before-tax income is at or below about 130% of the poverty line, though many states allow higher limits.",
      es: "SNAP (antes cupones de alimentos) deposita dinero en una tarjeta cada mes para ayudar a su hogar a comprar comida. La mayoría califica si su ingreso antes de impuestos está en o por debajo de aproximadamente el 130% del nivel de pobreza, aunque muchos estados permiten límites más altos.",
    },
    documents: {
      en: ["Photo ID", "Proof of income (recent pay stubs)", "Proof of where you live", "Social Security numbers for the household"],
      es: ["Identificación con foto", "Comprobante de ingresos (talones de pago recientes)", "Comprobante de domicilio", "Números de Seguro Social del hogar"],
    },
    source: {
      label: { en: "USDA — SNAP eligibility", es: "USDA — Elegibilidad de SNAP" },
      url: "https://www.fns.usda.gov/snap/recipient/eligibility",
    },
    applyUrl: "https://www.fns.usda.gov/snap/state-directory",
    evaluate: (_h, ctx) => {
      const status = byFpl(ctx.percentOfFpl, 130, 200);
      return {
        status,
        reason: {
          en: `Your income is about ${ctx.percentOfFpl}% of the poverty line.`,
          es: `Su ingreso es aproximadamente el ${ctx.percentOfFpl}% del nivel de pobreza.`,
        },
        estimate: {
          en: "Amount depends on income and expenses; many households receive $100–$300+ per person each month.",
          es: "El monto depende de los ingresos y gastos; muchos hogares reciben $100–$300+ por persona al mes.",
        },
      };
    },
  },

  // ---------------------------------------------------------------------------
  {
    id: "medicaid",
    name: { en: "Medicaid / CHIP — Health Coverage", es: "Medicaid / CHIP — Cobertura médica" },
    tagline: {
      en: "Free or low-cost health insurance.",
      es: "Seguro médico gratuito o de bajo costo.",
    },
    description: {
      en: "Medicaid provides free or low-cost health coverage. In states that expanded Medicaid, adults usually qualify at or below 138% of the poverty line. Children often qualify at higher incomes through CHIP. Rules vary a lot by state.",
      es: "Medicaid ofrece cobertura médica gratuita o de bajo costo. En los estados que ampliaron Medicaid, los adultos suelen calificar en o por debajo del 138% del nivel de pobreza. Los niños a menudo califican con ingresos más altos mediante CHIP. Las reglas varían mucho según el estado.",
    },
    documents: {
      en: ["Photo ID", "Proof of income", "Proof of state residency", "Immigration documents (if applicable)"],
      es: ["Identificación con foto", "Comprobante de ingresos", "Comprobante de residencia en el estado", "Documentos de inmigración (si aplica)"],
    },
    source: {
      label: { en: "Medicaid.gov — eligibility", es: "Medicaid.gov — elegibilidad" },
      url: "https://www.medicaid.gov/medicaid/eligibility/index.html",
    },
    applyUrl: "https://www.healthcare.gov/medicaid-chip/getting-medicaid-chip/",
    evaluate: (h, ctx) => {
      // Adults: ~138% FPL. Kids/CHIP frequently to ~210%+.
      const childBump = h.numChildrenUnder18 > 0 ? 213 : 138;
      const status = byFpl(ctx.percentOfFpl, 138, childBump);
      return {
        status,
        reason:
          status === "maybe" && h.numChildrenUnder18 > 0
            ? {
                en: "Adults may be over the limit, but your children may qualify through CHIP.",
                es: "Los adultos podrían superar el límite, pero sus hijos podrían calificar mediante CHIP.",
              }
            : {
                en: `Your income is about ${ctx.percentOfFpl}% of the poverty line.`,
                es: `Su ingreso es aproximadamente el ${ctx.percentOfFpl}% del nivel de pobreza.`,
              },
      };
    },
  },

  // ---------------------------------------------------------------------------
  {
    id: "wic",
    name: { en: "WIC — Nutrition for Parents & Young Kids", es: "WIC — Nutrición para padres y niños pequeños" },
    tagline: {
      en: "Food, formula & support during pregnancy and early childhood.",
      es: "Alimentos, fórmula y apoyo durante el embarazo y la primera infancia.",
    },
    description: {
      en: "WIC supports pregnant people, new parents, and children under 5 with healthy food, infant formula, breastfeeding help, and check-ups. The income limit is about 185% of the poverty line, and being on Medicaid or SNAP usually qualifies you automatically.",
      es: "WIC apoya a personas embarazadas, padres nuevos y niños menores de 5 años con alimentos saludables, fórmula infantil, ayuda con la lactancia y chequeos. El límite de ingresos es de aproximadamente el 185% del nivel de pobreza, y estar en Medicaid o SNAP suele calificarlo automáticamente.",
    },
    documents: {
      en: ["Photo ID", "Proof of income", "Proof of address", "Proof of pregnancy or child's age (for each child)"],
      es: ["Identificación con foto", "Comprobante de ingresos", "Comprobante de domicilio", "Comprobante de embarazo o de la edad del niño (por cada niño)"],
    },
    source: {
      label: { en: "USDA — WIC eligibility", es: "USDA — Elegibilidad de WIC" },
      url: "https://www.fns.usda.gov/wic/wic-eligibility-requirements",
    },
    applyUrl: "https://www.fns.usda.gov/wic/applicant-participant/apply",
    evaluate: (h, ctx) => {
      if (!h.pregnantOrChildUnder5) {
        return {
          status: "unlikely",
          reason: {
            en: "WIC is for pregnancy and children under 5.",
            es: "WIC es para el embarazo y niños menores de 5 años.",
          },
        };
      }
      const status = byFpl(ctx.percentOfFpl, 185, 185);
      return {
        status,
        reason: {
          en: `You have a young child or pregnancy, and your income is about ${ctx.percentOfFpl}% of the poverty line.`,
          es: `Tiene un niño pequeño o un embarazo, y su ingreso es aproximadamente el ${ctx.percentOfFpl}% del nivel de pobreza.`,
        },
      };
    },
  },

  // ---------------------------------------------------------------------------
  {
    id: "eitc",
    name: { en: "EITC — Earned Income Tax Credit", es: "EITC — Crédito Tributario por Ingreso del Trabajo" },
    tagline: {
      en: "A tax refund for working households.",
      es: "Un reembolso de impuestos para hogares que trabajan.",
    },
    description: {
      en: "The EITC is a refund for people who work but don't earn a lot. You claim it on your tax return, and it can be worth a few hundred to several thousand dollars depending on your income and number of children. About 1 in 5 eligible workers miss it every year.",
      es: "El EITC es un reembolso para personas que trabajan pero no ganan mucho. Se reclama en su declaración de impuestos y puede valer de unos cientos a varios miles de dólares según sus ingresos y número de hijos. Aproximadamente 1 de cada 5 trabajadores que califican lo pierde cada año.",
    },
    documents: {
      en: ["Social Security numbers (you, spouse, children)", "W-2 or 1099 income forms", "Last year's tax return (helpful)"],
      es: ["Números de Seguro Social (usted, cónyuge, hijos)", "Formularios de ingresos W-2 o 1099", "La declaración de impuestos del año pasado (útil)"],
    },
    source: {
      label: { en: "IRS — Earned Income Tax Credit", es: "IRS — Crédito por Ingreso del Trabajo" },
      url: "https://www.irs.gov/credits-deductions/individuals/earned-income-tax-credit-eitc",
    },
    applyUrl: "https://www.irs.gov/credits-deductions/individuals/earned-income-tax-credit/use-the-eitc-assistant",
    evaluate: (h, ctx) => {
      const tier = Math.min(h.numChildrenUnder18, 3);
      const ceiling = EITC_INCOME_CEILING[tier];
      const maxCredit = EITC_MAX_CREDIT[tier];
      let status: EligibilityStatus;
      if (ctx.annualIncome <= 0) {
        // EITC requires *earned* income.
        status = "unlikely";
      } else if (ctx.annualIncome <= ceiling * 0.9) {
        status = "likely";
      } else if (ctx.annualIncome <= ceiling) {
        status = "maybe";
      } else {
        status = "unlikely";
      }
      return {
        status,
        reason:
          ctx.annualIncome <= 0
            ? {
                en: "The EITC requires income from working.",
                es: "El EITC requiere ingresos provenientes del trabajo.",
              }
            : {
                en: `Based on working income and ${h.numChildrenUnder18} child(ren).`,
                es: `Según el ingreso del trabajo y ${h.numChildrenUnder18} hijo(s).`,
              },
        estimate: {
          en: `Worth up to about $${maxCredit.toLocaleString()} this year.`,
          es: `Vale hasta aproximadamente $${maxCredit.toLocaleString()} este año.`,
        },
      };
    },
  },

  // ---------------------------------------------------------------------------
  {
    id: "school-meals",
    name: { en: "Free & Reduced-Price School Meals", es: "Comidas escolares gratis o a precio reducido" },
    tagline: {
      en: "Breakfast and lunch at school, at no or low cost.",
      es: "Desayuno y almuerzo en la escuela, gratis o a bajo costo.",
    },
    description: {
      en: "Public schools offer free meals to children in households at or below 130% of the poverty line, and reduced-price meals up to 185%. Families on SNAP usually qualify automatically. You apply once through your child's school.",
      es: "Las escuelas públicas ofrecen comidas gratis a los niños en hogares en o por debajo del 130% del nivel de pobreza, y comidas a precio reducido hasta el 185%. Las familias en SNAP suelen calificar automáticamente. Se solicita una vez a través de la escuela de su hijo.",
    },
    documents: {
      en: ["The school meal application (from your school or district)", "Proof of income or your SNAP/Medicaid case number"],
      es: ["La solicitud de comidas escolares (de su escuela o distrito)", "Comprobante de ingresos o su número de caso de SNAP/Medicaid"],
    },
    source: {
      label: { en: "USDA — National School Lunch Program", es: "USDA — Programa Nacional de Almuerzos Escolares" },
      url: "https://www.fns.usda.gov/nslp",
    },
    applyUrl: "https://www.fns.usda.gov/nslp/applying-free-and-reduced-price-school-meals",
    evaluate: (h, ctx) => {
      if (!h.childrenInK12) {
        return {
          status: "unlikely",
          reason: {
            en: "This is for children in K–12 school.",
            es: "Esto es para niños en la escuela (K–12).",
          },
        };
      }
      const status = byFpl(ctx.percentOfFpl, 130, 185);
      return {
        status,
        reason:
          status === "likely"
            ? { en: "Your income likely qualifies for free meals.", es: "Su ingreso probablemente califica para comidas gratis." }
            : status === "maybe"
              ? { en: "Your income may qualify for reduced-price meals.", es: "Su ingreso podría calificar para comidas a precio reducido." }
              : { en: `Your income is about ${ctx.percentOfFpl}% of the poverty line.`, es: `Su ingreso es aproximadamente el ${ctx.percentOfFpl}% del nivel de pobreza.` },
      };
    },
  },

  // ---------------------------------------------------------------------------
  {
    id: "liheap",
    name: { en: "LIHEAP — Help With Energy Bills", es: "LIHEAP — Ayuda con facturas de energía" },
    tagline: {
      en: "Assistance paying heating and cooling bills.",
      es: "Ayuda para pagar facturas de calefacción y aire.",
    },
    description: {
      en: "LIHEAP helps low-income households pay their home energy bills, and in many states can help in a heating or cooling emergency. Income limits are set by each state — commonly around 150% of the poverty line.",
      es: "LIHEAP ayuda a hogares de bajos ingresos a pagar las facturas de energía del hogar y, en muchos estados, puede ayudar en una emergencia de calefacción o aire. Los límites de ingresos los fija cada estado; comúnmente alrededor del 150% del nivel de pobreza.",
    },
    documents: {
      en: ["Photo ID", "Proof of income", "A recent energy/utility bill", "Proof of address"],
      es: ["Identificación con foto", "Comprobante de ingresos", "Una factura reciente de energía/servicios", "Comprobante de domicilio"],
    },
    source: {
      label: { en: "HHS — LIHEAP", es: "HHS — LIHEAP" },
      url: "https://www.acf.hhs.gov/ocs/programs/liheap",
    },
    applyUrl: "https://www.acf.hhs.gov/ocs/map/liheap-map-state-and-territory-contact-listing",
    evaluate: (_h, ctx) => {
      const status = byFpl(ctx.percentOfFpl, 150, 200);
      return {
        status,
        reason: {
          en: `Your income is about ${ctx.percentOfFpl}% of the poverty line (state limits vary).`,
          es: `Su ingreso es aproximadamente el ${ctx.percentOfFpl}% del nivel de pobreza (los límites estatales varían).`,
        },
      };
    },
  },

  // ---------------------------------------------------------------------------
  {
    id: "lifeline",
    name: { en: "Lifeline — Phone & Internet Discount", es: "Lifeline — Descuento de teléfono e internet" },
    tagline: {
      en: "A monthly discount on phone or internet service.",
      es: "Un descuento mensual en el servicio de teléfono o internet.",
    },
    description: {
      en: "Lifeline lowers the monthly cost of phone or internet service for eligible households. You qualify if your income is at or below 135% of the poverty line, or if you're already on a program like SNAP or Medicaid.",
      es: "Lifeline reduce el costo mensual del servicio de teléfono o internet para hogares elegibles. Califica si su ingreso está en o por debajo del 135% del nivel de pobreza, o si ya participa en un programa como SNAP o Medicaid.",
    },
    documents: {
      en: ["Photo ID", "Proof of income OR proof you're on SNAP/Medicaid/SSI"],
      es: ["Identificación con foto", "Comprobante de ingresos O comprobante de SNAP/Medicaid/SSI"],
    },
    source: {
      label: { en: "FCC — Lifeline program", es: "FCC — Programa Lifeline" },
      url: "https://www.fcc.gov/lifeline-consumers",
    },
    applyUrl: "https://www.lifelinesupport.org/",
    evaluate: (_h, ctx) => {
      const status = byFpl(ctx.percentOfFpl, 135, 150);
      return {
        status,
        reason: {
          en: `Your income is about ${ctx.percentOfFpl}% of the poverty line, or you may qualify through SNAP/Medicaid.`,
          es: `Su ingreso es aproximadamente el ${ctx.percentOfFpl}% del nivel de pobreza, o podría calificar mediante SNAP/Medicaid.`,
        },
      };
    },
  },
];

export function getProgram(id: string): Program | undefined {
  return PROGRAMS.find((p) => p.id === id);
}
