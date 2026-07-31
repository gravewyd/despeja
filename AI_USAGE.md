# AI Usage Disclosure for Despeja

## 1. AI as a coding assistant (during development)

- We used an AI assistant (Anthropic's Claude) to help **write parts of the codebase** and to explain concepts as we built.
- We reviewed the code, understand how it works, and can explain any file — especially `lib/eligibility.ts` (the screening engine) and `lib/programs.ts` (the program rules).
- The idea, the program rules and thresholds, the design decisions, and the testing/verification are our responsibility.

## 2. AI as a feature inside the app (optional, runtime)

The app has **one optional AI feature**: the **"Explain this simply"** button on a program result.

- It calls Anthropic's API **server-side** (`app/api/explain/route.ts`).
- The model is given **only** the selected program's verified description and official source, and is instructed to use nothing else, invent no rules or numbers, and note that results are estimates.
- **The app works fully without it.** With no API key, the button returns our own built-in plain-language description instead. The eligibility logic itself is **100% our own rule-based code, no AI.**
- **No personal information** is sent to the API. Only the program id and rough figures (household size, approximate % of the poverty line) are included.

## 3. What is not AI

- The eligibility screening (which programs you may qualify for, and why) is **deterministic code we wrote** in `lib/eligibility.ts` + `lib/programs.ts`.
- The "What if my income changes?" preview re-runs that same code — no AI.
- The bilingual text, the UI, and the privacy design are ours.
