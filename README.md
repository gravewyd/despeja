# Despeja

**See what government help you may qualify for, in plain language, in your language.**

I built Despeja because of a problem I saw through Tessera, a nonprofit that helps low-income families navigate government systems. A lot of people who qualify for assistance programs never apply, not because they're ineligible, but because the process is confusing, the language is hard to understand, and it's hard to even know where to start. Despeja tries to fix that.

The name is Spanish for *"it clears things up."*

---

## What it does

You answer seven questions about your household, state, size, income, and a few yes/no questions about your situation. Despeja runs those answers through each program's real eligibility rules and tells you which ones you likely qualify for, why, what documents you'll need, and where to apply.

It checks eleven California programs:

- **CalFresh**, food assistance (EBT card), up to 200% FPL in California
- **Medi-Cal**, free or low-cost health coverage, regardless of immigration status
- **WIC**, nutrition support for pregnancy and young children
- **EITC + CalEITC**, federal and California tax credits for working families
- **Free & Reduced School Meals**, breakfast and lunch through your child's school
- **LIHEAP**, help with energy bills
- **California LifeLine**, phone and internet discounts
- **SSI/SSP**, monthly cash for seniors and people with disabilities
- **CalWORKs**, monthly cash assistance for families with children
- **Covered California**, subsidized health insurance if you earn too much for Medi-Cal
- **CARE/FERA**, 20–35% discount on PG&E and utility bills

Each result includes:
- A **likely / maybe / probably not** verdict with a plain-language explanation
- An **estimated annual value** (how much it's actually worth in dollars)
- A **document checklist** (exactly what to bring when you apply)
- A direct link to the **official .gov source**
- An **Apply** button that goes straight to the real application

### The benefits cliff, visualized

Most screeners stop at the results page. Despeja adds something almost no other tool has: a real line chart showing how your total benefit value changes as your income rises. As you drag the income slider, an orange dot moves along the chart in real time, and the keep/lose list updates instantly. This visualizes the benefits cliff, the point where earning a little more can make a family worse off because they lose more in benefits than they gained in income. It's a real economic problem, and seeing it is more powerful than reading about it.

### Built for the long term

Life changes. A new baby, a job loss, a raise, a child starting school, any of these can change what you qualify for. Despeja has a "Did your situation change?" section at the bottom of results with buttons like "Had a baby," "Lost my job," and "Income went down" so users can re-run the screener any time things shift. The goal is that this becomes something a family keeps on their phone and uses over years, not just once.

### Print and save results

A single button generates a clean printable summary with all your results, document checklists, and apply links, something a family can physically bring to their appointment.

### Installable on any device

Despeja is a Progressive Web App. On Android it installs with one tap. On iPhone, a banner walks you through adding it to your home screen in Safari. Once installed it works offline. An "Install app" button in the corner gives device-specific instructions no matter what browser you're using.

### Private by design

No accounts. No database. No data leaves the browser. The eligibility logic runs entirely on the user's device. Nothing is stored anywhere.

### Bilingual

Every word of the app, every label, question, program description, and disclaimer, is available in English and Spanish with one tap.

---

## How I built it

Despeja is a full-stack TypeScript app on **Next.js 14** (App Router), styled with **Tailwind CSS**. There's no database, the eligibility engine is pure logic that runs in the browser. The benefits cliff chart uses Chart.js loaded client-side.

```
app/
  page.tsx              Header, language toggle, footer, PWA install prompt
  layout.tsx            Fonts, metadata, PWA setup, service worker registration
  globals.css           Design tokens, base styles, print styles
  api/explain/route.ts  Optional AI explanation (server-side, graceful fallback)

components/
  BenefitsTool.tsx      The three-phase flow: intro → screening → results
  Screening.tsx         Steps through each question one at a time
  QuestionCard.tsx      Renders each question type (dropdown, stepper, currency, yes/no)
  ProgressBar.tsx       Shows which step you're on
  Results.tsx           Summary + program cards + cliff chart + income slider
  ProgramCard.tsx       One expandable program result card
  CliffChart.tsx        Benefits cliff line chart with live income marker
  IncomePreview.tsx     Income slider + keep/lose list (synced to chart)
  LifeChangePrompt.tsx  "My situation changed" re-screener
  PrintResults.tsx      Printable/saveable results summary
  InstallPrompt.tsx     Universal "Install app" button + device-specific modal
  LanguageToggle.tsx    EN / ES switch
  icons.tsx             Inline SVG icons

lib/
  programs.ts           All 11 programs + their eligibility rules   ← main data file
  eligibility.ts        screen(): runs every program against the household
  fpl.ts                Federal Poverty Level math (update every January)
  i18n.ts               All English/Spanish strings
  types.ts              Shared TypeScript types
  brand.ts              App name in one place

public/
  manifest.json         PWA manifest (makes it installable on phone)
  sw.js                 Service worker (enables offline use)
  icon-192.png          App icon
  icon-512.png          App icon (large)
```

The core of the app is the `screen()` function in `lib/eligibility.ts`. It takes a household object, runs each program's `evaluate()` function against it, and returns a sorted list of results. No hidden state, no server calls, completely predictable. The chart in `CliffChart.tsx` runs the same function across a range of incomes to build the curve, then updates a marker in real time as the slider moves.

---

## Running it locally

Requires Node.js 18.17+.

```bash
npm install
npm run dev   # opens at http://localhost:3000
```

---

## Optional: AI "Explain this simply" button

The app works fully without this, clicking the button shows a hand-written plain-language description for every program. To upgrade it to a personalized AI explanation, copy `.env.example` to `.env.local` and add an Anthropic API key:

```
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-4-6
```

The key stays on the server and never reaches the browser. If no key is set, the fallback descriptions always show instead, so the app works for an unlimited number of users at zero cost.

---

## Deploying

Push to GitHub and import into **Vercel**. It deploys automatically. No environment variables are required for the app to work.

---

## Acknowledgments

Inspired by the work of **Tessera**, a nonprofit dedicated to helping low-income families navigate government systems with dignity.

> *"Despeja" means "it clears things up" in Spanish.*
