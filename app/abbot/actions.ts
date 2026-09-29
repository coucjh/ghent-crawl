"use server";

import { refresh } from "next/cache";
import * as game from "@/lib/game";
import { deletePhotos } from "@/lib/photos";
import { abbotLogin, isAbbot } from "@/lib/session";
import type { FormState } from "../actions";

const str = (form: FormData, key: string) => String(form.get(key) ?? "");

/** Every Abbot action goes through here: checks the cookie, runs, refreshes the dashboard. */
async function asAbbot(run: () => Promise<game.Result<{ photos?: string[] }>>): Promise<FormState> {
  if (!(await isAbbot())) return { error: "Only the Abbots may do that." };
  const r = await run();
  if (r.ok && r.photos) await deletePhotos(r.photos); // an Order deleted, or the Abbey reset: its photos go too
  refresh();
  return r.ok ? { ok: true } : { error: r.error };
}

export async function loginAction(_: FormState, form: FormData): Promise<FormState> {
  if (!(await abbotLogin(str(form, "secret")))) return { error: "That is not the Abbots' secret." };
  refresh();
  return { ok: true };
}

export const openStationAction = async (id: number) => asAbbot(() => game.openStation(id));
export const lastOrdersAction = async (id: number) => asAbbot(() => game.callLastOrders(id));
export const closeStationAction = async (id: number) => asAbbot(() => game.closeStation(id));
export const grantEntryAction = async (teamId: string, stationId: number) =>
  asAbbot(() => game.grantEntry(teamId, stationId));
export const deleteOrderAction = async (teamId: string) => asAbbot(() => game.deleteOrder(teamId));
export const resolveAppealAction = async (teamId: string, stationId: number, questionId: string, accept: boolean) =>
  asAbbot(() => game.resolveAppeal(teamId, stationId, questionId, accept));
export const revealAction = async () => asAbbot(() => game.reveal());
export const crownPhotoAction = async (stationId: number, questionId: string, teamId: string) =>
  asAbbot(() => game.crownPhoto(stationId, questionId, teamId));

export async function renameOrderAction(teamId: string, _: FormState, form: FormData): Promise<FormState> {
  return asAbbot(() => game.renameOrder(teamId, str(form, "name")));
}

export async function resetAction(_: FormState, form: FormData): Promise<FormState> {
  if (str(form, "confirm") !== "RESET") return { error: 'Type RESET to confirm.' };
  return asAbbot(() => game.resetAbbey());
}
