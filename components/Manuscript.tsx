"use client";

import { useRef, useState, useTransition } from "react";
import { saveAnswerAction, sealAction } from "@/app/actions";
import type { AnswerView } from "@/lib/game";
import type { PublicQuestion } from "@/lib/types";

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function Prompt({ q }: { q: PublicQuestion }) {
  return (
    <p className="text-lg leading-snug">
      <span className="initial" aria-hidden>
        {q.prompt[0]}
      </span>
      <span className="sr-only">{q.prompt[0]}</span>
      {q.prompt.slice(1)}
      {q.points > 1 && <span className="smallcaps ml-2 text-gilt">{q.points} points</span>}
    </p>
  );
}

function StatusMark({ status }: { status: SaveStatus }) {
  const text = { idle: "", saving: "inscribing…", saved: "inscribed", error: "not saved — try again" }[status];
  return <span className={`smallcaps text-sm ${status === "error" ? "text-oxblood" : "text-ink-soft"}`}>{text}</span>;
}

function Answer({ stationId, q, serverValue, locked }: { stationId: number; q: PublicQuestion; serverValue: string; locked: boolean }) {
  const [value, setValue] = useState(serverValue);
  const [focused, setFocused] = useState(false);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [seen, setSeen] = useState(serverValue);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // A teammate's edit arrives via refresh: adopt it unless this phone is mid-edit. Last save wins.
  if (serverValue !== seen) {
    setSeen(serverValue);
    if (!focused && status !== "saving") setValue(serverValue);
  }

  async function save(next: string) {
    setStatus("saving");
    const r = await saveAnswerAction(stationId, q.id, next);
    setStatus(r.ok ? "saved" : "error");
  }

  function change(next: string, debounce: number) {
    setValue(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => save(next), debounce);
  }

  return (
    <li className="clear-both border-b border-vellum-deep pb-5">
      <Prompt q={q} />
      <div className="clear-both pt-2">
        {q.type === "choice" ? (
          <div className="grid grid-cols-2 gap-2">
            {q.options!.map((opt) => (
              <button
                key={opt}
                type="button"
                disabled={locked}
                aria-pressed={value === opt}
                onClick={() => change(value === opt ? "" : opt, 0)}
                className={`border px-3 py-2 text-left transition-colors ${
                  value === opt ? "border-oxblood bg-oxblood text-vellum-light" : "border-ink-soft/40 hover:border-oxblood"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <input
            className="field text-xl"
            value={value}
            disabled={locked}
            maxLength={200}
            placeholder="Your answer"
            autoComplete="off"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={(e) => change(e.target.value, 700)}
          />
        )}
        <div className="mt-1 h-5 text-right">
          <StatusMark status={status} />
        </div>
      </div>
    </li>
  );
}

export function Manuscript({
  stationId,
  questions,
  answers,
  sealed,
}: {
  stationId: number;
  questions: PublicQuestion[];
  answers: Record<string, AnswerView>;
  sealed: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div>
      <ol className="space-y-5">
        {questions.map((q) => (
          <Answer key={q.id} stationId={stationId} q={q} serverValue={answers[q.id]?.value ?? ""} locked={sealed} />
        ))}
      </ol>

      <div className="mt-8 text-center">
        {sealed ? (
          <p className="italic text-ink-soft">Your answers are sealed. Await the Abbots&apos; judgement.</p>
        ) : confirming ? (
          <div className="label-frame space-y-4 px-5 py-5">
            <p>Once sealed, no Brother or Sister of your Order may change an answer.</p>
            <div className="flex justify-center gap-3">
              <button className="btn-quiet btn" onClick={() => setConfirming(false)}>
                Not yet
              </button>
              <button className="btn" disabled={pending} onClick={() => startTransition(async () => void (await sealAction(stationId)))}>
                Seal them
              </button>
            </div>
          </div>
        ) : (
          <button className="btn w-full" onClick={() => setConfirming(true)}>
            Seal your answers
          </button>
        )}
      </div>
    </div>
  );
}
