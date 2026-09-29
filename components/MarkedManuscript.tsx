"use client";

import { useState, useTransition } from "react";
import { appealAction } from "@/app/actions";
import type { AnswerView } from "@/lib/game";
import type { PublicQuestion } from "@/lib/types";
import { QuestionHead } from "./Manuscript";
import { Picture } from "./QuestionMedia";

/** A photo challenge after the Pilgrimage closes: your photo, and whether the Abbots crowned it. */
function PhotoVerdict({ a, points }: { a: AnswerView | undefined; points: number }) {
  if (!a?.value) return <p className="pt-2 italic text-ink-soft">No photo was sent.</p>;
  return (
    <div className="pt-3">
      <span className="smallcaps text-sm text-ink-soft">Your Order&apos;s re-enactment</span>
      <Picture src={`/photos/${a.value}`} plain alt="Your Order's re-enactment" />
      <p className="mt-2 text-center">
        {a.correct === true && <strong className="text-verdigris">👑 Crowned the finest — +{points}</strong>}
        {a.correct === false && <span className="italic text-ink-soft">Another Order&apos;s was crowned.</span>}
        {a.correct === null && <span className="smallcaps text-gilt">Awaiting the Abbots&apos; judgement</span>}
      </p>
    </div>
  );
}

function AppealButton({ stationId, questionId }: { stationId: number; questionId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  return (
    <>
      <button
        className="smallcaps text-oxblood underline decoration-gilt underline-offset-4"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const r = await appealAction(stationId, questionId);
            setError(r.error);
          })
        }
      >
        Appeal to the Abbot
      </button>
      {error && <span className="ml-2 text-sm italic text-oxblood">{error}</span>}
    </>
  );
}

function Verdict({ a }: { a: AnswerView | undefined }) {
  if (a?.correct) return <span className="text-2xl text-verdigris" aria-label="Correct">✓</span>;
  return <span className="text-2xl text-oxblood" aria-label="Wrong">✗</span>;
}

export function MarkedManuscript({
  stationId,
  questions,
  answers,
  corrections,
}: {
  stationId: number;
  questions: PublicQuestion[];
  answers: Record<string, AnswerView>;
  corrections: Record<string, string>;
}) {
  return (
    <ol className="space-y-5">
      {questions.map((q) => (
        <li key={q.id} className="clear-both border-b border-vellum-deep pb-4">
          <QuestionHead q={q} />
          {q.parts.map((part) => {
            const a = answers[part.id];
            if (part.kind === "photo") return <PhotoVerdict key={part.id} a={a} points={part.points} />;
            const given = a?.value.trim();
            return (
              <div key={part.id} className="flex items-start gap-3 pt-2">
                <Verdict a={a} />
                <div className="flex-1">
                  {part.label && <span className="smallcaps text-sm text-ink-soft">{part.label} </span>}
                  <p className={!a?.correct && given ? "line-through decoration-oxblood/60" : ""}>
                    {given || <em className="text-ink-soft">left blank</em>}
                  </p>
                  {!a?.correct && (
                    <p className="text-verdigris">
                      <span className="smallcaps text-ink-soft">The Abbots hold:</span> {corrections[part.id]}
                    </p>
                  )}
                  <div className="mt-1">
                    {a?.appeal === "pending" && <span className="smallcaps text-gilt">Appeal before the Abbot</span>}
                    {a?.appeal === "accepted" && <span className="smallcaps text-verdigris">Appeal granted</span>}
                    {a?.appeal === "rejected" && <span className="smallcaps text-ink-soft">Appeal denied</span>}
                    {!a?.appeal && a?.correct === false && given && <AppealButton stationId={stationId} questionId={part.id} />}
                  </div>
                </div>
              </div>
            );
          })}
        </li>
      ))}
    </ol>
  );
}
