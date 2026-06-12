# Despeja

Despeja helps people see what government help they might qualify for, in plain language and in their own language.

You answer a few quick questions and Despeja shows which programs your household may qualify for, why you might qualify, what papers to bring and where to apply. You can read all of it in English or Spanish. It also does one thing most benefit checkers skip. A small slider called "What if my income changes" that shows how a raise or fewer hours would change what you qualify for. People call that the benefits cliff and it scares a lot of families away from taking more work.

"Despeja" is Spanish for "it clears things up."

We built this for the Congressional App Challenge. It is not connected to any government agency and it gives plain language estimates, not official decisions. Always check with the real program before you count on a result.

## What it does

The benefits checker covers seven common programs. SNAP, Medicaid and CHIP, WIC, the Earned Income Tax Credit, free or reduced school meals, LIHEAP and Lifeline. For each one you get a simple likely, maybe or probably not result, a plain reason, an estimated value, the documents you will need, a link to the official .gov source and a link to apply.

There is an optional "Explain this simply" button. It rewrites a result in plainer words. We only hand the AI that program's checked facts and its official source and we tell it to make nothing up. If no AI key is set up the app just uses our own description instead, so it always works.

The "What if my income changes" preview runs the same eligibility logic again as you drag the slider, so you can watch which programs you would keep and which ones you might lose.

Everything is bilingual with one tap, English and Spanish.

It is private on purpose. There are no accounts and no database. Nothing about the household ever leaves the browser. The optional AI button only sends the program name and rough numbers, never anything that could identify a person.

## Run it

You need Node.js version 18.17 or newer. Install the packages and start it.

```bash
npm install
npm run dev
```

That runs it on your own computer at localhost on port 3000. To build the production version run this instead.

```bash
npm run build && npm start
```

### Turning on the AI button (optional)

The app works fully without this. If you want the "Explain this simply" button, copy `.env.example` to a new file called `.env.local` and add your Anthropic key.

```
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-5-sonnet-latest
```

You can confirm current model names at https://docs.claude.com/en/docs/about-claude/models and the key stays on the server so it never reaches the browser.

### Putting it online

We deploy it on Vercel. You import the repo and it works right away. If you want the AI button live too, add those same two values in the Vercel dashboard under Environment Variables.

## How we built it

It is a full stack TypeScript app built on Next.js with the App Router and styled with Tailwind CSS. There is no database. Here is a quick map of the project.

```
app/layout.tsx             fonts and page setup
app/page.tsx               the header, the language switch and the footer
app/globals.css            colors, base styles and accessibility
app/api/explain/route.ts   the optional AI explanation, runs on the server

components/BenefitsTool.tsx the flow from intro to questions to results
components/Screening.tsx    the questions, one at a time
components/QuestionCard.tsx one question (a dropdown, a counter, money or yes or no)
components/Results.tsx      the summary, the program cards and the income preview
components/ProgramCard.tsx  one program result you can open up
components/IncomePreview.tsx  the what if my income changes slider
components/LanguageToggle.tsx english and spanish switch
components/icons.tsx        the little SVG icons

lib/programs.ts   the seven programs and their rules, this is the main data file
lib/eligibility.ts the screen function that runs every rule against a household
lib/fpl.ts         the poverty line math, update this once a year
lib/states.ts      the list of US states
lib/i18n.ts        all of the english and spanish text
lib/types.ts       the shared types
lib/brand.ts       the app name, in one place
```

The engine is small and predictable on purpose. The screen function takes a household, runs each program's rule and gives back the results sorted with the strongest matches first. There is no hidden state so it is easy to read and easy to explain to a judge.

## Make it accurate before you submit

The income limits and dollar amounts in here are close estimates so the app runs right away, and we left a comment on every one of them. Two files matter most.

1. lib/fpl.ts has the Federal Poverty Level numbers. They change every January and they are higher in Alaska and Hawaii. Check them against the HHS link inside the file.
2. lib/programs.ts has each program's income cutoffs, for example SNAP around 130 percent and Medicaid around 138 percent, plus the estimates. Confirm the current numbers and your own state's rules using the official link in each program.

Fixing these for your state is the best way to make Despeja really useful and really yours.

## Accessibility

You can use the whole thing with just a keyboard, the focus outlines are easy to see, every control has a label, the toggles and the progress bar tell screen readers what they are, the colors always come with text so meaning never rides on color alone and motion calms down if your device asks for that.

## Changing the name

The name only lives in lib/brand.ts. Change APP_NAME there and the whole app updates.

## Congressional App Challenge checklist

1. Check the poverty numbers in lib/fpl.ts and the program limits in lib/programs.ts for your state.
2. Read AI_USAGE.md and make sure it honestly says how you used AI.
3. Record the demo video, 1 to 3 minutes, and post it public on YouTube or Vimeo.
4. Be ready to walk a judge through eligibility.ts and programs.ts and explain how a result is made.
