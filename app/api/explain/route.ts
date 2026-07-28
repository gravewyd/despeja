// app/api/explain/route.ts
// Re-explains a benefit result in plain language. The model is given ONLY the
// verified program facts + official source and told to use nothing else. With
// no key, it returns our built-in description, so the app always works.
import { NextResponse } from "next/server";
import { getProgram } from "@/lib/programs";
import type { Language } from "@/lib/types";

export const runtime = "nodejs";

interface Body {
  programId: string;
  language: Language;
  facts: { householdSize: number; percentOfFpl: number; numChildrenUnder18: number; status: string };
}

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

  const fallback = program.description[lang];
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const model = process.env.ANTHROPIC_MODEL;
  if (!apiKey || !model) return NextResponse.json({ text: fallback, source: "fallback" });

  const languageName = lang === "es" ? "Spanish" : "English";
  const system = [
    "You are a careful benefits explainer inside an app called Despeja.",
    "You will be given verified facts about ONE U.S. assistance program and its official source.",
    `Write a short, warm explanation (2-4 sentences) in ${languageName} at about a 6th-grade reading level.`,
    "Use ONLY the facts provided. Never invent eligibility rules, dollar amounts, deadlines, or other programs.",
    "Do not give legal, tax, medical, or immigration advice.",
    "Make clear this is a preliminary estimate, not an official decision, and tell the reader to confirm at the official source.",
    "Output plain text only.",
  ].join("\n");
  const userMsg = [
    `Program: ${program.name.en}`,
    `Verified description: ${program.description.en}`,
    `Official source: ${program.source.label.en} — ${program.source.url}`,
    `Screening result: ${body.facts.status}. Household size: ${body.facts.householdSize}. Income ~${body.facts.percentOfFpl}% of the poverty line. Children under 18: ${body.facts.numChildrenUnder18}.`,
    "Write the explanation now.",
  ].join("\n");

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model, max_tokens: 400, system, messages: [{ role: "user", content: userMsg }] }),
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return NextResponse.json({ text: fallback, source: "fallback" });
    const data = await res.json();
    const text: string = Array.isArray(data?.content)
      ? data.content.filter((b: { type: string }) => b.type === "text").map((b: { text: string }) => b.text).join("\n").trim()
      : "";
    return NextResponse.json(text ? { text, source: "ai" } : { text: fallback, source: "fallback" });
  } catch {
    return NextResponse.json({ text: fallback, source: "fallback" });
  }
}
