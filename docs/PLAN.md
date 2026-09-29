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

## Phase 2 — built

### 🖼️ Picture round 🟢
- Any question may have an `image`. A Station whose questions all have images *is* a picture round.
- Images live in `/public/media/`, named neutrally. Tap to enlarge.

### 🚶 Two Pilgrimages 🟡
- Rounds answered between (and during) pubs. No Word, can't be sealed; each has its own page (`/pilgrimage/1`, `/2`).
- **The First Pilgrimage** opens with Station I and closes when Station III opens (music and questions).
- **The Painters' Pilgrimage** opens as Station III opens and closes when Station V opens (painting re-enactments).
- Open/close Stations are set per Pilgrimage in `content/quiz.ts`. The hand-over at III happens in one step.
- **Points stay hidden until a Pilgrimage closes**, then land all at once, each as its own segment of the race
  (I · II · ✦I · III · IV · ✦II · V). The Painters' points first appear in the final reveal, since the Book is sealed
  from the moment Station V opens.

### 🎵 Music questions 🟢 — built
- A `music` question: one clip, two answer boxes — **Artist** and **Song**, 1 point each, fuzzy-marked.
- **One play per phone** (counted when it starts; pausing is fine), remembered per player on that phone — so Reset
  the Abbey gives everyone fresh plays, while rejoining under the same name doesn't. Not tamper-proof, by choice.
- ~10 songs. Clip length set per song, default **10 seconds**.
- `npm run clips`: reads a list (source file, start time, length) and uses ffmpeg to cut each clip, **strip the
  embedded title/artist tags**, and write `m1.mp3`, `m2.mp3`… to `/public/media/`.
- Full songs go in `media-src/` (git-ignored); only the short clips are committed. Keep the repo private.
- Test with free tracks (Kevin MacLeod / SoundHelix) until the real songs are bought.

### 📸 Painting re-enactments 🟡
- A `photo` question shows a painting to re-enact (Ghent-based: the Ghent Altarpiece, Bosch in the MSK…). Two of
  them, meant as one per walk (III→IV, IV→V), though both stay open for the whole Pilgrimage.
- One photo per Order per painting; any member can send or replace it until the Pilgrimage closes. Replacing a
  crowned photo loses the crown.
- **The Abbots crown the single best photo per painting: 5 points, nobody else scores.** They can crown as photos
  arrive or after it closes; the crown can be moved. Revealing the Book with an uncrowned painting asks first.
- Resized on the phone (≤1600px JPEG, ~300 KB). Stored **privately** in Vercel Blob and served only through
  `/photos/…` to the Abbots and the Order that took it; a git-ignored `.uploads/` folder in local dev.
- No appeals. Deleting an Order or **Reset the Abbey deletes its photos**.
- Needs a one-off Vercel setup: Storage → Blob (see README).

## Ideas (not planned)

- 🦈 An engraved, bestiary-style shark that swims across when an Order takes the lead, or before the final reveal.
- Pour-and-foam when an Order seals its answers.
