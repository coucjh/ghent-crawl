import { ActionButton, LoginForm, RenameForm, ResetForm } from "@/components/abbot/controls";
import { AutoRefresh } from "@/components/AutoRefresh";
import { LastOrders } from "@/components/Countdown";
import { roman, WaxSeal } from "@/components/WaxSeal";
import { PILGRIMAGE, STATIONS } from "@/content/quiz";
import {
  PILGRIMAGE_ID,
  answerBoxes,
  getAnswerCounts,
  getBook,
  getDisputes,
  getStandings,
  getStationStates,
  getTeamProgress,
  roundName,
} from "@/lib/game";
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

type Tone = "default" | "urgent" | "quiet" | "danger";

/** A section's weight follows its stakes: urgent needs the Abbot now, quiet is settled, danger is outside the ritual. */
function Section({ title, tone = "default", children }: { title: string; tone?: Tone; children: React.ReactNode }) {
  if (tone === "quiet")
    return (
      <section className="mb-6 px-2">
        <h2 className="smallcaps mb-1 text-lg text-ink-soft">{title}</h2>
        {children}
      </section>
    );
  if (tone === "danger")
    return (
      <section className="mb-6 border border-dashed border-ink-soft/60 px-5 py-5">
        <h2 className="smallcaps mb-3 text-lg text-ink">{title}</h2>
        {children}
      </section>
    );
  return (
    <section className={`label-frame mb-6 px-5 py-5 ${tone === "urgent" ? "label-frame-urgent" : ""}`}>
      <h2 className="mb-4 font-display text-3xl text-oxblood">{title}</h2>
      {children}
    </section>
  );
}

const STATUS_STYLE = {
  open: "font-semibold text-verdigris",
  sealed: "text-ink-soft",
  closed: "text-ink-soft/70",
} as const;

export default async function AbbotPage() {
  if (!(await isAbbot()))
    return (
      <>
        <h1 className="mb-6 text-balance text-center font-display text-5xl text-oxblood">The Chapter House</h1>
        <LoginForm />
      </>
    );

  const [states, standings, disputes, book] = await Promise.all([getStationStates(), getStandings(), getDisputes(), getBook()]);
  const openStation = STATIONS.find((s) => states.get(s.id)!.status === "open");
  const nextSealed = STATIONS.find((s) => states.get(s.id)!.status === "sealed");
  const progress = openStation ? await getTeamProgress(openStation.id) : new Map<string, { sealed: boolean }>();
  const finalClosed = states.get(STATIONS[STATIONS.length - 1].id)!.status === "closed";
  const openClosesAt = openStation && states.get(openStation.id)!.closesAt;
  const pilgrimageStatus = states.get(PILGRIMAGE_ID)!.status;
  const pilgrimageCounts = pilgrimageStatus === "open" ? await getAnswerCounts(PILGRIMAGE_ID) : new Map<string, number>();
  const pilgrimageBoxes = answerBoxes(PILGRIMAGE_ID);

  return (
    <>
      <AutoRefresh />
      {openClosesAt && <LastOrders closesAt={openClosesAt.toISOString()} />}
      <h1 className="mb-6 text-balance text-center font-display text-5xl text-oxblood">The Chapter House</h1>

      <Section title="Stations">
        <ul className="space-y-4">
          {STATIONS.map((s) => {
            const status = states.get(s.id)!.status;
            // Only the live Station's Word (or the next one's, between pubs) is worth showing outright.
            const wordShown = status === "open" || (!openStation && s.id === nextSealed?.id);
            return (
              <li
                key={s.id}
                className={`flex items-start gap-3 ${status === "open" ? "-mx-2 border-l-4 border-oxblood bg-gilt-bright/20 px-2 py-3" : ""}`}
              >
                <WaxSeal numeral={s.id} state={status === "closed" ? "broken" : status} className="h-12 w-12 shrink-0" />
                <div className="flex-1">
                  <p className="text-lg leading-tight">
                    {s.name} <span className={`smallcaps ${STATUS_STYLE[status]}`}>· {status === "open" ? "open now" : status}</span>
                  </p>
                  <p className="text-sm text-ink-soft">{s.pub}</p>
                  {wordShown ? (
                    <p className="mt-1">
                      <span className="smallcaps text-sm text-ink-soft">The Word</span>{" "}
                      <strong className="text-xl text-oxblood">{s.word}</strong>
                    </p>
                  ) : (
                    status !== "closed" && (
                      <details className="text-sm text-ink-soft">
                        <summary className="smallcaps cursor-pointer">Show the Word</summary>
                        <strong className="text-ink">{s.word}</strong>
                      </details>
                    )
                  )}
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
                    <ul className="mt-3 divide-y divide-vellum-deep border-t border-vellum-deep text-base">
                      {standings.map((t) => {
                        const p = progress.get(t.teamId);
                        return (
                          <li key={t.teamId} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2">
                            <span className="min-w-40 flex-1 leading-tight">
                              {t.emoji} {t.name}
                            </span>
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
        <div className={`mt-5 border-t border-gilt pt-4 ${pilgrimageStatus === "open" ? "-mx-2 border-l-4 border-l-oxblood bg-gilt-bright/20 px-2 pb-3" : ""}`}>
          <p className="text-lg leading-tight">
            <span className="text-gilt">✦</span> {PILGRIMAGE.name}{" "}
            <span className={`smallcaps ${STATUS_STYLE[pilgrimageStatus]}`}>· {pilgrimageStatus === "open" ? "open now" : pilgrimageStatus}</span>
          </p>
          <p className="text-sm text-ink-soft">
            Opens with Station {roman(PILGRIMAGE.opensWith)}; closes and is marked when Station {roman(PILGRIMAGE.closesWith)} opens.
          </p>
          {pilgrimageStatus === "open" && (
            <ul className="mt-2 text-base">
              {standings.map((t) => (
                <li key={t.teamId} className="flex justify-between gap-3">
                  <span>
                    {t.emoji} {t.name}
                  </span>
                  <span className="tabular-nums text-ink-soft">
                    {pilgrimageCounts.get(t.teamId) ?? 0}/{pilgrimageBoxes}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Section>

      <Section title={`Appeals${disputes.length ? ` (${disputes.length})` : ""}`} tone={disputes.length ? "urgent" : "quiet"}>
        {disputes.length === 0 ? (
          <p className="italic text-ink-soft">No Order has appealed.</p>
        ) : (
          <ul className="space-y-4">
            {disputes.map((d) => (
              <li key={`${d.teamId}-${d.stationId}-${d.questionId}`} className="border-b border-vellum-deep pb-3">
                <p className="smallcaps text-sm text-ink-soft">
                  {d.teamName} · {roundName(d.stationId)}
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
                  <span className="font-semibold text-oxblood">{roman(i + 1)}</span> {t.emoji} {t.name}
                </p>
                <span className="text-2xl tabular-nums">{t.score}</span>
              </div>
              <p className="text-sm text-ink-soft">{t.members.join(" · ")}</p>
              <div className="mt-2 flex flex-wrap items-end gap-3">
                <RenameForm teamId={t.teamId} name={t.name} />
                <ActionButton
                  action={deleteOrderAction.bind(null, t.teamId)}
                  confirm={`Delete ${t.name} and all its answers?`}
                  confirmLabel="Yes, delete"
                  danger
                  quiet
                >
                  Delete
                </ActionButton>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="The Final Judgement" tone={finalClosed && book.state !== "revealed" ? "urgent" : "quiet"}>
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

      <Section title="Reset" tone="danger">
        <ResetForm />
      </Section>
    </>
  );
}
