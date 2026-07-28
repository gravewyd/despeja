# Despeja

**See what government help you may qualify for — in plain language, in your language.**

I built Despeja because of a problem I saw through Tessera, a nonprofit that helps low-income families navigate government systems. A lot of people who qualify for assistance programs never apply — not because they're ineligible, but because the process is confusing, the language is hard to understand, and it's hard to even know where to start. Despeja tries to fix that.

The name is Spanish for *"it clears things up."*

---

## What it does

You answer seven questions about your household — state, size, income, and a few yes/no questions about your situation. Despeja runs those answers through each program's real eligibility rules and tells you which programs you likely qualify for, why, what documents you'll need, and where to apply.

It checks eight California programs:

- **CalFresh** — food assistance (EBT card)
- **Medi-Cal** — free or low-cost health coverage
- **WIC** — nutrition support for pregnancy and young children
- **EITC + CalEITC** — federal and California tax credits for working families
- **Free & Reduced School Meals** — breakfast and lunch through your child's school
- **LIHEAP** — help with energy bills
- **California LifeLine** — phone and internet discounts
- **SSI/SSP** — monthly cash for seniors and people with disabilities

Each result includes:
- A **likely / maybe / probably not** verdict with a plain-language explanation
- An **estimated value** (how much it's worth)
- A **document checklist** (exactly what to bring when you apply)
- A direct link to the **official .gov source**
- An **Apply** button that goes straight to the real application

### The income change preview

Most screeners stop at the results page. Despeja adds one more feature: a slider that shows how a raise or fewer hours would change what you qualify for. This is called the **benefits cliff** — the point where earning a little more can actually make a family worse off because they lose more in benefits than they gained in income. It's a real problem that discourages work, and it's something almost no tool visualizes clearly.

### Built-in for the long term

Life changes. A new baby, a job loss, a raise, a child starting school — any of these can change what you qualify for. Despeja has a "Did your situation change?" section at the bottom of results so users can re-run the screener any time things shift. The goal is that this becomes something a family actually keeps on their phone and uses over time, not just once.

### Private by design

No accounts. No database. No data leaves the browser. The eligibility logic runs entirely on the user's device.

### Bilingual

Every word of the app is available in English and Spanish with one tap.

---

## How I built it

Despeja is a full-stack TypeScript app on **Next.js 14** (App Router), styled with **Tailwind CSS**. There's no database — the eligibility engine is pure logic that runs in the browser.

```
app/
  page.tsx              Header, language toggle, footer
  layout.tsx            Fonts, metadata, PWA setup
  globals.css           Design tokens, base styles
  api/explain/route.ts  Optional AI explanation (server-side, graceful fallback)

components/
  BenefitsTool.tsx      The three-phase flow: intro → screening → results
  Screening.tsx         Steps through each question one at a time
  QuestionCard.tsx      Renders each question type (dropdown, stepper, currency, yes/no)
  ProgressBar.tsx       Shows which step you're on
  Results.tsx           Summary + program cards + income preview
  ProgramCard.tsx       One expandable program result
  IncomePreview.tsx     The benefits cliff slider
  LifeChangePrompt.tsx  "My situation changed" re-screener
  PrintResults.tsx      Printable/saveable results summary
  InstallPrompt.tsx     "Add to Home Screen" PWA banner
  LanguageToggle.tsx    EN / ES switch
  icons.tsx             Inline SVG icons

lib/
  programs.ts           All 8 programs + their eligibility rules   ← main data file
  eligibility.ts        screen(): runs every program against the household
  fpl.ts                Federal Poverty Level math (update every January)
  i18n.ts               All English/Spanish strings
  types.ts              Shared TypeScript types
  brand.ts              App name in one place

public/
  manifest.json         PWA manifest (makes it installable)
  sw.js                 Service worker (enables offline use)
  icon-192.png          App icon
  icon-512.png          App icon (large)
```

The core of the app is the `screen()` function in `lib/eligibility.ts`. It takes a household object, runs each program's `evaluate()` function against it, and returns a sorted list of results. That's it. No hidden state, no server calls, completely predictable.

---

## Running it locally

Requires Node.js 18.17+.

```bash
npm install
npm run dev   # opens at http://localhost:3000
```

---

## Optional: AI "Explain this simply" button

The app works fully without this. To enable it, copy `.env.example` to `.env.local` and add an Anthropic API key:

```
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-4-6
```

The key stays on the server. If no key is set, the button falls back to the built-in plain-language description — so the app always works.

---

## Deploying

Push to GitHub and import into **Vercel**. It deploys automatically. No environment variables required for the app to work.

---

## Acknowledgments

Inspired by the work of **Tessera**, a nonprofit dedicated to helping low-income families navigate government systems with dignity.

> *"Despeja" means "it clears things up" in Spanish.*
