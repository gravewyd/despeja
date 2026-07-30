// lib/programs.ts
// Benefit programs for Despeja — now state-aware.
//
// Most of these are federal programs, so the eligibility RULE is the same
// everywhere; only the display name, apply link, and a couple of real
// state-specific facts (Medicaid expansion, universal school meals) change.
// California gets one bonus program (CARE/FERA) that has no clean national
// equivalent, so it's kept California-only rather than guessed at.
//
// ⚠️ IMPORTANT — READ BEFORE YOU SUBMIT:
//   * Every income cutoff below is a SIMPLIFIED, APPROXIMATE rule. Real
//     eligibility varies by state, filing status, year, and special rules
//     (deductions, assets, immigration status, categorical eligibility).
//   * This is a preliminary estimate, never an official decision. That's
//     why every card links to an official source.
//   * The Federal Poverty Level math in fpl.ts uses the standard 48-state
//     table. Alaska and Hawaii have their own, higher FPL tables — flag
//     this if a judge asks, it's a known simplification.
//
// Sources are official .gov pages and are stable.
// -----------------------------------------------------------------------------

import type { Program, EligibilityStatus } from "./types";
import { isMedicaidExpansionState, hasUniversalSchoolMeals, isCalifornia } from "./stateData";

function byFpl(pct: number, likelyAtOrBelow: number, maybeAtOrBelow: number): EligibilityStatus {
  if (pct <= likelyAtOrBelow) return "likely";
  if (pct <= maybeAtOrBelow) return "maybe";
  return "unlikely";
}

// Federal EITC ceilings, roughly tax-year 2025 (index = min(numChildren, 3)). VERIFY annually.
const EITC_INCOME_CEILING = [19100, 50400, 57300, 61600];
const EITC_MAX_CREDIT = [632, 4213, 6960, 7830];
// California's CalEITC — used only when the household is in California.
const CALEITC_CEILING = [18591, 26511, 26511, 26511];
const CALEITC_MAX = [285, 1900, 3137, 3529];

export const PROGRAMS: Program[] = [
  // ---------------------------------------------------------------------------
  {
    id: "snap",
    name: { en: "SNAP — Food Assistance", es: "SNAP — Asistencia de alimentos" },
    tagline: {
      en: "Monthly money for groceries. Some states use their own name for it.",
      es: "Dinero mensual para comprar comida. Algunos estados usan su propio nombre.",
    },
    description: {
      en: "SNAP puts money on a card each month to help your household buy groceries. Most states qualify households at or below 130–200% of the poverty line. A few states use their own name — California calls it CalFresh — but the program and application are the same underlying benefit everywhere.",
      es: "SNAP deposita dinero en una tarjeta cada mes para ayudar a su hogar a comprar comida. La mayoría de los estados califica hogares en o por debajo del 130–200% del nivel de pobreza. Algunos estados usan su propio nombre — California lo llama CalFresh.",
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
    evaluate: (h, ctx) => {
      const status = byFpl(ctx.percentOfFpl, 130, 200);
      return {
        status,
        reason: {
          en: isCalifornia(h.state)
            ? `Your income is about ${ctx.percentOfFpl}% of the poverty line. California (CalFresh) allows up to 200% FPL.`
            : `Your income is about ${ctx.percentOfFpl}% of the poverty line.`,
          es: isCalifornia(h.state)
            ? `Su ingreso es aproximadamente el ${ctx.percentOfFpl}% del nivel de pobreza. California (CalFresh) permite hasta el 200% FPL.`
            : `Su ingreso es aproximadamente el ${ctx.percentOfFpl}% del nivel de pobreza.`,
        },
        estimate: {
          en: "Amount depends on income and household size; many households receive $100–$300+ per person each month.",
          es: "El monto depende del ingreso y el tamaño del hogar; muchos hogares reciben $100–$300+ por persona al mes.",
        },
      };
    },
  },

  // ---------------------------------------------------------------------------
  {
    id: "medicaid",
    name: { en: "Medicaid — Health Coverage", es: "Medicaid — Cobertura médica" },
    tagline: {
      en: "Free or low-cost health insurance. Some states use their own name.",
      es: "Seguro médico gratuito o de bajo costo. Algunos estados usan su propio nombre.",
    },
    description: {
      en: "Medicaid covers doctor visits, prescriptions, hospital stays, and more. Some states use their own name — California calls it Medi-Cal. How generous it is depends heavily on whether your state adopted ACA Medicaid expansion: 40 states + DC have, which covers most adults up to 138% of the poverty line. In the 10 states that haven't, rules are stricter and vary a lot — this tool applies a simplified version of each.",
      es: "Medicaid cubre visitas médicas, medicamentos, hospitalizaciones y más. Algunos estados usan su propio nombre — California lo llama Medi-Cal. Qué tan generoso es depende de si su estado adoptó la expansión de Medicaid bajo la ACA: 40 estados + DC lo hicieron, cubriendo a la mayoría de adultos hasta el 138% del nivel de pobreza. En los 10 estados que no lo hicieron, las reglas son más estrictas y varían mucho.",
    },
    documents: {
      en: ["Photo ID", "Proof of income", "Proof of residency in your state", "Social Security number (if available)"],
      es: ["Identificación con foto", "Comprobante de ingresos", "Comprobante de residencia en su estado", "Número de Seguro Social (si disponible)"],
    },
    source: {
      label: { en: "Medicaid.gov", es: "Medicaid.gov" },
      url: "https://www.medicaid.gov/medicaid/eligibility/index.html",
    },
    applyUrl: "https://www.healthcare.gov/medicaid-chip/",
    evaluate: (h, ctx) => {
      const expansion = isMedicaidExpansionState(h.state);
      const caNote = isCalifornia(h.state) ? " (Medi-Cal)" : "";

      if (expansion) {
        const childBump = h.numChildrenUnder18 > 0 || h.pregnantOrChildUnder5 ? 266 : 138;
        const status = byFpl(ctx.percentOfFpl, 138, childBump);
        return {
          status,
          reason:
            status === "maybe" && (h.numChildrenUnder18 > 0 || h.pregnantOrChildUnder5)
              ? {
                  en: `Adults may be over the income limit, but children and pregnant household members likely qualify through Medicaid${caNote} or CHIP.`,
                  es: `Los adultos podrían superar el límite, pero los niños y embarazadas del hogar probablemente califican mediante Medicaid${caNote} o CHIP.`,
                }
              : {
                  en: `Your state has expanded Medicaid${caNote}. Your income is about ${ctx.percentOfFpl}% of the poverty line — the limit for adults is 138%.`,
                  es: `Su estado expandió Medicaid${caNote}. Su ingreso es aproximadamente el ${ctx.percentOfFpl}% del nivel de pobreza — el límite para adultos es el 138%.`,
                },
        };
      }

      // Non-expansion state: much stricter, and it varies a lot state to state.
      if (h.pregnantOrChildUnder5) {
        const status = byFpl(ctx.percentOfFpl, 138, 200);
        return {
          status,
          reason: {
            en: `Your state hasn't expanded Medicaid, but pregnant household members and young children are still covered at similar income levels in almost every state. Your income is about ${ctx.percentOfFpl}% of the poverty line.`,
            es: `Su estado no ha expandido Medicaid, pero las embarazadas y niños pequeños siguen cubiertos a niveles de ingreso similares en casi todos los estados. Su ingreso es aproximadamente el ${ctx.percentOfFpl}%.`,
          },
        };
      }
      if (h.someoneOver60) {
        const status = byFpl(ctx.percentOfFpl, 75, 100);
        return {
          status,
          reason: {
            en: `Your state hasn't expanded Medicaid, but coverage for people 65+ or with disabilities usually still exists at low incomes. Your income is about ${ctx.percentOfFpl}% of the poverty line — confirm your state's exact limit.`,
            es: `Su estado no ha expandido Medicaid, pero suele existir cobertura para personas de 65+ o con discapacidades con ingresos bajos. Confirme el límite exacto de su estado.`,
          },
        };
      }
      if (h.numChildrenUnder18 > 0) {
        const status = byFpl(ctx.percentOfFpl, 30, 50);
        return {
          status,
          reason: {
            en: `Your state hasn't expanded Medicaid. Coverage for parents still exists but the income limit is often very low and varies a lot by state — your income is about ${ctx.percentOfFpl}% of the poverty line.`,
            es: `Su estado no ha expandido Medicaid. La cobertura para padres existe pero el límite de ingreso suele ser muy bajo y varía por estado — su ingreso es aproximadamente el ${ctx.percentOfFpl}%.`,
          },
        };
      }
      return {
        status: "unlikely",
        reason: {
          en: "Your state hasn't expanded Medicaid, and this program mainly covers parents, pregnant people, children, and people who are 65+ or have a disability — not other adults, even at very low income. This is the 'coverage gap.' Check healthcare.gov for marketplace options.",
          es: "Su estado no ha expandido Medicaid, y este programa cubre principalmente a padres, embarazadas, niños y personas de 65+ o con discapacidad. Esto se llama la 'brecha de cobertura.' Revise healthcare.gov para opciones del mercado.",
        },
      };
    },
  },

  // ---------------------------------------------------------------------------
  {
    id: "wic",
    name: { en: "WIC — Nutrition for Parents & Young Kids", es: "WIC — Nutrición para padres y niños pequeños" },
    tagline: {
      en: "Food, formula, and support during pregnancy and early childhood.",
      es: "Alimentos, fórmula y apoyo durante el embarazo y la primera infancia.",
    },
    description: {
      en: "WIC supports pregnant people, new parents, and children under 5 with healthy food packages, infant formula, breastfeeding support, and referrals to other services, in every state. The income limit is 185% of the poverty line, and being on Medicaid or SNAP usually qualifies you automatically.",
      es: "WIC apoya a personas embarazadas, padres nuevos y niños menores de 5 años con paquetes de alimentos saludables, fórmula infantil y apoyo con lactancia, en todos los estados. El límite es el 185% del nivel de pobreza, y estar en Medicaid o SNAP suele calificarlo automáticamente.",
    },
    documents: {
      en: ["Photo ID", "Proof of income or Medicaid/SNAP card", "Proof of address", "Proof of pregnancy or child's age"],
      es: ["Identificación con foto", "Comprobante de ingresos o tarjeta de Medicaid/SNAP", "Comprobante de domicilio", "Comprobante de embarazo o edad del niño"],
    },
    source: {
      label: { en: "USDA — WIC Program", es: "Programa WIC — USDA" },
      url: "https://www.fns.usda.gov/wic",
    },
    applyUrl: "https://www.fns.usda.gov/wic/wic-contacts",
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
          es: `Tiene un niño pequeño o embarazo, y su ingreso es aproximadamente el ${ctx.percentOfFpl}% del nivel de pobreza.`,
        },
      };
    },
  },

  // ---------------------------------------------------------------------------
  {
    id: "eitc",
    name: { en: "EITC — Tax Credits", es: "EITC — Créditos de impuestos" },
    tagline: {
      en: "A federal tax refund for working households — plus a state credit in many states.",
      es: "Un reembolso de impuestos federal para hogares que trabajan — más un crédito estatal en muchos estados.",
    },
    description: {
      en: "Working households can claim the federal Earned Income Tax Credit (EITC) — potentially thousands of dollars back. About 1 in 5 eligible workers misses it every year. Over 30 states (including California, with CalEITC) add their own credit on top — check your state tax return. You claim it when you file taxes; free filing help is available through VITA sites nationwide.",
      es: "Los hogares que trabajan pueden reclamar el Crédito Tributario por Ingreso del Trabajo (EITC) federal — potencialmente miles de dólares de reembolso. Más de 30 estados (incluyendo California, con CalEITC) agregan su propio crédito — revise su declaración estatal.",
    },
    documents: {
      en: ["Social Security numbers (you, spouse, children)", "W-2 or 1099 income forms", "Last year's tax return (helpful)", "Bank account info for direct deposit"],
      es: ["Números de Seguro Social (usted, cónyuge, hijos)", "Formularios de ingresos W-2 o 1099", "Declaración de impuestos del año pasado (útil)", "Información bancaria para depósito directo"],
    },
    source: {
      label: { en: "IRS — EITC", es: "IRS — EITC" },
      url: "https://www.irs.gov/credits-deductions/individuals/earned-income-tax-credit",
    },
    applyUrl: "https://www.irs.gov/credits-deductions/individuals/earned-income-tax-credit/use-the-eitc-assistant",
    evaluate: (h, ctx) => {
      const tier = Math.min(h.numChildrenUnder18, 3);
      const federalCeiling = EITC_INCOME_CEILING[tier];
      const maxFederal = EITC_MAX_CREDIT[tier];
      const ca = isCalifornia(h.state);
      const calCeiling = CALEITC_CEILING[tier];
      const maxCal = CALEITC_MAX[tier];

      let status: EligibilityStatus;
      if (ctx.annualIncome <= 0) {
        status = "unlikely";
      } else if (ca && ctx.annualIncome <= calCeiling) {
        status = "likely"; // qualifies for both federal + CalEITC
      } else if (ctx.annualIncome <= federalCeiling) {
        status = "maybe";
      } else {
        status = "unlikely";
      }

      return {
        status,
        reason:
          ctx.annualIncome <= 0
            ? { en: "EITC requires income from working.", es: "El EITC requiere ingresos provenientes del trabajo." }
            : { en: `Based on working income and ${h.numChildrenUnder18} child(ren).`, es: `Según el ingreso del trabajo y ${h.numChildrenUnder18} hijo(s).` },
        estimate: {
          en: ca
            ? `Federal EITC up to $${maxFederal.toLocaleString()} + California's CalEITC up to $${maxCal.toLocaleString()}.`
            : `Federal EITC up to $${maxFederal.toLocaleString()}. Many states add their own credit on top — check yours.`,
          es: ca
            ? `EITC federal hasta $${maxFederal.toLocaleString()} + CalEITC de California hasta $${maxCal.toLocaleString()}.`
            : `EITC federal hasta $${maxFederal.toLocaleString()}. Muchos estados agregan su propio crédito — revise el suyo.`,
        },
      };
    },
  },

  // ---------------------------------------------------------------------------
  {
    id: "school-meals",
    name: { en: "Free & Reduced School Meals", es: "Comidas escolares gratis o a precio reducido" },
    tagline: {
      en: "Breakfast and lunch at school, at no or low cost.",
      es: "Desayuno y almuerzo en la escuela, gratis o a bajo costo.",
    },
    description: {
      en: "Public schools nationwide offer free breakfast and lunch to children in households at or below 130% of the poverty line, and reduced-price meals up to 185%. Nine states (California, Colorado, Maine, Massachusetts, Michigan, Minnesota, New Mexico, New York, and Vermont) now provide free meals to every student, regardless of income. Families on SNAP usually qualify automatically. You apply once each school year through your child's school district.",
      es: "Las escuelas públicas ofrecen desayuno y almuerzo gratis a niños en hogares en o por debajo del 130% del nivel de pobreza, y comidas a precio reducido hasta el 185%. Nueve estados (California, Colorado, Maine, Massachusetts, Michigan, Minnesota, Nuevo México, Nueva York y Vermont) ahora dan comidas gratis a todos los estudiantes, sin importar el ingreso.",
    },
    documents: {
      en: ["School meal application (from your child's school) — not needed in states with meals for all"],
      es: ["Solicitud de comidas escolares (de la escuela de su hijo) — no necesaria en estados con comidas para todos"],
    },
    source: {
      label: { en: "USDA — School Meal Programs", es: "USDA — Programas de Comidas Escolares" },
      url: "https://www.fns.usda.gov/nslp",
    },
    applyUrl: "https://www.fns.usda.gov/school-meals/applying-free-and-reduced-price-school-meals",
    evaluate: (h, ctx) => {
      if (!h.childrenInK12) {
        return {
          status: "unlikely",
          reason: { en: "This is for children currently in K–12 school.", es: "Esto es para niños actualmente en la escuela (K–12)." },
        };
      }
      if (hasUniversalSchoolMeals(h.state)) {
        return {
          status: "likely",
          reason: {
            en: "Your state provides free breakfast and lunch to every public school student, regardless of income.",
            es: "Su estado da desayuno y almuerzo gratis a todos los estudiantes de escuela pública, sin importar el ingreso.",
          },
          estimate: {
            en: "$0 — no application needed, meals are already free at school.",
            es: "$0 — no se necesita solicitud, las comidas ya son gratis en la escuela.",
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
      es: "Ayuda para pagar facturas de calefacción y aire acondicionado.",
    },
    description: {
      en: "LIHEAP helps low-income households pay their energy bills and can provide emergency help when a household faces disconnection. It's a federal program run by each state, so the exact income limit varies — most states set it between 150–200% of the poverty line.",
      es: "LIHEAP ayuda a hogares de bajos ingresos a pagar sus facturas de energía y puede brindar ayuda de emergencia cuando un hogar enfrenta desconexión. Es un programa federal administrado por cada estado, así que el límite exacto varía — la mayoría lo fija entre el 150–200% del nivel de pobreza.",
    },
    documents: {
      en: ["Photo ID", "Proof of income", "A recent utility/energy bill", "Proof of address"],
      es: ["Identificación con foto", "Comprobante de ingresos", "Una factura reciente de servicios/energía", "Comprobante de domicilio"],
    },
    source: {
      label: { en: "LIHEAP Clearinghouse — find your state", es: "LIHEAP — encuentre su estado" },
      url: "https://liheapch.acf.hhs.gov/help",
    },
    applyUrl: "https://liheapch.acf.hhs.gov/help",
    evaluate: (h, ctx) => {
      const status = byFpl(ctx.percentOfFpl, 150, 200);
      return {
        status,
        reason: {
          en: isCalifornia(h.state)
            ? `Your income is about ${ctx.percentOfFpl}% of the poverty line. California's limit is around 150% FPL.`
            : `Your income is about ${ctx.percentOfFpl}% of the poverty line. Most states set the limit between 150–200% FPL — confirm your state's exact number.`,
          es: isCalifornia(h.state)
            ? `Su ingreso es aproximadamente el ${ctx.percentOfFpl}% del nivel de pobreza. El límite de California es alrededor del 150% FPL.`
            : `Su ingreso es aproximadamente el ${ctx.percentOfFpl}% del nivel de pobreza. La mayoría de los estados fija el límite entre 150–200% FPL.`,
        },
      };
    },
  },

  // ---------------------------------------------------------------------------
  {
    id: "lifeline",
    name: { en: "Lifeline — Phone & Internet Discount", es: "Lifeline — Descuento de teléfono e internet" },
    tagline: {
      en: "Monthly discount on phone or internet service, in every state.",
      es: "Descuento mensual en el servicio de teléfono o internet, en todos los estados.",
    },
    description: {
      en: "Lifeline is a federal program providing a monthly discount on phone or internet service. You qualify if your income is at or below 135% of the poverty line, or if you're already on SNAP, Medicaid, or SSI. Some states, like California's LifeLine, add an extra state discount on top of the federal benefit.",
      es: "Lifeline es un programa federal que ofrece un descuento mensual en el servicio de teléfono o internet. Califica si su ingreso está en o por debajo del 135% del nivel de pobreza, o si ya participa en SNAP, Medicaid o SSI. Algunos estados, como California, agregan un descuento estatal adicional.",
    },
    documents: {
      en: ["Photo ID", "Proof of income OR proof of SNAP/Medicaid/SSI enrollment"],
      es: ["Identificación con foto", "Comprobante de ingresos O comprobante de inscripción en SNAP/Medicaid/SSI"],
    },
    source: {
      label: { en: "Lifeline Support (FCC)", es: "Lifeline Support (FCC)" },
      url: "https://www.lifelinesupport.org/",
    },
    applyUrl: "https://www.lifelinesupport.org/",
    evaluate: (h, ctx) => {
      const status = byFpl(ctx.percentOfFpl, 135, 150);
      return {
        status,
        reason: {
          en: `Your income is about ${ctx.percentOfFpl}% of the poverty line, or you may qualify through SNAP or Medicaid.${isCalifornia(h.state) ? " California LifeLine adds a state discount on top." : ""}`,
          es: `Su ingreso es aproximadamente el ${ctx.percentOfFpl}% del nivel de pobreza, o podría calificar mediante SNAP o Medicaid.${isCalifornia(h.state) ? " California LifeLine agrega un descuento estatal adicional." : ""}`,
        },
        estimate: {
          en: "Federal Lifeline: up to $9.25/month off your bill.",
          es: "Lifeline federal: hasta $9.25/mes de descuento.",
        },
      };
    },
  },

  // ---------------------------------------------------------------------------
  {
    id: "ssi",
    name: { en: "SSI — Supplemental Security Income", es: "SSI — Ingreso de Seguridad Suplementario" },
    tagline: {
      en: "Monthly cash for people who are 65+, blind, or have a disability.",
      es: "Dinero mensual para personas de 65+, ciegas o con discapacidad.",
    },
    description: {
      en: "SSI is a federal program providing monthly cash payments to people who are 65 or older, blind, or have a disability, with limited income and resources. The 2026 federal base payment is $994/month for an individual. Most states add a supplement on top — California's is one of the largest in the country; a handful of states (Arizona, Arkansas, Mississippi, North Dakota, Tennessee, West Virginia) add none.",
      es: "SSI es un programa federal que da pagos mensuales en efectivo a personas de 65 años o más, ciegas o con discapacidad, con ingresos y recursos limitados. El pago base federal de 2026 es $994/mes para una persona. La mayoría de los estados agregan un suplemento — el de California es uno de los más altos del país.",
    },
    documents: {
      en: ["Photo ID", "Proof of age or disability documentation", "Proof of income and resources", "Social Security number"],
      es: ["Identificación con foto", "Comprobante de edad o documentación de discapacidad", "Comprobante de ingresos y recursos", "Número de Seguro Social"],
    },
    source: {
      label: { en: "SSA — SSI Program", es: "SSA — Programa SSI" },
      url: "https://www.ssa.gov/ssi/",
    },
    applyUrl: "https://www.ssa.gov/applyforbenefits",
    evaluate: (h, ctx) => {
      if (!h.someoneOver60) {
        return {
          status: "unlikely",
          reason: {
            en: "SSI is primarily for people 65+, or those who are blind or have a qualifying disability.",
            es: "SSI es principalmente para personas de 65 años o más, o personas ciegas o con discapacidad.",
          },
        };
      }
      const status = byFpl(ctx.percentOfFpl, 100, 150);
      return {
        status,
        reason: {
          en: `Someone in your household is over 60 and your income is about ${ctx.percentOfFpl}% of the poverty line.`,
          es: `Alguien en su hogar tiene más de 60 años y su ingreso es aproximadamente el ${ctx.percentOfFpl}% del nivel de pobreza.`,
        },
        estimate: {
          en: isCalifornia(h.state)
            ? "Federal base is $994/month (2026), plus California's SSP supplement — one of the largest in the country."
            : "Federal base is $994/month for an individual (2026). Most states add a supplement on top.",
          es: isCalifornia(h.state)
            ? "La base federal es $994/mes (2026), más el suplemento SSP de California — uno de los más altos del país."
            : "La base federal es $994/mes para una persona (2026). La mayoría de los estados agregan un suplemento.",
        },
      };
    },
  },

  // ---------------------------------------------------------------------------
  {
    id: "tanf",
    name: { en: "TANF — Cash Assistance for Families", es: "TANF — Ayuda en efectivo para familias" },
    tagline: {
      en: "Monthly cash for families with children in need. Name and amount vary by state.",
      es: "Dinero mensual para familias con niños en necesidad. El nombre y monto varían por estado.",
    },
    description: {
      en: "TANF (Temporary Assistance for Needy Families) provides monthly cash payments to families with children who have low or no income, plus support like childcare and job training. It's federally funded but state-run, so the program name (California calls it CalWORKs), income limit, and payment amount all vary a lot by state.",
      es: "TANF proporciona pagos mensuales en efectivo a familias con niños que tienen ingresos bajos o nulos, además de apoyo como cuidado infantil y capacitación laboral. Es financiado federalmente pero administrado por el estado, así que el nombre (California lo llama CalWORKs), el límite de ingreso y el monto varían mucho por estado.",
    },
    documents: {
      en: ["Photo ID", "Proof of income", "Proof of residency in your state", "Children's birth certificates", "Social Security numbers"],
      es: ["Identificación con foto", "Comprobante de ingresos", "Comprobante de residencia en su estado", "Actas de nacimiento de los niños", "Números de Seguro Social"],
    },
    source: {
      label: { en: "Administration for Children & Families — TANF", es: "Administración para Niños y Familias — TANF" },
      url: "https://www.acf.hhs.gov/ofa/programs/tanf",
    },
    applyUrl: "https://www.acf.hhs.gov/ofa/policy-guidance/state-tanf-contacts",
    evaluate: (h, ctx) => {
      if (h.numChildrenUnder18 === 0) {
        return {
          status: "unlikely",
          reason: { en: "TANF is for families with children under 18.", es: "TANF es para familias con hijos menores de 18 años." },
        };
      }
      const status = byFpl(ctx.percentOfFpl, 100, 130);
      return {
        status,
        reason: {
          en: `Your household has ${h.numChildrenUnder18} child(ren) and income is about ${ctx.percentOfFpl}% of the poverty line. The real limit and payment amount vary a lot by state${isCalifornia(h.state) ? " — California's version is CalWORKs" : ""}.`,
          es: `Su hogar tiene ${h.numChildrenUnder18} hijo(s) y el ingreso es aproximadamente el ${ctx.percentOfFpl}% del nivel de pobreza. El límite real y el monto varían mucho por estado${isCalifornia(h.state) ? " — la versión de California es CalWORKs" : ""}.`,
        },
        estimate: {
          en: isCalifornia(h.state)
            ? "CalWORKs: typically $700–$1,100/month for a family of 3."
            : "Varies widely by state — often $200–$900/month for a family of 3.",
          es: isCalifornia(h.state)
            ? "CalWORKs: típicamente $700–$1,100/mes para una familia de 3."
            : "Varía mucho por estado — a menudo $200–$900/mes para una familia de 3.",
        },
      };
    },
  },

  // ---------------------------------------------------------------------------
  {
    id: "marketplace",
    name: { en: "Health Insurance Marketplace Subsidies", es: "Subsidios del Mercado de Seguros Médicos" },
    tagline: {
      en: "Lower-cost health insurance if you earn too much for Medicaid.",
      es: "Seguro médico de menor costo si gana demasiado para Medicaid.",
    },
    description: {
      en: "If your income is above Medicaid limits but below about 400% of the poverty line, federal subsidies can significantly lower your monthly health insurance premium through the Marketplace. Many people pay $0–$50/month after subsidies. Applying through healthcare.gov automatically routes you to your own state's exchange — California's is called Covered California. Open enrollment runs November through January.",
      es: "Si su ingreso supera los límites de Medicaid pero está por debajo del 400% del nivel de pobreza, los subsidios federales pueden reducir mucho su prima mensual a través del Mercado. Aplicar en healthcare.gov lo dirige automáticamente al mercado de su propio estado — el de California se llama Covered California.",
    },
    documents: {
      en: ["Photo ID", "Social Security numbers", "Proof of income (pay stubs or tax return)", "Current health insurance info (if any)"],
      es: ["Identificación con foto", "Números de Seguro Social", "Comprobante de ingresos (talones de pago o declaración de impuestos)", "Información de seguro médico actual (si tiene)"],
    },
    source: {
      label: { en: "HealthCare.gov", es: "HealthCare.gov" },
      url: "https://www.healthcare.gov/",
    },
    applyUrl: "https://www.healthcare.gov/apply-and-enroll/",
    evaluate: (h, ctx) => {
      if (ctx.percentOfFpl <= 138 && isMedicaidExpansionState(h.state)) {
        return {
          status: "unlikely",
          reason: {
            en: "At your income, you likely qualify for Medicaid (free) instead.",
            es: "Con su ingreso, probablemente califica para Medicaid (gratis) en su lugar.",
          },
        };
      }
      const status = byFpl(ctx.percentOfFpl, 250, 400);
      return {
        status,
        reason: {
          en: `Your income is about ${ctx.percentOfFpl}% of the poverty line — in the range for Marketplace subsidies.${isCalifornia(h.state) ? " In California, this is Covered California." : ""}`,
          es: `Su ingreso es aproximadamente el ${ctx.percentOfFpl}% del nivel de pobreza — dentro del rango para subsidios del Mercado.${isCalifornia(h.state) ? " En California, esto es Covered California." : ""}`,
        },
        estimate: {
          en: "Subsidies can reduce premiums by hundreds per month. Many pay $0–$50/month after aid.",
          es: "Los subsidios pueden reducir las primas en cientos al mes. Muchos pagan $0–$50/mes después de la ayuda.",
        },
      };
    },
  },

  // ---------------------------------------------------------------------------
  // California-only: no clean national equivalent (utility assistance rules
  // vary too much by state/utility company to generalize responsibly).
  {
    id: "care-fera",
    name: { en: "CARE/FERA — Utility Rate Discount (California only)", es: "CARE/FERA — Descuento en tarifas (solo California)" },
    tagline: {
      en: "Lower electric and gas rates through PG&E, SoCalGas, and other California utilities.",
      es: "Tarifas de electricidad y gas más bajas a través de PG&E, SoCalGas y otras empresas de California.",
    },
    description: {
      en: "CARE (California Alternate Rates for Energy) gives a 20–35% discount on monthly electric and gas bills. FERA gives an 18% electric discount to slightly higher-income households of 3+. If you're on SNAP or Medicaid, you qualify for CARE automatically. This program is specific to California — outside California, see LIHEAP for energy bill help instead.",
      es: "CARE da un descuento del 20–35% en facturas mensuales de electricidad y gas. FERA da un descuento del 18% en electricidad a hogares con ingresos un poco más altos de 3 personas o más. Este programa es específico de California — fuera de California, vea LIHEAP.",
    },
    documents: {
      en: ["Your utility account number", "Proof of income OR SNAP/Medicaid enrollment"],
      es: ["Su número de cuenta de servicios públicos", "Comprobante de ingresos O inscripción en SNAP/Medicaid"],
    },
    source: {
      label: { en: "CPUC — CARE/FERA Programs", es: "CPUC — Programas CARE/FERA" },
      url: "https://www.cpuc.ca.gov/industries-and-topics/electrical-energy/electric-costs/care-fera-program",
    },
    applyUrl: "https://www.pge.com/en/save-energy-and-money/financial-assistance/care-program.html",
    evaluate: (h, ctx) => {
      if (!isCalifornia(h.state)) {
        return {
          status: "unlikely",
          reason: {
            en: "This program is only available in California. See LIHEAP above for energy bill help in your state.",
            es: "Este programa solo está disponible en California. Vea LIHEAP arriba para ayuda con facturas de energía en su estado.",
          },
        };
      }
      const status = byFpl(ctx.percentOfFpl, 200, 250);
      return {
        status,
        reason: {
          en: `Your income is about ${ctx.percentOfFpl}% of the poverty line. CARE covers up to 200% FPL; FERA up to 250%.`,
          es: `Su ingreso es aproximadamente el ${ctx.percentOfFpl}% del nivel de pobreza. CARE cubre hasta el 200% FPL; FERA hasta el 250%.`,
        },
        estimate: {
          en: "CARE: 20–35% off your monthly utility bill. FERA: 18% off electricity.",
          es: "CARE: 20–35% de descuento en su factura mensual. FERA: 18% de descuento en electricidad.",
        },
      };
    },
  },
];

export function getProgram(id: string): Program | undefined {
  return PROGRAMS.find((p) => p.id === id);
}
