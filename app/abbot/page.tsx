import { ActionButton, LoginForm, RenameForm, ResetForm } from "@/components/abbot/controls";
import { AutoRefresh } from "@/components/AutoRefresh";
import { LastOrders } from "@/components/Countdown";
import { roman, WaxSeal } from "@/components/WaxSeal";
import { STATIONS } from "@/content/quiz";
import { getBook, getDisputes, getStandings, getStationStates, getTeamProgress } from "@/lib/game";
import { isAbbot } from "@/lib/session";
import {
  closeStationAction,
  deleteOrderAction,
  grantEntryAction,
  lastOrdersAction,
  openStationAction,
  resolveAppealAction,
  revealAction,
} from "./actions";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="label-frame mb-6 px-5 py-5">
      <h2 className="mb-4 font-display text-3xl text-oxblood">{title}</h2>
      {children}
    </section>
  );
}

export default async function AbbotPage() {
  if (!(await isAbbot()))
    return (
      <>
        <h1 className="mb-6 text-center font-display text-5xl text-oxblood">The Chapter House</h1>
        <LoginForm />
      </>
    );

  const [states, standings, disputes, book] = await Promise.all([getStationStates(), getStandings(), getDisputes(), getBook()]);
  const openStation = STATIONS.find((s) => states.get(s.id)!.status === "open");
  const nextSealed = STATIONS.find((s) => states.get(s.id)!.status === "sealed");
  const progress = openStation ? await getTeamProgress(openStation.id) : new Map<string, { sealed: boolean }>();
  const finalClosed = states.get(STATIONS[STATIONS.length - 1].id)!.status === "closed";
  const openClosesAt = openStation && states.get(openStation.id)!.closesAt;

  return (
    <>
      <AutoRefresh />
      {openClosesAt && <LastOrders closesAt={openClosesAt.toISOString()} />}
      <h1 className="mb-6 text-center font-display text-5xl text-oxblood">The Chapter House</h1>

      <Section title="Stations">
        <ul className="space-y-4">
          {STATIONS.map((s) => {
            const status = states.get(s.id)!.status;
            return (
              <li key={s.id} className="flex items-start gap-3">
                <WaxSeal numeral={s.id} state={status === "closed" ? "broken" : status} className="h-12 w-12 shrink-0" />
                <div className="flex-1">
                  <p className="text-lg leading-tight">
                    {s.name} <span className="smallcaps text-ink-soft">· {status}</span>
                  </p>
                  <p className="text-sm text-ink-soft">
                    {s.pub} · Word: <strong>{s.word}</strong>
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {status === "sealed" && s.id === nextSealed?.id && !openStation && (
                      <ActionButton action={openStationAction.bind(null, s.id)}>Open Station {roman(s.id)}</ActionButton>
                    )}
                    {status === "open" && (
                      <>
                        <ActionButton action={lastOrdersAction.bind(null, s.id)} quiet>
                          Last Orders (2 min)
                        </ActionButton>
                        <ActionButton action={closeStationAction.bind(null, s.id)} confirm="Close for every Order?">
                          Close now
                        </ActionButton>
                      </>
                    )}
                  </div>
                  {status === "open" && (
                    <ul className="mt-3 space-y-1 text-base">
                      {standings.map((t) => {
                        const p = progress.get(t.teamId);
                        return (
                          <li key={t.teamId} className="flex items-center justify-between gap-2">
                            <span>{t.name}</span>
                            {p ? (
                              <span className="smallcaps text-verdigris">{p.sealed ? "sealed" : "answering"}</span>
                            ) : (
                              <ActionButton action={grantEntryAction.bind(null, t.teamId, s.id)} quiet>
                                Grant entry
                              </ActionButton>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section title={`Appeals${disputes.length ? ` (${disputes.length})` : ""}`}>
        {disputes.length === 0 ? (
          <p className="italic text-ink-soft">No Order has appealed.</p>
        ) : (
          <ul className="space-y-4">
            {disputes.map((d) => (
              <li key={`${d.teamId}-${d.stationId}-${d.questionId}`} className="border-b border-vellum-deep pb-3">
                <p className="smallcaps text-sm text-ink-soft">
                  {d.teamName} · Station {roman(d.stationId)}
                </p>
                <p>{d.prompt}</p>
                <p className="text-xl text-oxblood">“{d.given}”</p>
                <p className="text-sm text-ink-soft">Accepted: {d.accepted.join(", ")}</p>
                <div className="mt-2 flex gap-2">
                  <ActionButton action={resolveAppealAction.bind(null, d.teamId, d.stationId, d.questionId, true)}>Grant</ActionButton>
                  <ActionButton action={resolveAppealAction.bind(null, d.teamId, d.stationId, d.questionId, false)} quiet>
                    Deny
                  </ActionButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Orders">
        {standings.length === 0 && <p className="italic text-ink-soft">No Orders yet.</p>}
        <ul className="space-y-4">
          {standings.map((t, i) => (
            <li key={t.teamId} className="border-b border-vellum-deep pb-3">
              <div className="flex items-baseline justify-between">
                <p className="text-lg">
                  <span className="font-semibold text-oxblood">{roman(i + 1)}</span> {t.name}
                </p>
                <span className="text-2xl tabular-nums">{t.score}</span>
              </div>
              <p className="text-sm text-ink-soft">{t.members.join(" · ")}</p>
              <div className="mt-2 flex flex-wrap items-end gap-3">
                <RenameForm teamId={t.teamId} name={t.name} />
                <ActionButton action={deleteOrderAction.bind(null, t.teamId)} confirm="Delete this Order and its answers?" quiet>
                  Delete
                </ActionButton>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="The Final Judgement">
        {book.state === "revealed" ? (
          <p className="italic text-verdigris">Revealed. Every phone now shows the final standings.</p>
        ) : finalClosed ? (
          <ActionButton action={revealAction} confirm="Reveal the winners on every phone?">
            Reveal the Book
          </ActionButton>
        ) : (
          <p className="italic text-ink-soft">
            {book.state === "sealed"
              ? "The Book is sealed for players. Close the final Station, then reveal."
              : "Players can see standings until the final Station opens."}
          </p>
        )}
      </Section>

      <Section title="Reset">
        <ResetForm />
      </Section>
    </>
  );
}
