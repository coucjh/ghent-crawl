"use client";

import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { speakWordAction } from "@/app/actions";
import { SealBreak } from "./SealBreak";
import { WaxSeal } from "./WaxSeal";

export function WordForm({ stationId, pub, hint }: { stationId: number; pub: string; hint?: string }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(speakWordAction.bind(null, stationId), {});

  if (state.ok) return <SealBreak numeral={stationId} onDone={() => router.refresh()} />;

  return (
    <form action={action} className="flex flex-col items-center text-center">
      <WaxSeal numeral={stationId} state="open" className="mb-4 h-32 w-32 drop-shadow-lg" />
      <p className="mb-5 text-lg">
        The barkeep of <em>{pub}</em> holds the Word. Go and ask for it.
      </p>
      <label className="w-full">
        <span className="sr-only">The Word</span>
        <input
          name="word"
          required
          className="field text-center text-2xl"
          placeholder="Speak the Word"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      </label>
      {state.error && (
        <p role="alert" className="mt-3 italic text-oxblood">
          {state.error}
        </p>
      )}
      {hint && <p className="mt-3 text-sm text-ink-soft">Dev mode — the Word is “{hint}”</p>}
      <button className="btn mt-6 w-full" disabled={pending}>
        Break the seal
      </button>
    </form>
  );
}
