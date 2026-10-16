"use server";

import { refresh } from "next/cache";
import { createGuest, submitGuess } from "@/lib/quiz";
import { currentGuest, setGuestSession } from "@/lib/session";
import type { FormState } from "./abbot/actions";

export async function joinAction(_: FormState, form: FormData): Promise<FormState> {
  const r = await createGuest(String(form.get("name") ?? ""));
  if (!r.ok) return { error: r.error };
  await setGuestSession(r.id);
  refresh();
  return { ok: true };
}

export async function guessAction(n: number, _: FormState, form: FormData): Promise<FormState> {
  const guest = await currentGuest();
  if (!guest) return { error: "Tell us your name first." };
  const r = await submitGuess(guest.id, n, String(form.get("guess") ?? ""));
  refresh();
  return r.ok ? { ok: true } : { error: r.error };
}
