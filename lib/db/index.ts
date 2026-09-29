import "server-only";
import path from "node:path";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export type Db = NeonHttpDatabase<typeof schema>;

// Production/preview: a Neon Postgres URL (set by the Vercel ↔ Neon integration).
// Local dev and tests: embedded PGlite — "pglite://./.pglite" (on disk) or "pglite://memory".
const url = process.env.DATABASE_URL ?? (process.env.VERCEL ? missing() : "pglite://./.pglite");

function missing(): never {
  throw new Error("DATABASE_URL is not set — add a Neon database to this Vercel project (Storage → Neon).");
}

let dbPromise: Promise<Db> | undefined;

export function getDb(): Promise<Db> {
  dbPromise ??= connect();
  return dbPromise;
}

async function connect(): Promise<Db> {
  if (!url.startsWith("pglite://")) {
    const { neon } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-http");
    return drizzle(neon(url), { schema });
  }

  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const dir = url.slice("pglite://".length);
  const db = drizzle(dir === "memory" ? new PGlite() : new PGlite(dir), { schema });
  await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  // Both drivers expose the same query-builder API; we only type against one.
  return db as unknown as Db;
}
