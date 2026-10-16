import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getGuest } from "./quiz";

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


const GUEST_COOKIE = "crawl_guest";

export async function setGuestSession(guestId: string) {
  (await cookies()).set(GUEST_COOKIE, sign(guestId), cookieOptions);
}

/** The signed-in player, or null. */
export async function currentGuest() {
  const id = unsign((await cookies()).get(GUEST_COOKIE)?.value);
  return id ? getGuest(id) : null;
}
