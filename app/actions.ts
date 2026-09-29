"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import * as game from "@/lib/game";
import { deletePhotos, MAX_PHOTO_BYTES, storePhoto } from "@/lib/photos";
import { clearPlayerSession, currentPlayer, setPlayerSession } from "@/lib/session";

export type FormState = { error?: string; ok?: boolean };

const str = (form: FormData, key: string) => String(form.get(key) ?? "");

async function requireTeamId() {
  const p = await currentPlayer();
  if (!p) redirect("/");
  return p.team.id;
}

export async function foundOrderAction(_: FormState, form: FormData): Promise<FormState> {
  const r = await game.foundOrder(str(form, "name"), str(form, "firstName"), str(form, "emoji"));
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

/** Receives a photo (already resized to JPEG on the phone), stores it privately and records it for the challenge. */
export async function savePhotoAction(stationId: number, questionId: string, form: FormData): Promise<FormState> {
  const teamId = await requireTeamId();
  const file = form.get("photo");
  if (!(file instanceof Blob) || file.size === 0) return { error: "Choose a photo first." };
  if (file.size > MAX_PHOTO_BYTES) return { error: "That photo is too large." };
  const bytes = await file.arrayBuffer();
  const head = new Uint8Array(bytes.slice(0, 2));
  if (head[0] !== 0xff || head[1] !== 0xd8) return { error: "That isn't a photo the Abbots can read." };

  let key: string;
  try {
    key = await storePhoto(teamId, bytes);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "The photo could not be stored." };
  }
  const r = await game.savePhoto(teamId, stationId, questionId, key);
  if (!r.ok) {
    await deletePhotos([key]);
    return { error: r.error };
  }
  if (r.replaced) await deletePhotos([r.replaced]);
  refresh();
  return { ok: true };
}
