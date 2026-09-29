# The Plan

Decisions made while designing the Ghent Abbey Crawl, and what comes next. Difficulty: 🟢 easy · 🟡 medium · 🔴 hard.

## The event

- One night in Ghent for friends: 16 players in **4 Orders** (teams) of ~4, plus **2 Abbots** (admins, not playing).
- Everyone travels together through **5 Stations** (pubs). No accounts; Abbots share one secret.
- Full monastic wording for players (Orders, Stations, the Word, the Book of Judgement); plain names in code.
- Look: Belgian abbey beer label — parchment, oxblood, gold; Grenze Gotisch headings, EB Garamond body; wax seals.

## Built (phase 1)

| Feature | Decision |
|---|---|
| Joining | Found an Order (name, emoji emblem, first name) or join one from a dropdown. Max 4 Orders. Joining locks when Station I opens; rejoining with the same name restores your place. |
| A Station | Abbot opens it → Orders speak **the Word** (a passcode the barkeep holds) → answer on one scrolling manuscript, auto-saved, last save wins → optionally **Seal** early → Abbot closes it. One Station open at a time, in order. |
| Last Orders | Abbot starts a 2-minute countdown (a draining pint); the Station closes itself at zero. |
| Marking | On close: free text fuzzy-matched (case, accents, articles, small typos), choices exact. Scores publish instantly. Orders see marked answers and may **Appeal**; Abbots grant or deny. |
| Book of Judgement | A race (one lane per Order, one track segment per Station) plus the ranked list. Replays the last round's movement. Sealed once the final Station opens; Abbots reveal it last-to-first with confetti. |
| Abbot tools | Grant entry without the Word, rename/delete Orders, Reset the Abbey. |
| Stack | Next.js on Vercel, Neon Postgres (EU), Drizzle. Deploys on every push to `master`; Preview deploys get their own database branch. |

## Next (phase 2)

### 🖼️ Picture round 🟢
- Any question may have an `image`. A Station whose questions all have images *is* a picture round.
- Images live in `/public/media/`, named neutrally. Tap to enlarge.

### 🚶 The Pilgrimage 🟡
- **One** Pilgrimage for the whole night, answered between (and during) pubs.
- Opens automatically when **Station I** opens; closes automatically when **Station IV** opens. Both configurable in `content/quiz.ts`.
- No Word needed. Its own tab/screen, available whatever pub round is running.
- Holds any mix of normal questions, music questions and photo challenges.
- **Points stay hidden until it closes**, then land all at once. On the race it is its own segment between III and IV
  ("The run of the Pilgrimage").

### 🎵 Music questions 🟢
- A `music` question: one clip, two answer boxes — **Artist** and **Song**, 1 point each, fuzzy-marked.
- **One play per phone** (counted when it starts; pausing is fine). Not tamper-proof, by choice.
- ~10 songs. Clip length set per song, default **10 seconds**.
- `npm run clips`: reads a list (source file, start time, length) and uses ffmpeg to cut each clip, **strip the
  embedded title/artist tags**, and write `m1.mp3`, `m2.mp3`… to `/public/media/`.
- Full songs go in `media-src/` (git-ignored); only the short clips are committed. Keep the repo private.
- Test with free tracks (Kevin MacLeod / SoundHelix) until the real songs are bought.

### 📸 Photo challenges 🟡
- A `photo` question: the answer is a photo. One per challenge per Order; any member can upload or replace it until
  the Pilgrimage closes (replacing sends it back for marking).
- Resized on the phone (~1600px, ~300 KB) before upload. Stored in **Vercel Blob** (EU); a local-folder fallback in dev.
- Abbots mark ✅/❌ for the challenge's points as photos arrive, plus an optional ⭐ **best photo** bonus (+1, one Order
  per challenge). No appeals.
- Only Abbots and the Order that took it see a photo. **Reset the Abbey deletes all photos.**
- Needs a one-off Vercel setup: Storage → Blob.

## Ideas (not planned)

- 🦈 An engraved, bestiary-style shark that swims across when an Order takes the lead, or before the final reveal.
- Pour-and-foam when an Order seals its answers.
