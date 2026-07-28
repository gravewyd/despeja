// lib/programs.ts
// California-specific benefit programs for Despeja.
// Program names use California's official names (CalFresh, Medi-Cal, etc.)
// Thresholds reflect California rules as of 2024-2025.

import type { Program, EligibilityStatus } from "./types";

function byFpl(pct: number, likelyAtOrBelow: number, maybeAtOrBelow: number): EligibilityStatus {
  if (pct <= likelyAtOrBelow) return "likely";
  if (pct <= maybeAtOrBelow) return "maybe";
  return "unlikely";
}

const EITC_INCOME_CEILING = [19100, 50400, 57300, 61600];
const EITC_MAX_CREDIT = [632, 4213, 6960, 7830];
// California EITC (CalEITC) thresholds 2024
const CALEITC_CEILING = [18591, 26511, 26511, 26511];
const CALEITC_MAX = [285, 1900, 3137, 3529];

export const PROGRAMS: Program[] = [
  // ---------------------------------------------------------------------------
  {
    id: "snap",
    name: { en: "CalFresh — Food Assistance", es: "CalFresh — Asistencia de alimentos" },
    tagline: {
      en: "Monthly money for groceries, California's food assistance program.",
      es: "Dinero mensual para comida, el programa de asistencia alimentaria de California.",
    },
    description: {
      en: "CalFresh (California's name for SNAP) puts money on an EBT card each month to help your household buy groceries. In California, most households qualify if their gross income is at or below 200% of the poverty line — one of the most generous limits in the country.",
      es: "CalFresh (el nombre de California para SNAP) deposita dinero en una tarjeta EBT cada mes para ayudar a su hogar a comprar comida. En California, la mayoría califica si su ingreso bruto está en o por debajo del 200% del nivel de pobreza — uno de los límites más generosos del país.",
    },
    documents: {
      en: ["Photo ID", "Proof of income (recent pay stubs or letter)", "Proof of address", "Social Security numbers for household members"],
      es: ["Identificación con foto", "Comprobante de ingresos (talones de pago recientes)", "Comprobante de domicilio", "Números de Seguro Social de los miembros del hogar"],
    },
    source: {
      label: { en: "California CDSS — CalFresh", es: "CDSS de California — CalFresh" },
      url: "https://www.cdss.ca.gov/calfresh",
    },
    applyUrl: "https://benefitscal.com",
    evaluate: (_h, ctx) => {
      // California uses 200% FPL gross income test (expanded)
      const status = byFpl(ctx.percentOfFpl, 130, 200);
      return {
        status,
        reason: {
          en: `Your income is about ${ctx.percentOfFpl}% of the poverty line. California allows up to 200% FPL.`,
          es: `Su ingreso es aproximadamente el ${ctx.percentOfFpl}% del nivel de pobreza. California permite hasta el 200% FPL.`,
        },
        estimate: {
          en: "Many California households receive $100–$300+ per person per month on their EBT card.",
          es: "Muchos hogares en California reciben $100–$300+ por persona al mes en su tarjeta EBT.",
        },
      };
    },
  },

  // ---------------------------------------------------------------------------
  {
    id: "medicaid",
    name: { en: "Medi-Cal — Health Coverage", es: "Medi-Cal — Cobertura médica" },
    tagline: {
      en: "Free or low-cost health insurance through California.",
      es: "Seguro médico gratuito o de bajo costo a través de California.",
    },
    description: {
      en: "Medi-Cal is California's Medicaid program and covers doctor visits, prescriptions, hospital stays, mental health, and dental. As of 2024, all income-eligible Californians qualify regardless of immigration status. Most adults qualify up to 138% of the poverty line; children and pregnant people qualify at higher income levels.",
      es: "Medi-Cal es el programa Medicaid de California y cubre visitas médicas, medicamentos, hospitalizaciones, salud mental y dental. Desde 2024, todos los californianos con ingresos elegibles califican sin importar su estatus migratorio. La mayoría de adultos califica hasta el 138% del nivel de pobreza.",
    },
    documents: {
      en: ["Photo ID", "Proof of income", "Proof of California residency", "Social Security number (if available)"],
      es: ["Identificación con foto", "Comprobante de ingresos", "Comprobante de residencia en California", "Número de Seguro Social (si disponible)"],
    },
    source: {
      label: { en: "California DHCS — Medi-Cal", es: "DHCS de California — Medi-Cal" },
      url: "https://www.dhcs.ca.gov/services/medi-cal/Pages/whatismedi-cal.aspx",
    },
    applyUrl: "https://benefitscal.com",
    evaluate: (h, ctx) => {
      const childBump = h.numChildrenUnder18 > 0 ? 266 : 138;
      const status = byFpl(ctx.percentOfFpl, 138, childBump);
      return {
        status,
        reason:
          status === "maybe" && h.numChildrenUnder18 > 0
            ? {
                en: "Adults may be over the income limit, but your children likely qualify through Medi-Cal or CHIP.",
                es: "Los adultos podrían superar el límite, pero sus hijos probablemente califican mediante Medi-Cal o CHIP.",
              }
            : {
                en: `Your income is about ${ctx.percentOfFpl}% of the poverty line. Medi-Cal covers up to 138% for adults.`,
                es: `Su ingreso es aproximadamente el ${ctx.percentOfFpl}% del nivel de pobreza. Medi-Cal cubre hasta el 138% para adultos.`,
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
      en: "WIC supports pregnant people, new parents, and children under 5 with healthy food packages, infant formula, breastfeeding support, and referrals to other services. The income limit is 185% of the poverty line, and being on Medi-Cal or CalFresh usually qualifies you automatically.",
      es: "WIC apoya a personas embarazadas, padres nuevos y niños menores de 5 años con paquetes de alimentos saludables, fórmula infantil, apoyo con lactancia y referencias a otros servicios. El límite es el 185% del nivel de pobreza, y estar en Medi-Cal o CalFresh suele calificarlo automáticamente.",
    },
    documents: {
      en: ["Photo ID", "Proof of income or Medi-Cal/CalFresh card", "Proof of address", "Proof of pregnancy or child's age"],
      es: ["Identificación con foto", "Comprobante de ingresos o tarjeta de Medi-Cal/CalFresh", "Comprobante de domicilio", "Comprobante de embarazo o edad del niño"],
    },
    source: {
      label: { en: "California WIC Program", es: "Programa WIC de California" },
      url: "https://www.cdph.ca.gov/Programs/CFH/DWICSN/Pages/Program-Landing1.aspx",
    },
    applyUrl: "https://www.cdph.ca.gov/Programs/CFH/DWICSN/Pages/WIC-Find-a-Clinic.aspx",
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
    name: { en: "EITC + CalEITC — Tax Credits", es: "EITC + CalEITC — Créditos de impuestos" },
    tagline: {
      en: "Federal and California tax refunds for working households.",
      es: "Reembolsos de impuestos federales y de California para hogares que trabajan.",
    },
    description: {
      en: "California working families can claim both the federal Earned Income Tax Credit (EITC) and California's own CalEITC on the same tax return — potentially thousands of dollars back. About 1 in 5 eligible workers misses these credits every year. You claim them when you file taxes; free filing help is available through VITA sites.",
      es: "Las familias trabajadoras de California pueden reclamar tanto el EITC federal como el CalEITC de California en la misma declaración de impuestos — potencialmente miles de dólares de reembolso. Aproximadamente 1 de cada 5 trabajadores elegibles pierde estos créditos cada año.",
    },
    documents: {
      en: ["Social Security numbers (you, spouse, children)", "W-2 or 1099 income forms", "Last year's tax return (helpful)", "Bank account info for direct deposit"],
      es: ["Números de Seguro Social (usted, cónyuge, hijos)", "Formularios de ingresos W-2 o 1099", "Declaración de impuestos del año pasado (útil)", "Información bancaria para depósito directo"],
    },
    source: {
      label: { en: "CA FTB — CalEITC", es: "FTB de California — CalEITC" },
      url: "https://www.ftb.ca.gov/file/personal/credits/california-earned-income-tax-credit.html",
    },
    applyUrl: "https://www.irs.gov/credits-deductions/individuals/earned-income-tax-credit/use-the-eitc-assistant",
    evaluate: (h, ctx) => {
      const tier = Math.min(h.numChildrenUnder18, 3);
      const federalCeiling = EITC_INCOME_CEILING[tier];
      const calCeiling = CALEITC_CEILING[tier];
      const maxFederal = EITC_MAX_CREDIT[tier];
      const maxCal = CALEITC_MAX[tier];
      let status: EligibilityStatus;
      if (ctx.annualIncome <= 0) {
        status = "unlikely";
      } else if (ctx.annualIncome <= calCeiling) {
        status = "likely"; // qualifies for both
      } else if (ctx.annualIncome <= federalCeiling) {
        status = "maybe"; // federal only
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
          en: `Federal EITC up to $${maxFederal.toLocaleString()} + California CalEITC up to $${maxCal.toLocaleString()}.`,
          es: `EITC federal hasta $${maxFederal.toLocaleString()} + CalEITC de California hasta $${maxCal.toLocaleString()}.`,
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
      en: "California public schools offer free breakfast and lunch to children in households at or below 130% of the poverty line, and reduced-price meals up to 185%. Families on CalFresh qualify automatically. You apply once each school year through your child's school district.",
      es: "Las escuelas públicas de California ofrecen desayuno y almuerzo gratis a niños en hogares en o por debajo del 130% del nivel de pobreza, y comidas a precio reducido hasta el 185%. Las familias en CalFresh califican automáticamente.",
    },
    documents: {
      en: ["School meal application (from your child's school)", "Proof of income or CalFresh/Medi-Cal case number"],
      es: ["Solicitud de comidas escolares (de la escuela de su hijo)", "Comprobante de ingresos o número de caso de CalFresh/Medi-Cal"],
    },
    source: {
      label: { en: "CA Dept. of Education — School Meals", es: "Dept. de Educación de CA — Comidas Escolares" },
      url: "https://www.cde.ca.gov/ls/nu/sn/",
    },
    applyUrl: "https://www.cde.ca.gov/ls/nu/sn/flpapply.asp",
    evaluate: (h, ctx) => {
      if (!h.childrenInK12) {
        return {
          status: "unlikely",
          reason: { en: "This is for children currently in K–12 school.", es: "Esto es para niños actualmente en la escuela (K–12)." },
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
      en: "LIHEAP helps low-income California households pay their energy bills and can provide emergency help when a household faces disconnection. California's income limit is typically 60% of the state median income or 150% of the federal poverty line, whichever is higher.",
      es: "LIHEAP ayuda a hogares de bajos ingresos en California a pagar sus facturas de energía y puede brindar ayuda de emergencia cuando un hogar enfrenta desconexión. El límite de ingresos de California es típicamente el 60% del ingreso medio estatal o el 150% del nivel de pobreza federal.",
    },
    documents: {
      en: ["Photo ID", "Proof of income", "A recent utility/energy bill", "Proof of address"],
      es: ["Identificación con foto", "Comprobante de ingresos", "Una factura reciente de servicios/energía", "Comprobante de domicilio"],
    },
    source: {
      label: { en: "California LIHEAP", es: "LIHEAP de California" },
      url: "https://www.csd.ca.gov/Pages/LIHEAPProgram.aspx",
    },
    applyUrl: "https://www.csd.ca.gov/Pages/FindAssistance.aspx",
    evaluate: (_h, ctx) => {
      const status = byFpl(ctx.percentOfFpl, 150, 200);
      return {
        status,
        reason: {
          en: `Your income is about ${ctx.percentOfFpl}% of the poverty line. California's limit is around 150% FPL.`,
          es: `Su ingreso es aproximadamente el ${ctx.percentOfFpl}% del nivel de pobreza. El límite de California es alrededor del 150% FPL.`,
        },
      };
    },
  },

  // ---------------------------------------------------------------------------
  {
    id: "lifeline",
    name: { en: "Lifeline + ACP — Phone & Internet Help", es: "Lifeline + ACP — Ayuda de teléfono e internet" },
    tagline: {
      en: "Monthly discount on phone or internet service.",
      es: "Descuento mensual en el servicio de teléfono o internet.",
    },
    description: {
      en: "Lifeline provides a monthly discount on phone or internet service for eligible households. California's LifeLine program adds an extra state discount on top of the federal benefit. You qualify if your income is at or below 135% of the poverty line, or if you're already on CalFresh, Medi-Cal, or SSI.",
      es: "Lifeline ofrece un descuento mensual en el servicio de teléfono o internet. El programa LifeLine de California agrega un descuento estatal adicional. Califica si su ingreso está en o por debajo del 135% del nivel de pobreza, o si ya participa en CalFresh, Medi-Cal o SSI.",
    },
    documents: {
      en: ["Photo ID", "Proof of income OR proof of CalFresh/Medi-Cal/SSI enrollment"],
      es: ["Identificación con foto", "Comprobante de ingresos O comprobante de inscripción en CalFresh/Medi-Cal/SSI"],
    },
    source: {
      label: { en: "CA PUC — California LifeLine", es: "CA PUC — California LifeLine" },
      url: "https://www.cpuc.ca.gov/industries-and-topics/internet-and-phone/california-lifeline-program",
    },
    applyUrl: "https://www.californialifeline.com/en",
    evaluate: (_h, ctx) => {
      const status = byFpl(ctx.percentOfFpl, 135, 150);
      return {
        status,
        reason: {
          en: `Your income is about ${ctx.percentOfFpl}% of the poverty line, or you may qualify through CalFresh or Medi-Cal.`,
          es: `Su ingreso es aproximadamente el ${ctx.percentOfFpl}% del nivel de pobreza, o podría calificar mediante CalFresh o Medi-Cal.`,
        },
        estimate: {
          en: "Federal Lifeline: up to $9.25/month off your bill. California LifeLine adds more on top.",
          es: "Lifeline federal: hasta $9.25/mes de descuento. California LifeLine agrega más encima.",
        },
      };
    },
  },

  // ---------------------------------------------------------------------------
  {
    id: "ssi",
    name: { en: "SSI/SSP — Supplemental Security Income", es: "SSI/SSP — Ingreso de Seguridad Suplementario" },
    tagline: {
      en: "Monthly cash for people who are elderly, blind, or have a disability.",
      es: "Dinero mensual para personas mayores, ciegas o con discapacidad.",
    },
    description: {
      en: "SSI (federal) combined with California's SSP supplement provides monthly cash payments to people who are 65 or older, blind, or have a disability, and have limited income and resources. California's combined SSI/SSP payment is one of the highest in the country.",
      es: "SSI (federal) combinado con el suplemento SSP de California proporciona pagos mensuales en efectivo a personas de 65 años o más, ciegas o con discapacidad, y con ingresos y recursos limitados. El pago combinado SSI/SSP de California es uno de los más altos del país.",
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
      const eligible = h.someoneOver60;
      if (!eligible) {
        return {
          status: "unlikely",
          reason: {
            en: "SSI/SSP is primarily for people 65+, or those who are blind or have a qualifying disability.",
            es: "SSI/SSP es principalmente para personas de 65 años o más, o personas ciegas o con discapacidad.",
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
          en: "California SSI/SSP: up to $1,182/month for an individual (2024).",
          es: "SSI/SSP de California: hasta $1,182/mes para una persona (2024).",
        },
      };
    },
  },
];

export function getProgram(id: string): Program | undefined {
  return PROGRAMS.find((p) => p.id === id);
}
