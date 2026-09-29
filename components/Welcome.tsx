"use client";

import { useActionState, useState } from "react";
import { foundOrderAction, joinOrderAction, type FormState } from "@/app/actions";

function ErrorLine({ state }: { state: FormState }) {
  return state.error ? (
    <p role="alert" className="text-oxblood italic">
      {state.error}
    </p>
  ) : null;
}

function FoundForm() {
  const [state, action, pending] = useActionState(foundOrderAction, {});
  return (
    <form action={action} className="space-y-5">
      <label className="block">
        <span className="smallcaps text-ink-soft">Name of your Order</span>
        <input name="name" required maxLength={40} className="field text-xl" placeholder="The Order of St. Stella" autoComplete="off" />
      </label>
      <label className="block">
        <span className="smallcaps text-ink-soft">Your first name</span>
        <input name="firstName" required maxLength={24} className="field text-xl" autoComplete="given-name" />
      </label>
      <ErrorLine state={state} />
      <button className="btn w-full" disabled={pending}>
        Found the Order
      </button>
    </form>
  );
}

type Order = { id: string; name: string };

function JoinForm({ orders }: { orders: Order[] }) {
  const [state, action, pending] = useActionState(joinOrderAction, {});
  if (orders.length === 0) return <p className="italic">No Orders have been founded yet. Found the first one.</p>;
  return (
    <form action={action} className="space-y-5">
      <label className="block">
        <span className="smallcaps text-ink-soft">Your Order</span>
        <select name="teamId" required defaultValue="" className="field text-xl">
          <option value="" disabled>
            Choose an Order
          </option>
          {orders.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="smallcaps text-ink-soft">Your first name</span>
        <input name="firstName" required maxLength={24} className="field text-xl" autoComplete="given-name" />
      </label>
      <p className="text-base italic text-ink-soft">Lost your place? Rejoin with the same name to pick up where you left off.</p>
      <ErrorLine state={state} />
      <button className="btn w-full" disabled={pending}>
        Join the Order
      </button>
    </form>
  );
}

export function Welcome({ locked, orders }: { locked: boolean; orders: Order[] }) {
  const [mode, setMode] = useState<"join" | "found">(orders.length ? "join" : "found");
  if (locked)
    return (
      <div className="label-frame px-6 py-7">
        <p className="mb-6 italic">
          The pilgrimage has begun, so no new Orders or members can join. Already in an Order? Choose it and enter the same
          first name you used before.
        </p>
        <JoinForm orders={orders} />
      </div>
    );
  return (
    <div className="label-frame px-6 py-7">
      <div role="tablist" className="mb-6 grid grid-cols-2 border-b border-gilt">
        {(["join", "found"] as const).map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={`smallcaps pb-2 text-lg transition-colors ${mode === m ? "border-b-2 border-oxblood text-oxblood" : "text-ink-soft"}`}
          >
            {m === "join" ? "Join an Order" : "Found an Order"}
          </button>
        ))}
      </div>
      {mode === "join" ? <JoinForm orders={orders} /> : <FoundForm />}
    </div>
  );
}
