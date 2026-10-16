"use client";

import { useActionState, useState, useTransition } from "react";
import { deletePlayerAction, loginAction, wipeAction } from "@/app/abbot/actions";

const CARD = "rounded-3xl border-4 border-ink bg-white p-5 text-ink shadow-[6px_6px_0_var(--color-ink)]";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, {});
  return (
    <form action={action} className={`${CARD} space-y-4`}>
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

/** Delete one player and their answers, after an "are you sure?" step. */
export function DeletePlayer({ id, name }: { id: string; name: string }) {
  const [asking, setAsking] = useState(false);
  const [pending, start] = useTransition();
  if (!asking)
    return (
      <button className="rounded-lg border-2 border-ink px-2 text-sm font-bold" onClick={() => setAsking(true)}>
        Delete
      </button>
    );
  return (
    <span className="flex shrink-0 items-center gap-1 text-sm">
      <span className="font-bold">Delete {name}?</span>
      <button
        className="rounded-lg border-2 border-ink bg-hot px-2 font-bold text-white"
        disabled={pending}
        onClick={() => start(() => deletePlayerAction(id).then(() => {}))}
      >
        Yes
      </button>
      <button className="rounded-lg border-2 border-ink px-2" onClick={() => setAsking(false)}>
        No
      </button>
    </span>
  );
}

export function WipeForm() {
  const [state, action, pending] = useActionState(wipeAction, {});
  return (
    <form action={action} className="space-y-3">
      <p>Deletes every player&apos;s name and answers. Type WIPE to confirm.</p>
      <div className="flex gap-2">
        <input name="confirm" className="field mt-0 text-base" autoComplete="off" placeholder="WIPE" aria-label="Type WIPE" />
        <button className="btn shrink-0 bg-ink px-4 py-1 text-base" disabled={pending}>
          Wipe players
        </button>
      </div>
      {state.error && <p className="font-bold text-hot">{state.error}</p>}
      {state.ok && <p className="font-bold text-green-700">All players deleted.</p>}
    </form>
  );
}
