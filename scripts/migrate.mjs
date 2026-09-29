// Runs Drizzle migrations against Neon during `npm run build` (i.e. on every Vercel deploy).
// Skipped when there is no Postgres URL — local dev uses PGlite, which migrates itself on startup.
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

const url = process.env.DATABASE_URL;
if (!url || url.startsWith("pglite://")) {
  console.log("migrate: no Postgres DATABASE_URL, skipping");
} else {
  await migrate(drizzle(neon(url)), { migrationsFolder: "./drizzle" });
  console.log("migrate: done");
}
