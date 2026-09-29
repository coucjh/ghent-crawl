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
- `image: "/media/p1.jpg"` on any question makes it a picture question. Put images in `public/media/` with neutral
  names (the filename is visible to players).
- `type: "music"` questions have a `clip` plus accepted `artist` and `song` answers; each box scores separately.
  Clips play once per phone.
- `PILGRIMAGES` are answered on the road: each opens with Station `opensWith` and closes (and is marked) when Station
  `closesWith` opens.
- `type: "photo"` questions show an `image` (e.g. a painting to re-enact); each Order sends one photo and the Abbots
  crown the best, which alone scores (5 points unless `points` says otherwise).

### Music clips

Put the full songs in `media-src/` (git-ignored), list them in `media-src/clips.json`
(`{ "id": "m1", "source": "song.mp3", "start": "0:45", "seconds": 8 }`, default 10 seconds), then run
`npm run clips`. It cuts each clip into `public/media/<id>.mp3` and strips the embedded title/artist so phones can't
show the answer. Needs ffmpeg (`brew install ffmpeg`).

## Deploy to Vercel

1. Push this repo to GitHub and import it in Vercel.
2. In the Vercel project: **Storage → Create → Neon** (pick an EU region, e.g. Frankfurt). This sets `DATABASE_URL`
   and gives every Preview deployment its own database branch.
3. **Storage → Create → Blob** (EU region, **private** access if asked) for the photo challenges. This sets
   `BLOB_READ_WRITE_TOKEN`. Without it, photo uploads on Vercel fail with a message saying so.
4. **Settings → Environment Variables**: set `ABBOT_SECRET` (the Abbots' password) and `SESSION_SECRET`
   (`openssl rand -base64 32`) for Production and Preview.
5. Deploy. `npm run build` runs the database migrations first.

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

## What's next

See [docs/PLAN.md](docs/PLAN.md) for every design decision so far and the phase 2 plan (picture round, the Pilgrimage,
music questions, photo challenges).
