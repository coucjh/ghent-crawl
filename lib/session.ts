import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getPlayer } from "./game";

const PLAYER_COOKIE = "abbey_player";
const ABBOT_COOKIE = "abbey_abbot";
const MAX_AGE = 60 * 60 * 24 * 7;

const isProd = process.env.VERCEL_ENV === "production";

function secret(name: "SESSION_SECRET" | "ABBOT_SECRET", devDefault: string) {
  const value = process.env[name];
  if (value) return value;
  if (isProd) throw new Error(`${name} must be set in production`);
  return devDefault;
}

const sign = (value: string) =>
  `${value}.${createHmac("sha256", secret("SESSION_SECRET", "dev-session-secret")).update(value).digest("base64url")}`;

function unsign(signed: string | undefined): string | null {
  if (!signed) return null;
  const value = signed.slice(0, signed.lastIndexOf("."));
  const expected = Buffer.from(sign(value));
  const actual = Buffer.from(signed);
  return expected.length === actual.length && timingSafeEqual(expected, actual) ? value : null;
}

const cookieOptions = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", maxAge: MAX_AGE, path: "/" };

export async function setPlayerSession(playerId: string) {
  (await cookies()).set(PLAYER_COOKIE, sign(playerId), cookieOptions);
}

export async function clearPlayerSession() {
  (await cookies()).delete(PLAYER_COOKIE);
}

/** The signed-in player with their Order, or null. */
export async function currentPlayer() {
  const id = unsign((await cookies()).get(PLAYER_COOKIE)?.value);
  return id ? getPlayer(id) : null;
}

export async function abbotLogin(attempt: string): Promise<boolean> {
  const expected = Buffer.from(secret("ABBOT_SECRET", "abbot"));
  const given = Buffer.from(attempt);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return false;
  (await cookies()).set(ABBOT_COOKIE, sign("abbot"), cookieOptions);
  return true;
}

export async function isAbbot() {
  return unsign((await cookies()).get(ABBOT_COOKIE)?.value) === "abbot";
}

/** The Word is shown on screen outside production so the flow can be tested without a barkeep. */
export const devMode = !isProd;
