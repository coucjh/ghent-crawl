"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/abbot/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, {});
  return (
    <form action={action} className="space-y-4 rounded-3xl border-4 border-ink bg-white p-6 shadow-[6px_6px_0_var(--color-ink)]">
      <label className="block">
        <span className="font-bold uppercase tracking-wide">Admin password</span>
        <input name="secret" type="password" required className="field" autoComplete="current-password" />
      </label>
      {state.error && <p className="font-bold text-hot">{state.error}</p>}
      <button className="btn w-full" disabled={pending}>
        Let me in
      </button>
    </form>
  );
}
