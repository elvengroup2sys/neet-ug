# NeetDrill — Product Register

## What this is

A web app for NEET-UG aspirants (India's medical entrance exam, ~20 lakh
students/year) that pairs verified Previous Year Questions (PYQs) with
unlimited AI-generated adaptive practice.

**Core loop:** student attempts a real, verified PYQ → if wrong, AI generates
a fresh variation testing the same underlying concept → student drills
variations until the concept is mastered → a weak-topics dashboard tracks
focus areas over time.

**Differentiator:** incumbents (PrepLadder, PrePG, etc.) sell static, finite
question banks. Nobody offers infinite, adaptive, concept-level drilling.

**Founder:** clinician-founded. Priced ₹199–399/month vs. competitors'
₹1,500–2,000/month.

## Stack

- React + Vite (`vercel-claude/`)
- Firebase: Auth (Google sign-in) + Firestore
- Vercel serverless functions (`/api`, repo root, no spaces in folder names)
- Razorpay subscriptions

Modeled on the founder's existing live "DNB PYQ App" — reuse its proven
patterns: `onAuthStateChanged` for auth state, all secrets in env vars,
serverless functions for anything that needs an API key, payment signatures
verified server-side only.

## Firestore schema

```
users/{uid}
  subscriptionStatus: "free" | "premium"
  subscriptionExpiry: timestamp
  email: string

pyqs/{id}
  year: number
  subject: string
  topic: string
  subtopic: string
  question: string
  options: { A, B, C, D }
  correctAnswer: "A" | "B" | "C" | "D"
  explanation: string
  concept: string
  difficulty: string

progress/{uid}
  attempted: { [pyqId]: "correct" | "wrong" }
  weakTopics: string[]
  lastStudied: timestamp

flags/{id}
  questionText: string
  reportedBy: string (uid)
  reason: string
  createdAt: timestamp
```

## Legal grounding

- NEET PYQs (exam facts/questions) are usable.
- **Do not** ingest NCERT textbook text into the database — NCERT's 2024
  advisory threatens action for commercial use. Generate AI questions that
  test concepts aligned to the public NTA syllabus instead.
- **Do not** reproduce coaching-institute explanations — write our own.
- Use official NTA answer keys to validate correct answers.

## Brand

- Name: **NeetDrill**
- Tone: energetic, motivating, exam-day-confidence. Speak to the student
  directly ("you"), short sentences, no jargon.
- Accessibility: WCAG AA minimum across the app — colour contrast, focus
  states, keyboard navigation, semantic HTML.
- Palette: warm off-white background, deep orange primary (`#C2410C`), deep
  navy text (`#1B2A4A`), emerald accent (`#047857`) for "correct"/positive
  states.

## Build order

1. ~~Frontend scaffold (auth shell, deploy pipeline)~~
2. PYQ practice flow — attempt question, reveal verified answer + explanation
3. `api/generate-variation.js` — server-side Claude call generating ONE
   variation of a PYQ testing the same concept
   - one question per call (batching causes JSON truncation)
   - server-side only, API key never exposed to the client
   - parse robustly: strip ` ```json ` fences, slice first `{` to last `}`
   - model `claude-sonnet-4-6`, `max_tokens: 1000`
4. Progress tracking + "flag this question" button
5. **Phase 2** — adaptive engine: auto-surface variations of wrong concepts,
   spaced repetition
6. **Phase 3** — Razorpay subscriptions + freemium gating: 10 PYQs + 3
   variations/day free, unlimited on paid plans

## Status

- [x] Repo scaffold, Vite + React app builds and runs
- [x] Firebase Auth (Google) + Firestore wiring, env-driven config
- [ ] Firebase project created
- [ ] Vercel project connected / first deploy
- [ ] PYQ practice flow
- [ ] AI variation generator
- [ ] Progress tracking + flagging
- [ ] Adaptive engine (Phase 2)
- [ ] Razorpay + freemium gating (Phase 3)
