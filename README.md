# The Ghent Abbey Crawl

A pub-crawl quiz for one night in Ghent. Four **Orders** (teams) travel together through five **Stations** (pubs).
At each, the barkeep holds **the Word** that unlocks that Station's questions. **The Abbots** (admins) open and
close each Station, settle **Appeals**, and finally reveal **the Book of Judgement** (leaderboard).

## Run it locally

```bash
npm install
npm run dev          # http://localhost:3000 — uses an embedded database in ./.pglite, no setup needed
npm test             # game rules + answer marking
```

- Players: open `/`. Add `?dev` (e.g. `/?dev`) to see each Station's Word on screen while testing (never in production).
- Abbots: open `/abbot`. Local password is `abbot`.
- Start over: *Reset the Abbey* at the bottom of `/abbot`, or delete `./.pglite`.

## Edit the quiz

Everything lives in [`content/quiz.ts`](content/quiz.ts): Station names, pubs, Words and questions.

- `type: "text"` questions list every accepted `answers`. Marking ignores case, accents, punctuation and a leading
  "the/de/het…", and forgives 1 typo (answers of 5+ letters) or 2 (8+). Numbers must be exact.
- `type: "choice"` questions list `options` and the one correct `answer`.
- `points` is optional (default 1).
- Correct answers never reach the browser until a Station closes.

## Deploy to Vercel

1. Push this repo to GitHub and import it in Vercel.
2. In the Vercel project: **Storage → Create → Neon** (pick an EU region, e.g. Frankfurt). This sets `DATABASE_URL`
   and gives every Preview deployment its own database branch.
3. **Settings → Environment Variables**: set `ABBOT_SECRET` (the Abbots' password) and `SESSION_SECRET`
   (`openssl rand -base64 32`) for Production and Preview.
4. Deploy. `npm run build` runs the database migrations first.

Rehearse on a Preview deployment, then press *Reset the Abbey* on Production before the night.

## How a Station runs

```
sealed ──Abbot: Open──► open ──Order speaks the Word──► answering ──(optional) Seal your answers
                          │
                          └──Abbot: Last Orders (2 min countdown, auto-closes) or Close now──► closed
closed: answers auto-marked, scores published, Orders may Appeal → Abbot grants/denies.
```

The Book of Judgement is visible between Stations, sealed once the final Station opens, and revealed by the Abbots.

## Code map

| Path | What |
|---|---|
| `lib/game.ts` | Every game rule. Pages and actions call these; nothing else touches the tables. |
| `lib/marking.ts` | Answer normalisation and fuzzy matching. |
| `lib/db/schema.ts` | Drizzle schema. After changing it: `npx drizzle-kit generate`. |
| `lib/session.ts` | Signed cookies for players and Abbots. |
| `app/actions.ts`, `app/abbot/actions.ts` | Server actions. |
| `components/` | UI. `WaxSeal` / `SealBreak` are the signature pieces. |

## Later phases

- **Picture round**: add an `image` field to questions, put images in `/public`.
- **Music round**: Abbots play clips over the bar's speaker, phones just collect answers.
- **Pilgrimages** (photo challenges between pubs): Vercel Blob uploads + an Abbot review screen.
