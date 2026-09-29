import Link from "next/link";
import { leaveAction } from "@/app/actions";
import { PILGRIMAGE_ID, getStationStates, getStationView, stationById, type StationView } from "@/lib/game";
import { devMode, type currentPlayer } from "@/lib/session";
import { STATIONS } from "@/content/quiz";
import { roman } from "@/lib/config";
import { AutoRefresh } from "./AutoRefresh";
import { SealRow } from "./SealRow";
import { StationPanel } from "./StationPanel";

export function Masthead() {
  return (
    <header className="mb-6 text-center">
      <p className="smallcaps text-sm text-ink-soft">Gent · Anno MMXXVI</p>
      <h1 className="font-display text-5xl leading-none text-oxblood">Monk Marko&apos;s Crawl</h1>
      <div className="rule mt-3 text-sm" aria-hidden>
        ✠
      </div>
    </header>
  );
}

/** The way into the Pilgrimage, shown on every Station screen while it runs and after it is judged. */
function PilgrimageLink({ view }: { view: StationView }) {
  const boxes = view.questions?.flatMap((q) => q.parts).length ?? 0;
  const answered = Object.values(view.answers).filter((a) => a.value.trim()).length;
  const open = view.status === "open";
  return (
    <Link
      href="/pilgrimage"
      className={`label-frame mb-6 flex items-center gap-3 px-4 py-3 ${open ? "label-frame-urgent" : ""}`}
    >
      <span className="text-3xl text-gilt" aria-hidden>
        ✦
      </span>
      <span className="flex-1">
        <span className="block font-display text-2xl leading-tight text-oxblood">{view.name}</span>
        <span className="block text-sm text-ink-soft">
          {open ? `Open on the road · ${answered} of ${boxes} answered` : `Judged · ${view.score} of ${view.maxScore} points`}
        </span>
      </span>
      <span className="smallcaps text-sm text-oxblood">{open ? "Answer" : "See marks"} →</span>
    </Link>
  );
}

type Player = NonNullable<Awaited<ReturnType<typeof currentPlayer>>>;

/** The signed-in player's page: their Order, the route, and one Station (the live one unless `stationId` is given). */
export async function PlayerShell({ player, stationId, dev }: { player: Player; stationId?: number; dev: boolean }) {
  const states = await getStationStates();
  const list = STATIONS.map((s) => ({ id: s.id, status: states.get(s.id)!.status }));
  const live = list.find((s) => s.status === "open") ?? list.findLast((s) => s.status === "closed") ?? list[0];
  const shownId = stationId ?? live.id;
  const view = await getStationView(player.team.id, shownId);
  const gathering = list[0].status === "sealed"; // members can still join
  const wordHint = devMode && dev ? stationById(shownId)?.word : undefined;
  const onPilgrimage = shownId === PILGRIMAGE_ID;
  const pilgrimage =
    !onPilgrimage && states.get(PILGRIMAGE_ID)!.status !== "sealed" ? await getStationView(player.team.id, PILGRIMAGE_ID) : null;

  return (
    <>
      <AutoRefresh />
      <Masthead />

      <section className="mb-6 text-center">
        <p className="font-display text-3xl">
          <span className="mr-2 font-serif">{player.team.emoji}</span>
          {player.team.name}
        </p>
        <p className="text-ink-soft">
          {player.members.join(" · ")}
        </p>
        {gathering && (
          <p className="mt-2 text-base italic">
            Teammates join on their own phones: <em>Join an Order</em>, then choose {player.team.name}.
          </p>
        )}
      </section>

      <div className="mb-6">
        <SealRow stations={list} current={shownId} />
      </div>

      {pilgrimage && <PilgrimageLink view={pilgrimage} />}

      {view && <StationPanel view={view} wordHint={wordHint} />}

      <nav className="mt-8 flex flex-col items-center gap-4">
        {stationId !== undefined && stationId !== live.id && (
          <Link href="/" className="btn-quiet btn w-full">
            Back to Station {roman(live.id)}
          </Link>
        )}
        <Link href="/book" className="btn w-full">
          The Book of Judgement
        </Link>
        <form action={leaveAction}>
          <button className="smallcaps text-sm text-ink-soft underline underline-offset-4">Leave this phone</button>
        </form>
      </nav>
    </>
  );
}
