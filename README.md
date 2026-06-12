# Despeja

**See what government help you may qualify for — in plain language, in your language.**

Despeja asks a few simple questions and shows which assistance programs a household may qualify for, *why*, what documents to bring, and where to apply — in English or Spanish. It then does one thing most benefit screeners don't: a **"What if my income changes?"** preview that shows how a raise or fewer hours would change what you qualify for (the "benefits cliff").

*"Despeja" is Spanish for "it clears (things) up."*

> Built as a Congressional App Challenge project. It is **not** affiliated with any government agency and gives **plain-language estimates, not official decisions**.

---

## What it does

- **Benefits checker.** Seven common programs — SNAP, Medicaid/CHIP, WIC, EITC, free/reduced school meals, LIHEAP, and Lifeline — each with a likely / maybe / probably-not result, a plain reason, an estimated value, the documents you'll need, the **official .gov source**, and an apply link.
- **"Explain this simply" (optional AI).** Rewrites any result in plainer language. The model is given **only** that program's verified facts and official source and told to invent nothing. Works without AI too — it falls back to the built-in description.
- **"What if my income changes?" preview** *(the extra feature)*. A slider re-runs the same eligibility engine live, showing which programs you'd keep or lose as income changes.
- **Bilingual** English / Spanish, one tap.
- **Private by design.** No accounts. No database. Nothing about the household leaves the browser. (The optional AI call sends only the program id + rough numbers, never identifying info.)

---

## Run it

Requires Node.js 18.17+.

```bash
npm install
npm run dev          # http://localhost:3000
```

Production:

```bash
npm run build && npm start
```

### Optional: turn on the AI "Explain" button

The app is fully usable without this. To enable it, copy `.env.example` to `.env.local` and add an Anthropic API key:

```
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-5-sonnet-latest
```

(Confirm current model names at https://docs.claude.com/en/docs/about-claude/models.) The key stays on the server.

### Deploy

Pushing the repo to **Vercel** and importing it works out of the box. Add the two environment variables in the Vercel dashboard if you want the AI button.

---

## How it's built

Full-stack **TypeScript** on **Next.js** (App Router) with **Tailwind CSS**. No database.

```
app/
  layout.tsx            Fonts + page metadata
  page.tsx              Header, language state, footer
  globals.css           Design tokens, base styles, accessibility
  api/explain/route.ts  Optional AI explanation (server-side, with fallback)
components/
  BenefitsTool.tsx      The flow: intro -> screening -> results
  Screening.tsx         Question-by-question form
  QuestionCard.tsx      One question (select / stepper / currency / yes-no)
  ProgressBar.tsx
  Results.tsx           Summary + program cards + income preview
  ProgramCard.tsx       One program result (expandable)
  IncomePreview.tsx     The "what if my income changes?" feature
  LanguageToggle.tsx    EN / ES
  icons.tsx             Inline SVG icons
lib/
  programs.ts           The 7 programs + the rules for each   <-- main data file
  eligibility.ts        screen(): runs every program's rule against a household
  fpl.ts                Federal Poverty Level math            <-- update yearly
  states.ts             US state list
  i18n.ts               All English/Spanish text
  types.ts              Shared types
  brand.ts              The app name (change it in one place)
```

The engine is deliberately simple and **pure**: `screen(household)` maps each program's `evaluate()` rule over the household and returns a sorted result list. No hidden state, easy to read, easy to defend.

---

## ⚠️ Make it accurate (do this before you submit)

The income thresholds and dollar figures shipped here are **approximate**, so the app runs out of the box. They are clearly commented. Two files to check:

1. **`lib/fpl.ts`** — the Federal Poverty Level numbers. They change every January and are higher in Alaska and Hawaii. Verify against the HHS guidelines linked in the file.
2. **`lib/programs.ts`** — each program's income cutoffs (e.g. SNAP ~130%, Medicaid ~138%) and estimates. Confirm the current numbers (and your state's rules) against the official source linked in each program.

Correcting these for your state is the single best way to make the app genuinely useful — and genuinely yours.

---

## Accessibility

Keyboard-navigable, visible focus rings, labeled controls, `aria` states on toggles and progress, semantic colors that also carry text labels (not color alone), and `prefers-reduced-motion` support.

---

## Renaming the app

The name lives only in `lib/brand.ts`. Change `APP_NAME` and the whole app updates.

---

## Congressional App Challenge checklist

- [ ] Verify FPL numbers (`lib/fpl.ts`) and program thresholds (`lib/programs.ts`) for your state.
- [ ] Read `AI_USAGE.md` and make sure it honestly describes how you used AI.
- [ ] Record the demo video (1–3 min, public on YouTube/Vimeo) — see the script you were given.
- [ ] Be ready to walk a judge through `eligibility.ts` and `programs.ts` and explain how a result is produced.
