# Ghent Crawl

A pub-crawl follower for one night in Ghent: a splash screen, then a live map with one card per stop and a
**Next pub** button. Progress is saved per phone (localStorage).

Stops, in order (edit them in [`lib/stops.ts`](lib/stops.ts)): Café Den Turk → Het Waterhuis aan de Bierkant →
Dulle Griet → Friet & Bar Sympa (food) → Trollekelder → Afsnis. Pin coordinates are approximate; the 🧭 Go button
opens Google Maps walking directions by name + address.

## Run it locally

```bash
npm install
npm run dev          # http://localhost:3000
```

- Admin: `/abbot` (local password `abbot`).
- Reset your own progress: *Start again* on the finale, or clear site data.

## The quiz

Players type a first name once, then answer two questions at each pub. Questions and answers live in
[`lib/questions.ts`](lib/questions.ts) and every answer is marked automatically, ignoring case, accents and small typos:

- `Alan Shearer / Shearer`: "/" separates accepted alternatives.
- `multi`: items separated by ",", a point for each one named. Only a player's first as many guesses as there are
  items count.
- `options`: multiple choice; the answer must be one of the options, copied exactly.

`/abbot` lists players with their scores and can delete one. *Wipe players* deletes every name and answer. Do it after the
night.

## Deploy to Vercel

Set `ABBOT_SECRET` and `SESSION_SECRET` (`openssl rand -base64 32`). The Neon database and Blob store from the old
quiz are still wired up; the quiz needs the database (`DATABASE_URL`), and `npm run build` migrates it.
