"use server";

import { refresh } from "next/cache";
import { deleteGuest, wipePlayers } from "@/lib/quiz";
import { abbotLogin, isAbbot } from "@/lib/session";

export type FormState = { error?: string; ok?: boolean };

const str = (form: FormData, key: string) => String(form.get(key) ?? "");

export async function loginAction(_: FormState, form: FormData): Promise<FormState> {
  if (!(await abbotLogin(str(form, "secret")))) return { error: "Wrong password." };
  refresh();
  return { ok: true };
}

export async function deletePlayerAction(id: string): Promise<FormState> {
  if (!(await isAbbot())) return { error: "Admin only." };
  await deleteGuest(id);
  refresh();
  return { ok: true };
}

export async function wipeAction(_: FormState, form: FormData): Promise<FormState> {
  if (!(await isAbbot())) return { error: "Admin only." };
  if (str(form, "confirm") !== "WIPE") return { error: "Type WIPE to confirm." };
  await wipePlayers();
  refresh();
  return { ok: true };
}
