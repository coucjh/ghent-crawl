"use client";

import { useActionState, useState, useTransition } from "react";
import type { FormState } from "@/app/actions";
import { loginAction, renameOrderAction, resetAction } from "@/app/abbot/actions";

/** A button bound to an Abbot action, with an optional in-page "are you sure?" step. */
export function ActionButton({
  action,
  children,
  confirm,
  quiet,
}: {
  action: () => Promise<FormState>;
  children: React.ReactNode;
  confirm?: string;
  quiet?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState<string>();
  const run = () =>
    startTransition(async () => {
      setAsking(false);
      setError((await action()).error);
    });

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      {asking ? (
        <>
          <span className="italic">{confirm}</span>
          <button className="btn px-3 py-1 text-base" onClick={run}>
            Yes
          </button>
          <button className="btn-quiet btn px-3 py-1 text-base" onClick={() => setAsking(false)}>
            No
          </button>
        </>
      ) : (
        <button className={`btn px-3 py-1 text-base ${quiet ? "btn-quiet" : ""}`} disabled={pending} onClick={() => (confirm ? setAsking(true) : run())}>
          {children}
        </button>
      )}
      {error && <span className="text-sm italic text-oxblood">{error}</span>}
    </span>
  );
}

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, {});
  return (
    <form action={action} className="label-frame space-y-5 px-6 py-7">
      <label className="block">
        <span className="smallcaps text-ink-soft">The Abbots&apos; secret</span>
        <input name="secret" type="password" required className="field text-xl" autoComplete="current-password" />
      </label>
      {state.error && <p className="italic text-oxblood">{state.error}</p>}
      <button className="btn w-full" disabled={pending}>
        Enter the Chapter House
      </button>
    </form>
  );
}

export function RenameForm({ teamId, name }: { teamId: string; name: string }) {
  const [state, action, pending] = useActionState(renameOrderAction.bind(null, teamId), {});
  return (
    <form action={action} className="flex items-end gap-2">
      <input name="name" defaultValue={name} className="field text-base" aria-label="Order name" />
      <button className="btn-quiet btn px-3 py-1 text-base" disabled={pending}>
        Rename
      </button>
      {state.error && <span className="text-sm italic text-oxblood">{state.error}</span>}
    </form>
  );
}

export function ResetForm() {
  const [state, action, pending] = useActionState(resetAction, {});
  return (
    <form action={action} className="space-y-3">
      <p>Wipes every Order, player, answer and Station. The questions stay. Type RESET to confirm.</p>
      <div className="flex items-end gap-2">
        <input name="confirm" className="field text-base" autoComplete="off" aria-label="Type RESET" placeholder="RESET" />
        <button className="btn shrink-0 whitespace-nowrap px-3 py-1 text-base" disabled={pending}>
          Reset the Abbey
        </button>
      </div>
      {state.error && <p className="italic text-oxblood">{state.error}</p>}
      {state.ok && <p className="italic text-verdigris">The Abbey is reset.</p>}
    </form>
  );
}
