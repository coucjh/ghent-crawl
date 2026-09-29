"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import * as game from "@/lib/game";
import { clearPlayerSession, currentPlayer, setPlayerSession } from "@/lib/session";

export type FormState = { error?: string; ok?: boolean };

const str = (form: FormData, key: string) => String(form.get(key) ?? "");

async function requireTeamId() {
  const p = await currentPlayer();
  if (!p) redirect("/");
  return p.team.id;
}

export async function foundOrderAction(_: FormState, form: FormData): Promise<FormState> {
  const r = await game.foundOrder(str(form, "name"), str(form, "firstName"));
  if (!r.ok) return { error: r.error };
  await setPlayerSession(r.playerId);
  redirect("/");
}

export async function joinOrderAction(_: FormState, form: FormData): Promise<FormState> {
  const r = await game.joinOrder(str(form, "teamId"), str(form, "firstName"));
  if (!r.ok) return { error: r.error };
  await setPlayerSession(r.playerId);
  redirect("/");
}

export async function leaveAction() {
  await clearPlayerSession();
  redirect("/");
}

/** Doesn't refresh on success — the client plays the seal-breaking animation first, then refreshes. */
export async function speakWordAction(stationId: number, _: FormState, form: FormData): Promise<FormState> {
  const r = await game.speakWord(await requireTeamId(), stationId, str(form, "word"));
  return r.ok ? { ok: true } : { error: r.error };
}

export async function saveAnswerAction(stationId: number, questionId: string, value: string): Promise<FormState> {
  const r = await game.saveAnswer(await requireTeamId(), stationId, questionId, value);
  return r.ok ? { ok: true } : { error: r.error };
}

export async function sealAction(stationId: number): Promise<FormState> {
  const r = await game.sealAnswers(await requireTeamId(), stationId);
  refresh();
  return r.ok ? { ok: true } : { error: r.error };
}

export async function appealAction(stationId: number, questionId: string): Promise<FormState> {
  const r = await game.appeal(await requireTeamId(), stationId, questionId);
  refresh();
  return r.ok ? { ok: true } : { error: r.error };
}
