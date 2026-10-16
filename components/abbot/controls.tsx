"use client";

import { useActionState, useTransition } from "react";
import { loginAction, pointsAction, saveQuestionAction, wipeAction } from "@/app/abbot/actions";

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

export function QuestionForm({ n, pub, prompt, answer, multi }: { n: number; pub: string; prompt: string; answer: string; multi: boolean }) {
  const [state, action, pending] = useActionState(saveQuestionAction.bind(null, n), {});
  return (
    <form action={action} className="space-y-2 border-b-2 border-ink/20 pb-4">
      <p className="font-bold">
        Q{n + 1} · {pub}
      </p>
      <textarea name="prompt" defaultValue={prompt} rows={2} className="field text-base" aria-label="Question" />
      <input name="answer" defaultValue={answer} placeholder="Correct answer" className="field text-base" aria-label="Correct answer" />
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" name="multi" defaultChecked={multi} className="h-5 w-5" />A point per item (separate items with commas)
      </label>
      <p className="text-xs">Several accepted spellings? Separate them with / (e.g. “Alan Shearer / Shearer”).</p>
      <div className="flex items-center gap-3">
        <button className="btn px-4 py-1 text-base" disabled={pending}>
          Save
        </button>
        {state.ok && <span className="font-bold text-green-700">Saved</span>}
        {state.error && <span className="font-bold text-hot">{state.error}</span>}
      </div>
    </form>
  );
}

const SMALL = "rounded-lg border-2 border-ink px-2";

/** Overrule the automatic mark: ✅ / ❌ (or − / + for a list question), or ↺ back to automatic. */
export function PointsButtons({ guestId, n, multi, points, overridden }: { guestId: string; n: number; multi: boolean; points: number | null; overridden: boolean }) {
  const [pending, start] = useTransition();
  const set = (p: number | null) => start(() => pointsAction(guestId, n, p).then(() => {}));
  return (
    <span className="flex shrink-0 gap-1">
      {multi ? (
        <>
          <button className={SMALL} disabled={pending || !points} onClick={() => set((points ?? 0) - 1)} aria-label="One point less">
            −
          </button>
          <button className={SMALL} disabled={pending} onClick={() => set((points ?? 0) + 1)} aria-label="One point more">
            +
          </button>
        </>
      ) : (
        <>
          <button className={SMALL} disabled={pending} onClick={() => set(1)} aria-label="Mark right">
            ✅
          </button>
          <button className={SMALL} disabled={pending} onClick={() => set(0)} aria-label="Mark wrong">
            ❌
          </button>
        </>
      )}
      {overridden && (
        <button className={SMALL} disabled={pending} onClick={() => set(null)} aria-label="Back to automatic">
          ↺
        </button>
      )}
    </span>
  );
}

export function WipeForm() {
  const [state, action, pending] = useActionState(wipeAction, {});
  return (
    <form action={action} className="space-y-3">
      <p>Deletes every player&apos;s name and answers. Questions and correct answers stay. Type WIPE to confirm.</p>
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
