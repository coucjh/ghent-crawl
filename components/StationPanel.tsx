import { roman } from "@/lib/config";
import type { StationView } from "@/lib/game";
import { LastOrders } from "./Countdown";
import { Manuscript } from "./Manuscript";
import { MarkedManuscript } from "./MarkedManuscript";
import { WaxSeal } from "./WaxSeal";
import { WordForm } from "./WordForm";

/** Everything a player sees for one Station, whatever state it is in. */
export function StationPanel({ view, listener, wordHint }: { view: StationView; listener: string; wordHint?: string }) {
  const pilgrimage = view.pilgrimage;
  return (
    <section>
      {view.status === "open" && view.closesAt && <LastOrders closesAt={view.closesAt} />}

      <div className="label-frame px-5 py-6">
        <header className="mb-6 text-center">
          <p className="smallcaps text-ink-soft">{pilgrimage ? "✦ Answered on the road ✦" : `Station ${view.label}`}</p>
          <h2 className="font-display text-4xl leading-tight text-oxblood">{view.name}</h2>
          <p className="italic text-ink-soft">
            {pilgrimage ? `open from Station ${roman(pilgrimage.opensWith)} until Station ${roman(pilgrimage.closesWith)} opens` : `at ${view.pub}`}
          </p>
          {view.score !== null && (
            <p className="mt-3 text-xl">
              Your Order earned <strong className="text-oxblood">{view.score}</strong> of {view.maxScore}
              {view.awaitingJudgement && <span className="block text-base italic text-ink-soft">so far — the Abbots are judging your photos</span>}
            </p>
          )}
        </header>

        {view.status === "sealed" && pilgrimage && (
          <p className="text-center italic">This Pilgrimage begins when Station {roman(pilgrimage.opensWith)} opens.</p>
        )}

        {view.status === "sealed" && !pilgrimage && (
          <div className="flex flex-col items-center text-center">
            <WaxSeal numeral={view.id} className="mb-4 h-28 w-28 opacity-80" />
            <p className="italic">This Station is still sealed. The Abbots will open it when all are gathered.</p>
          </div>
        )}

        {view.status === "open" && !view.unlocked && <WordForm stationId={view.id} pub={view.pub} hint={wordHint} />}

        {view.status === "open" && pilgrimage && (
          <p className="mb-6 border-y border-gilt py-2 text-center text-base italic">
            Answer as you walk, a little at a time. Your marks and points are revealed all at once when Station{" "}
            {roman(pilgrimage.closesWith)} opens.
          </p>
        )}

        {view.status === "open" && view.unlocked && view.questions && (
          <Manuscript stationId={view.id} questions={view.questions} answers={view.answers} sealed={view.sealed} sealable={!pilgrimage} listener={listener} />
        )}

        {view.status === "closed" && view.questions && view.corrections && (
          <MarkedManuscript stationId={view.id} questions={view.questions} answers={view.answers} corrections={view.corrections} />
        )}
      </div>
    </section>
  );
}
