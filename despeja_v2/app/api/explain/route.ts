// app/api/explain/route.ts
// Explains a benefit result in plain language.
// - If ANTHROPIC_API_KEY is set: uses Claude for a personalized explanation
// - If not: returns a rich built-in plain-language description (always works)
import { NextResponse } from "next/server";
import { getProgram } from "@/lib/programs";
import type { Language } from "@/lib/types";

export const runtime = "nodejs";

interface Body {
  programId: string;
  language: Language;
  facts: {
    householdSize: number;
    percentOfFpl: number;
    numChildrenUnder18: number;
    status: string;
  };
}

// Rich plain-language explanations — shown when no API key is set.
// These are written at a 6th grade reading level and are always accurate.
const PLAIN_DESCRIPTIONS: Record<string, Record<Language, string>> = {
  snap: {
    en: "CalFresh puts money on an EBT card (like a debit card) every month that you can use at most grocery stores. The amount depends on your household size and income. In California, the income limit is higher than most states, so more families qualify. You can apply online at BenefitsCal.com in about 10 minutes.",
    es: "CalFresh pone dinero en una tarjeta EBT (como una tarjeta de débito) cada mes que puedes usar en la mayoría de los supermercados. La cantidad depende del tamaño de tu hogar y tus ingresos. En California, el límite de ingresos es más alto que en la mayoría de los estados, por lo que más familias califican. Puedes solicitar en línea en BenefitsCal.com en unos 10 minutos.",
  },
  medicaid: {
    en: "Medi-Cal is California's free health insurance. It covers doctor visits, hospital stays, prescriptions, mental health care, and dental. As of 2024, all income-eligible Californians can qualify regardless of immigration status. Being on Medi-Cal also automatically qualifies your kids for CHIP (Children's Health Insurance).",
    es: "Medi-Cal es el seguro médico gratuito de California. Cubre visitas al médico, hospitalizaciones, medicamentos, salud mental y atención dental. Desde 2024, todos los californianos con ingresos elegibles pueden calificar sin importar su estatus migratorio. Estar en Medi-Cal también califica automáticamente a tus hijos para CHIP.",
  },
  wic: {
    en: "WIC gives you a monthly benefit to buy specific healthy foods like milk, eggs, whole grains, fruits, and vegetables. It also provides free infant formula, breastfeeding support, and connections to other programs. You apply at a local WIC office — appointments are usually available within a week.",
    es: "WIC te da un beneficio mensual para comprar alimentos saludables específicos como leche, huevos, granos integrales, frutas y verduras. También proporciona fórmula infantil gratuita, apoyo con la lactancia y conexiones con otros programas. Te aplicas en una oficina WIC local — las citas generalmente están disponibles dentro de una semana.",
  },
  eitc: {
    en: "The EITC and CalEITC are tax credits that put money back in your pocket when you file your taxes. The more children you have, the bigger the credit. If you've never claimed these before, you can file for up to 3 prior years and get that money back. Free tax help is available at VITA sites — search 'free tax help near me'.",
    es: "El EITC y el CalEITC son créditos fiscales que te devuelven dinero cuando presentas tus impuestos. Cuantos más hijos tengas, mayor es el crédito. Si nunca los has reclamado antes, puedes presentar hasta 3 años anteriores y recuperar ese dinero. Hay ayuda gratuita para impuestos en sitios VITA — busca 'ayuda gratuita para impuestos cerca de mí'.",
  },
  "school-meals": {
    en: "Free school meals means your child gets breakfast and lunch at school at no cost to you. You apply once at the start of each school year through your child's school or district website. If your family already gets CalFresh, you usually qualify automatically — just ask the school.",
    es: "Las comidas escolares gratuitas significan que tu hijo recibe desayuno y almuerzo en la escuela sin ningún costo. Te aplicas una vez al comienzo de cada año escolar a través del sitio web de la escuela o del distrito. Si tu familia ya recibe CalFresh, generalmente califica automáticamente — solo pregunta en la escuela.",
  },
  liheap: {
    en: "LIHEAP helps pay your electric, gas, or heating bill. California has both regular assistance (to lower monthly bills) and emergency help (if your power is about to be shut off). Apply through your county's Community Services Department — funds are limited and awarded first-come, first-served, so apply early in the year.",
    es: "LIHEAP ayuda a pagar tu factura de electricidad, gas o calefacción. California tiene tanto asistencia regular (para reducir las facturas mensuales) como ayuda de emergencia (si tu servicio está a punto de cortarse). Solicita a través del Departamento de Servicios Comunitarios de tu condado — los fondos son limitados y se otorgan por orden de llegada, así que solicita temprano en el año.",
  },
  lifeline: {
    en: "California LifeLine reduces your monthly phone or internet bill by $5.25 to $12.85, and if you're on CalFresh or Medi-Cal, you qualify automatically without an income check. You apply directly through your phone or internet provider. The whole process takes about 10 minutes and the discount shows up on your next bill.",
    es: "California LifeLine reduce tu factura mensual de teléfono o internet en $5.25 a $12.85, y si estás en CalFresh o Medi-Cal, calificas automáticamente sin verificación de ingresos. Te aplicas directamente a través de tu proveedor de teléfono o internet. Todo el proceso tarda unos 10 minutos y el descuento aparece en tu próxima factura.",
  },
  ssi: {
    en: "SSI/SSP sends a check every month to people who are 65 or older, blind, or have a disability, and have limited income. California's payment is one of the highest in the country — up to $1,182/month for a single person. You apply at your local Social Security office, or call 1-800-772-1213 to start the process by phone.",
    es: "SSI/SSP envía un cheque cada mes a personas de 65 años o más, ciegas o con una discapacidad, y con ingresos limitados. El pago de California es uno de los más altos del país — hasta $1,182/mes para una sola persona. Te aplicas en tu oficina local del Seguro Social, o llama al 1-800-772-1213 para iniciar el proceso por teléfono.",
  },
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const program = getProgram(body.programId);
  const lang: Language = body.language === "es" ? "es" : "en";
  if (!program) return NextResponse.json({ error: "Unknown program" }, { status: 404 });

  // Rich built-in plain-language text — always available, no API key needed
  const richFallback =
    PLAIN_DESCRIPTIONS[body.programId]?.[lang] ?? program.description[lang];

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const model = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";

  // No API key — return the rich built-in description
  if (!apiKey) {
    return NextResponse.json({ text: richFallback, source: "fallback" });
  }

  // API key present — use Claude for a personalized explanation
  const languageName = lang === "es" ? "Spanish" : "English";
  const system = [
    "You are a careful benefits explainer inside an app called Despeja.",
    "You will be given verified facts about ONE California assistance program.",
    `Write a short, warm, practical explanation (2-4 sentences) in ${languageName} at about a 6th-grade reading level.`,
    "Mention one concrete, actionable next step the person can take today.",
    "Use ONLY the facts provided. Never invent dollar amounts, deadlines, or rules.",
    "Do not give legal, tax, medical, or immigration advice.",
    "Make clear this is a preliminary estimate and they should confirm at the official source.",
    "Output plain text only. No bullet points or headers.",
  ].join("\n");

  const userMsg = [
    `Program: ${program.name.en}`,
    `Official description: ${program.description.en}`,
    `Official source: ${program.source.url}`,
    `Household: ${body.facts.householdSize} people, income ~${body.facts.percentOfFpl}% of poverty line, ${body.facts.numChildrenUnder18} children under 18.`,
    `Screening result: ${body.facts.status}.`,
    "Write the plain-language explanation now.",
  ].join("\n");

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: 300,
        system,
        messages: [{ role: "user", content: userMsg }],
      }),
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) return NextResponse.json({ text: richFallback, source: "fallback" });

    const data = await res.json();
    const text: string = Array.isArray(data?.content)
      ? data.content
          .filter((b: { type: string }) => b.type === "text")
          .map((b: { text: string }) => b.text)
          .join("\n")
          .trim()
      : "";

    return NextResponse.json(
      text ? { text, source: "ai" } : { text: richFallback, source: "fallback" }
    );
  } catch {
    return NextResponse.json({ text: richFallback, source: "fallback" });
  }
}
