# CLAUDE.md

Guidance for Claude Code when working in this repo. See `PRODUCT.md` for the
product spec, schema, and build order.

## Project layout

- `vercel-claude/` — the React + Vite frontend. All app code lives here.
- `/api` — Vercel serverless functions (repo root, sibling to
  `vercel-claude/`). Folder/file names must not contain spaces.
- `vercel.json` (repo root) — build config + SPA rewrites. `/api/*` is
  excluded from the SPA rewrite so serverless functions keep working.

## Conventions

- **Secrets**: never commit secrets. Frontend env vars are `VITE_*` and live
  in `vercel-claude/.env` (gitignored, see `.env.example`). Server-side
  secrets (Claude API key, Razorpay keys) are Vercel environment variables
  read only inside `/api` functions — never bundled into the client.
- **Auth**: Firebase Google sign-in via `signInWithPopup`, auth state via
  `onAuthStateChanged` (see `src/firebase.js`). Always handle the
  "Firebase not configured" case gracefully — the app must never render a
  blank screen if env vars are missing (`isFirebaseConfigured` flag).
- **Payments**: Razorpay signature verification happens server-side in
  `/api` only, never trusted from the client.
- **AI variation generation**: one PYQ variation per Claude API call.
  Batching multiple questions in one call has caused JSON truncation before
  — don't do it. Model: `claude-sonnet-4-6`, `max_tokens: 1000`. When parsing
  the response, strip ` ```json ` fences and slice from the first `{` to the
  last `}` before `JSON.parse`.
- **Accessibility**: WCAG AA minimum. Check colour contrast against the
  palette in `PRODUCT.md`, ensure visible focus states (`:focus-visible`),
  and use semantic HTML / ARIA roles for dynamic status messages.

## Content / legal

- PYQs (questions + official NTA answers) are fine to store verbatim.
- Never ingest NCERT textbook text. AI-generated variations should test the
  underlying *concept* against the public NTA syllabus, in our own words.
- Write our own explanations — don't copy coaching-institute material.

## Working in `vercel-claude/`

```
cd vercel-claude
npm install
npm run dev      # local dev server
npm run build    # production build, must stay green
npm run lint
```
