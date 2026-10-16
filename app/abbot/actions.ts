"use server";

import { refresh } from "next/cache";
import { abbotLogin } from "@/lib/session";

export type FormState = { error?: string; ok?: boolean };

export async function loginAction(_: FormState, form: FormData): Promise<FormState> {
  if (!(await abbotLogin(String(form.get("secret") ?? "")))) return { error: "Wrong password." };
  refresh();
  return { ok: true };
}
