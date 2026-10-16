"use server";

import { refresh } from "next/cache";
import * as quiz from "@/lib/quiz";
import { abbotLogin, isAbbot } from "@/lib/session";

export type FormState = { error?: string; ok?: boolean };

const str = (form: FormData, key: string) => String(form.get(key) ?? "");

/** Every admin action goes through here: checks the cookie, runs, refreshes the page. */
async function asAdmin(run: () => Promise<quiz.Result>): Promise<FormState> {
  if (!(await isAbbot())) return { error: "Admin only." };
  const r = await run();
  refresh();
  return r.ok ? { ok: true } : { error: r.error };
}

export async function loginAction(_: FormState, form: FormData): Promise<FormState> {
  if (!(await abbotLogin(str(form, "secret")))) return { error: "Wrong password." };
  refresh();
  return { ok: true };
}

export async function saveQuestionAction(n: number, _: FormState, form: FormData): Promise<FormState> {
  return asAdmin(() => quiz.saveQuestion(n, str(form, "prompt"), str(form, "answer"), form.get("multi") === "on"));
}

export const pointsAction = async (guestId: string, n: number, points: number | null) =>
  asAdmin(() => quiz.setPoints(guestId, n, points));

export async function wipeAction(_: FormState, form: FormData): Promise<FormState> {
  if (str(form, "confirm") !== "WIPE") return { error: "Type WIPE to confirm." };
  return asAdmin(() => quiz.wipePlayers());
}
