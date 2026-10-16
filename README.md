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

- Admin: `/abbot` (local password `abbot`). Currently a placeholder for a future Mr & Mrs round.
- Reset your own progress: *Start again* on the finale, or clear site data.

## Deploy to Vercel

Set `ABBOT_SECRET` and `SESSION_SECRET` (`openssl rand -base64 32`). The Neon database and Blob store from the old
quiz are still wired up (`lib/db`, `lib/photos.ts`) for the Mr & Mrs round, but the crawl itself needs neither.
