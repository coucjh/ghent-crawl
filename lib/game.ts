import "server-only";
import { randomUUID } from "node:crypto";
import { and, eq, lte } from "drizzle-orm";
import { MAX_ORDERS, PILGRIMAGES, STATIONS } from "@/content/quiz";
import { CROWNED_PHOTO_POINTS, LAST_ORDERS_SECONDS, ORDER_EMOJI, roman } from "./config";
import { getDb } from "./db";
import { answers, game, players, stationStates, teams, teamStations } from "./db/schema";
import { isCorrect, wordMatches } from "./marking";
import type { ChoiceQuestion, Pilgrimage, PublicQuestion, Question, Station, StationStatus, TextQuestion } from "./types";

// All game rules live here. Pages and server actions call these functions and never touch the tables directly.

export type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };
const fail = (error: string) => ({ ok: false as const, error });

const FINAL_STATION = STATIONS[STATIONS.length - 1];

export function stationById(id: number): Station | undefined {
  return STATIONS.find((s) => s.id === id);
}

// Pilgrimages are stored like Stations (answers, a status) under ids 101, 102…, but have no Word.
const PILGRIMAGE_BASE = 100;
/** The id of the nth Pilgrimage (1-based), as used in URLs: /pilgrimage/n. */
export const pilgrimageId = (n: number) => PILGRIMAGE_BASE + n;
export const isPilgrimage = (id: number) => id > PILGRIMAGE_BASE;
const pilgrimageOf = (id: number): Pilgrimage | undefined => (isPilgrimage(id) ? PILGRIMAGES[id - PILGRIMAGE_BASE - 1] : undefined);

/** Anything with questions to answer: a Station, or a Pilgrimage. */
type Round = { id: number; name: string; pub: string; label: string; questions: Question[]; pilgrimage?: Pilgrimage };

function roundById(id: number): Round | undefined {
  const p = pilgrimageOf(id);
  if (p) return { id, name: p.name, pub: "the road between taverns", label: `✦${roman(id - PILGRIMAGE_BASE)}`, questions: p.questions, pilgrimage: p };
  const s = stationById(id);
  return s && { ...s, label: roman(s.id) };
}

/** How a round is named in passing: "Station II", "the First Pilgrimage". */
export function roundName(id: number) {
  const p = pilgrimageOf(id);
  return p ? p.name.replace(/^The /, "the ") : `Station ${roman(id)}`;
}

/** Every Pilgrimage's id, in order. */
export const PILGRIMAGE_IDS = PILGRIMAGES.map((_, i) => pilgrimageId(i + 1));

/** Rounds in the order their points land: each Pilgrimage just before the Station whose opening closes it. */
const ROUNDS_IN_ORDER: Round[] = STATIONS.flatMap((s) => [
  ...PILGRIMAGE_IDS.filter((id) => pilgrimageOf(id)!.closesWith === s.id).map((id) => roundById(id)!),
  roundById(s.id)!,
]);

/** One answer box: what a player fills in and how it is marked. Answers are stored per part id.
 *  Photo parts have no `markAs`: the Abbots crown one photo instead. */
type Part = { id: string; label?: string; markAs: TextQuestion | ChoiceQuestion | null; points: number };

function partsOf(q: Question): Part[] {
  if (q.type === "photo") return [{ id: q.id, markAs: null, points: q.points ?? CROWNED_PHOTO_POINTS }];
  const points = q.points ?? 1;
  if (q.type !== "music") return [{ id: q.id, markAs: q, points }];
  const text = (answers: string[]): TextQuestion => ({ id: q.id, type: "text", prompt: q.prompt, answers });
  return [
    { id: `${q.id}.artist`, label: "Artist", markAs: text(q.artist), points },
    { id: `${q.id}.song`, label: "Song", markAs: text(q.song), points },
  ];
}

function findPart(questions: Question[], partId: string) {
  for (const question of questions) {
    const part = partsOf(question).find((p) => p.id === partId);
    if (part) return { question, part };
  }
  return null;
}

const maxPoints = (questions: Question[]) => questions.flatMap(partsOf).reduce((n, p) => n + p.points, 0);
const acceptedOf = (p: Part) => (!p.markAs ? [] : p.markAs.type === "choice" ? [p.markAs.answer] : p.markAs.answers);

function publicQuestion(q: Question): PublicQuestion {
  return {
    id: q.id,
    type: q.type,
    prompt: q.prompt,
    image: q.image,
    clip: q.type === "music" ? q.clip : undefined,
    parts: partsOf(q).map((p) => ({
      id: p.id,
      label: p.label,
      kind: p.markAs?.type ?? "photo",
      options: p.markAs?.type === "choice" ? p.markAs.options : undefined,
      points: p.points,
    })),
  };
}

// ─── Station lifecycle ──────────────────────────────────────────────────────

type StationState = { status: StationStatus; closesAt: Date | null };

/** Closes any Station whose "Last Orders" countdown has run out. Called before every read and write. */
async function settle() {
  const db = await getDb();
  const expired = await db
    .select({ stationId: stationStates.stationId })
    .from(stationStates)
    .where(and(eq(stationStates.status, "open"), lte(stationStates.closesAt, new Date())));
  for (const s of expired) await closeStation(s.stationId);
}

export async function getStationStates(): Promise<Map<number, StationState>> {
  await settle();
  const db = await getDb();
  const rows = await db.select().from(stationStates);
  const byId = new Map(rows.map((r) => [r.stationId, r]));
  return new Map(
    ROUNDS_IN_ORDER.map((r) => {
      const row = byId.get(r.id);
      return [r.id, { status: row?.status ?? "sealed", closesAt: row?.closesAt ?? null }];
    }),
  );
}

export async function openStation(stationId: number): Promise<Result> {
  if (!stationById(stationId)) return fail("No such Station.");
  const states = await getStationStates();
  if (states.get(stationId)?.status !== "sealed") return fail("This Station is not sealed.");
  for (const s of STATIONS) {
    const status = states.get(s.id)!.status;
    if (status === "open") return fail(`Station ${s.id} is still open.`);
    if (s.id < stationId && status !== "closed") return fail(`Station ${s.id} has not been held yet.`);
  }
  const db = await getDb();
  await db
    .insert(stationStates)
    .values({ stationId, status: "open" })
    .onConflictDoUpdate({ target: stationStates.stationId, set: { status: "open", closesAt: null } });

  // Pilgrimages ride along with the pub Stations: no Abbot action needed. Close before opening, so a hand-over works.
  for (const id of PILGRIMAGE_IDS) if (pilgrimageOf(id)!.closesWith === stationId) await closeStation(id);
  for (const id of PILGRIMAGE_IDS)
    if (pilgrimageOf(id)!.opensWith === stationId)
      await db.insert(stationStates).values({ stationId: id, status: "open" }).onConflictDoNothing();
  return { ok: true };
}

export async function callLastOrders(stationId: number, seconds = LAST_ORDERS_SECONDS): Promise<Result> {
  if (isPilgrimage(stationId)) return fail("A Pilgrimage closes when its Station opens.");
  const states = await getStationStates();
  if (states.get(stationId)?.status !== "open") return fail("This Station is not open.");
  const db = await getDb();
  await db
    .update(stationStates)
    .set({ closesAt: new Date(Date.now() + seconds * 1000) })
    .where(eq(stationStates.stationId, stationId));
  return { ok: true };
}

/** Closes a round for everyone and marks every answer. Idempotent: only the call that flips the status marks. */
export async function closeStation(stationId: number): Promise<Result> {
  const station = roundById(stationId);
  if (!station) return fail("No such Station.");
  const db = await getDb();
  const flipped = await db
    .update(stationStates)
    .set({ status: "closed", closedAt: new Date() })
    .where(and(eq(stationStates.stationId, stationId), eq(stationStates.status, "open")))
    .returning();
  if (flipped.length === 0) return fail("This Station is not open.");

  const given = await db.select().from(answers).where(eq(answers.stationId, stationId));
  for (const a of given) {
    const found = findPart(station.questions, a.questionId);
    if (found && !found.part.markAs) continue; // photos: the Abbots' crown decides
    await db
      .update(answers)
      .set({ correct: found?.part.markAs ? isCorrect(found.part.markAs, a.value) : false })
      .where(and(eq(answers.teamId, a.teamId), eq(answers.stationId, stationId), eq(answers.questionId, a.questionId)));
  }
  return { ok: true };
}

// ─── Orders & players ───────────────────────────────────────────────────────

/** New Orders and new members are refused once Station I has opened. */
export async function joiningLocked() {
  const states = await getStationStates();
  return states.get(STATIONS[0].id)!.status !== "sealed";
}

function cleanName(s: string, max: number) {
  return s.replace(/\s+/g, " ").trim().slice(0, max);
}

export async function foundOrder(
  rawName: string,
  rawFirstName: string,
  emoji: string,
): Promise<Result<{ playerId: string }>> {
  const name = cleanName(rawName, 40);
  const firstName = cleanName(rawFirstName, 24);
  if (!name) return fail("Your Order needs a name.");
  if (!firstName) return fail("Tell us your name, Brother or Sister.");
  if (await joiningLocked()) return fail("The pilgrimage has begun — no new Orders may be founded.");

  const db = await getDb();
  const existing = await db.select().from(teams);
  if (existing.length >= MAX_ORDERS) return fail(`The Abbey holds only ${MAX_ORDERS} Orders.`);
  if (existing.some((t) => t.name.toLowerCase() === name.toLowerCase())) return fail("That Order already exists.");
  if (!ORDER_EMOJI.includes(emoji)) return fail("Choose an emblem for your Order.");
  if (existing.some((t) => t.emoji === emoji)) return fail("Another Order already bears that emblem.");

  const teamId = randomUUID();
  const playerId = randomUUID();
  await db.insert(teams).values({ id: teamId, name, emoji });
  await db.insert(players).values({ id: playerId, teamId, firstName });
  return { ok: true, playerId };
}

/** The Orders a player can choose from when joining. */
export async function listOrders() {
  const db = await getDb();
  return db.select({ id: teams.id, name: teams.name, emoji: teams.emoji }).from(teams).orderBy(teams.createdAt);
}

/** Joins an existing Order. Re-joining with an existing first name restores that player — even after joining locks. */
export async function joinOrder(teamId: string, rawFirstName: string): Promise<Result<{ playerId: string }>> {
  const firstName = cleanName(rawFirstName, 24);
  if (!teamId) return fail("Choose your Order.");
  if (!firstName) return fail("Tell us your name, Brother or Sister.");

  const db = await getDb();
  const [team] = await db.select().from(teams).where(eq(teams.id, teamId));
  if (!team) return fail("That Order no longer exists.");

  const members = await db.select().from(players).where(eq(players.teamId, team.id));
  const same = members.find((p) => p.firstName.toLowerCase() === firstName.toLowerCase());
  if (same) return { ok: true, playerId: same.id };
  if (await joiningLocked()) return fail("The pilgrimage has begun — only existing members may rejoin.");

  const playerId = randomUUID();
  await db.insert(players).values({ id: playerId, teamId: team.id, firstName });
  return { ok: true, playerId };
}

export async function getPlayer(playerId: string) {
  const db = await getDb();
  const [row] = await db
    .select({ player: players, team: teams })
    .from(players)
    .innerJoin(teams, eq(players.teamId, teams.id))
    .where(eq(players.id, playerId));
  if (!row) return null;
  const members = await db.select().from(players).where(eq(players.teamId, row.team.id)).orderBy(players.createdAt);
  return { ...row, members: members.map((m) => m.firstName) };
}

export async function renameOrder(teamId: string, rawName: string): Promise<Result> {
  const name = cleanName(rawName, 40);
  if (!name) return fail("An Order needs a name.");
  const db = await getDb();
  await db.update(teams).set({ name }).where(eq(teams.id, teamId));
  return { ok: true };
}

/** Returns the Order's photo keys so the caller can delete the files too. */
export async function deleteOrder(teamId: string): Promise<Result<{ photos: string[] }>> {
  const photos = await photoKeys(teamId);
  const db = await getDb();
  await db.delete(teams).where(eq(teams.id, teamId));
  return { ok: true, photos };
}

// ─── Playing a Station ──────────────────────────────────────────────────────

async function teamStation(teamId: string, stationId: number) {
  const db = await getDb();
  const [row] = await db
    .select()
    .from(teamStations)
    .where(and(eq(teamStations.teamId, teamId), eq(teamStations.stationId, stationId)));
  return row ?? null;
}

async function unlock(teamId: string, stationId: number) {
  const db = await getDb();
  await db.insert(teamStations).values({ teamId, stationId }).onConflictDoNothing();
}

export async function speakWord(teamId: string, stationId: number, attempt: string): Promise<Result> {
  const station = stationById(stationId);
  if (!station) return fail("No such Station.");
  const states = await getStationStates();
  if (states.get(stationId)?.status !== "open") return fail("The Abbots have not opened this Station.");
  if (!wordMatches(station.word, attempt)) return fail("That is not the Word. Ask the barkeep again.");
  await unlock(teamId, stationId);
  return { ok: true };
}

/** Abbot override for when the barkeep loses the Word. */
export async function grantEntry(teamId: string, stationId: number): Promise<Result> {
  if (!stationById(stationId)) return fail("No such Station.");
  await unlock(teamId, stationId);
  return { ok: true };
}

async function assertCanWrite(teamId: string, stationId: number): Promise<Result<{ station: Round }>> {
  const station = roundById(stationId);
  if (!station) return fail("No such Station.");
  const states = await getStationStates();
  if (states.get(stationId)?.status !== "open") return fail("This Station is closed.");
  if (isPilgrimage(stationId)) return { ok: true, station }; // no Word, no sealing
  const ts = await teamStation(teamId, stationId);
  if (!ts) return fail("Speak the Word first.");
  if (ts.sealedAt) return fail("Your answers are sealed.");
  return { ok: true, station };
}

export async function saveAnswer(teamId: string, stationId: number, questionId: string, rawValue: string): Promise<Result> {
  const check = await assertCanWrite(teamId, stationId);
  if (!check.ok) return check;
  const found = findPart(check.station.questions, questionId);
  if (!found) return fail("No such question.");
  const { markAs } = found.part;
  if (!markAs) return fail("Photos are sent with savePhoto.");
  const value = rawValue.slice(0, 200);
  if (markAs.type === "choice" && value !== "" && !markAs.options.includes(value)) return fail("Not one of the options.");

  const db = await getDb();
  await db
    .insert(answers)
    .values({ teamId, stationId, questionId, value })
    .onConflictDoUpdate({
      target: [answers.teamId, answers.stationId, answers.questionId],
      set: { value, updatedAt: new Date() },
    });
  return { ok: true };
}

export async function sealAnswers(teamId: string, stationId: number): Promise<Result> {
  if (isPilgrimage(stationId)) return fail("A Pilgrimage is never sealed; it closes when its Station opens.");
  const check = await assertCanWrite(teamId, stationId);
  if (!check.ok) return check;
  const db = await getDb();
  await db
    .update(teamStations)
    .set({ sealedAt: new Date() })
    .where(and(eq(teamStations.teamId, teamId), eq(teamStations.stationId, stationId)));
  return { ok: true };
}

/** Stores which photo an Order sent for a photo challenge. Replacing it loses any crown. Returns the photo it replaced. */
export async function savePhoto(
  teamId: string,
  stationId: number,
  questionId: string,
  key: string,
): Promise<Result<{ replaced: string | null }>> {
  const check = await assertCanWrite(teamId, stationId);
  if (!check.ok) return check;
  const found = findPart(check.station.questions, questionId);
  if (!found || found.part.markAs) return fail("That is not a photo challenge.");

  const db = await getDb();
  const where = and(eq(answers.teamId, teamId), eq(answers.stationId, stationId), eq(answers.questionId, questionId));
  const [previous] = await db.select().from(answers).where(where);
  await db
    .insert(answers)
    .values({ teamId, stationId, questionId, value: key })
    .onConflictDoUpdate({
      target: [answers.teamId, answers.stationId, answers.questionId],
      set: { value: key, updatedAt: new Date(), correct: null },
    });
  return { ok: true, replaced: previous?.value || null };
}

/** The Abbots crown the one photo that scores for a challenge. Crowning another moves the crown. */
export async function crownPhoto(stationId: number, questionId: string, teamId: string): Promise<Result> {
  const found = findPart(roundById(stationId)?.questions ?? [], questionId);
  if (!found || found.part.markAs) return fail("That is not a photo challenge.");
  const db = await getDb();
  const challenge = and(eq(answers.stationId, stationId), eq(answers.questionId, questionId));
  const [entry] = await db.select().from(answers).where(and(challenge, eq(answers.teamId, teamId)));
  if (!entry?.value) return fail("That Order sent no photo.");
  await db.update(answers).set({ correct: false }).where(challenge);
  await db.update(answers).set({ correct: true }).where(and(challenge, eq(answers.teamId, teamId)));
  return { ok: true };
}

export type PhotoChallenge = {
  roundId: number;
  partId: string;
  prompt: string;
  painting: string;
  status: StationStatus;
  entries: { teamId: string; name: string; emoji: string; key: string; crowned: boolean }[];
};

/** For the Abbots: every photo challenge with the photos sent so far, in founding order. */
export async function getPhotoBoard(): Promise<PhotoChallenge[]> {
  const states = await getStationStates();
  const db = await getDb();
  const [rows, allTeams] = await Promise.all([db.select().from(answers), db.select().from(teams).orderBy(teams.createdAt)]);
  return PILGRIMAGE_IDS.flatMap((roundId) =>
    pilgrimageOf(roundId)!.questions.flatMap((q) =>
      q.type !== "photo"
        ? []
        : [
            {
              roundId,
              partId: q.id,
              prompt: q.prompt,
              painting: q.image,
              status: states.get(roundId)!.status,
              entries: allTeams.flatMap((t) => {
                const a = rows.find((r) => r.teamId === t.id && r.stationId === roundId && r.questionId === q.id);
                return a?.value ? [{ teamId: t.id, name: t.name, emoji: t.emoji, key: a.value, crowned: a.correct === true }] : [];
              }),
            },
          ],
    ),
  );
}

/** Every stored photo key, optionally for one Order — so the files can be deleted with it. */
async function photoKeys(teamId?: string) {
  const db = await getDb();
  const rows = await db.select().from(answers);
  return rows
    .filter((r) => (!teamId || r.teamId === teamId) && r.value && findPart(roundById(r.stationId)?.questions ?? [], r.questionId)?.part.markAs === null)
    .map((r) => r.value);
}

export async function appeal(teamId: string, stationId: number, questionId: string): Promise<Result> {
  if (findPart(roundById(stationId)?.questions ?? [], questionId)?.part.markAs === null) return fail("Photos can't be appealed.");
  const states = await getStationStates();
  if (states.get(stationId)?.status !== "closed") return fail("Appeals open once the Station closes.");
  const db = await getDb();
  const key = and(eq(answers.teamId, teamId), eq(answers.stationId, stationId), eq(answers.questionId, questionId));
  const [row] = await db.select().from(answers).where(key);
  if (!row || row.correct !== false || !row.value.trim()) return fail("There is nothing to appeal.");
  if (row.appeal) return fail("This answer has already been appealed.");
  await db.update(answers).set({ appeal: "pending" }).where(key);
  return { ok: true };
}

export async function resolveAppeal(
  teamId: string,
  stationId: number,
  questionId: string,
  accept: boolean,
): Promise<Result> {
  const db = await getDb();
  await db
    .update(answers)
    .set(accept ? { appeal: "accepted", correct: true } : { appeal: "rejected" })
    .where(and(eq(answers.teamId, teamId), eq(answers.stationId, stationId), eq(answers.questionId, questionId)));
  return { ok: true };
}

// ─── Views ──────────────────────────────────────────────────────────────────

export type AnswerView = { value: string; correct: boolean | null; appeal: "pending" | "accepted" | "rejected" | null };

export type StationView = {
  id: number;
  /** For a Pilgrimage: the Stations whose opening opens and closes it. */
  pilgrimage: { opensWith: number; closesWith: number } | null;
  /** "IV", or "✦" for the Pilgrimage. */
  label: string;
  name: string;
  pub: string;
  status: StationStatus;
  closesAt: string | null;
  unlocked: boolean;
  sealed: boolean;
  /** Present once the team has unlocked the Station, or once it has closed. */
  questions: PublicQuestion[] | null;
  answers: Record<string, AnswerView>;
  /** Present once closed: the correct answer to show beside each question. */
  corrections: Record<string, string> | null;
  score: number | null;
  maxScore: number;
  /** Closed, but a photo this Order sent hasn't been judged yet. */
  awaitingJudgement: boolean;
};

export async function getStationView(teamId: string, stationId: number): Promise<StationView | null> {
  const station = roundById(stationId);
  if (!station) return null;
  const state = (await getStationStates()).get(stationId)!;
  const pilgrimage = isPilgrimage(stationId);
  const ts = pilgrimage ? null : await teamStation(teamId, stationId);
  const unlocked = pilgrimage ? state.status !== "sealed" : !!ts;
  const db = await getDb();
  const rows = await db
    .select()
    .from(answers)
    .where(and(eq(answers.teamId, teamId), eq(answers.stationId, stationId)));

  const closed = state.status === "closed";
  const showQuestions = closed || (state.status === "open" && unlocked);
  return {
    id: station.id,
    pilgrimage: station.pilgrimage ? { opensWith: station.pilgrimage.opensWith, closesWith: station.pilgrimage.closesWith } : null,
    label: station.label,
    name: station.name,
    pub: station.pub,
    status: state.status,
    closesAt: state.closesAt?.toISOString() ?? null,
    unlocked,
    sealed: !!ts?.sealedAt,
    questions: showQuestions ? station.questions.map(publicQuestion) : null,
    answers: Object.fromEntries(rows.map((r) => [r.questionId, { value: r.value, correct: r.correct, appeal: r.appeal }])),
    corrections: closed
      ? Object.fromEntries(station.questions.flatMap(partsOf).flatMap((p) => (p.markAs ? [[p.id, acceptedOf(p)[0]]] : [])))
      : null,
    score: closed ? scoreRows(station, rows) : null,
    maxScore: maxPoints(station.questions),
    awaitingJudgement:
      closed && rows.some((r) => r.value && r.correct === null && findPart(station.questions, r.questionId)?.part.markAs === null),
  };
}

function scoreRows(station: { questions: Question[] }, rows: { questionId: string; correct: boolean | null }[]) {
  return rows.reduce((n, r) => {
    const found = findPart(station.questions, r.questionId);
    return n + (r.correct && found ? found.part.points : 0);
  }, 0);
}

export type Standing = {
  teamId: string;
  name: string;
  emoji: string;
  members: string[];
  score: number;
  /** The score before the most recently closed Station — the race animates from here. */
  previousScore: number;
  /** Founding order; each Order keeps its own lane in the race. */
  lane: number;
};

/** The round whose points landed most recently (rounds close in running order), or null. */
function lastClosedRound(states: Map<number, StationState>): number | null {
  return ROUNDS_IN_ORDER.findLast((r) => states.get(r.id)!.status === "closed")?.id ?? null;
}

/** Every Order with its total, highest first. Ties keep founding order. */
export async function getStandings(): Promise<Standing[]> {
  const states = await getStationStates();
  const lastClosed = lastClosedRound(states);
  // Points count once their round has closed — a crowned photo stays hidden until its Pilgrimage ends.
  const scored = ROUNDS_IN_ORDER.filter((r) => states.get(r.id)!.status === "closed");
  const db = await getDb();
  const [allTeams, allPlayers, correctRows] = await Promise.all([
    db.select().from(teams).orderBy(teams.createdAt),
    db.select().from(players).orderBy(players.createdAt),
    db.select().from(answers).where(eq(answers.correct, true)),
  ]);
  return allTeams
    .map((t, lane) => {
      const byStation = scored.map((s) => ({
        id: s.id,
        points: scoreRows(s, correctRows.filter((r) => r.teamId === t.id && r.stationId === s.id)),
      }));
      const score = byStation.reduce((n, s) => n + s.points, 0);
      return {
        teamId: t.id,
        name: t.name,
        emoji: t.emoji,
        members: allPlayers.filter((p) => p.teamId === t.id).map((p) => p.firstName),
        score,
        previousScore: score - (byStation.find((s) => s.id === lastClosed)?.points ?? 0),
        lane,
      };
    })
    .sort((a, b) => b.score - a.score);
}

/** Every round in the order it runs, with its state — the Book's "where are we" strip. */
export type RoundProgress = { id: number; name: string; status: StationStatus };

function roundProgress(states: Map<number, StationState>): RoundProgress[] {
  return ROUNDS_IN_ORDER.map((r) => ({
    id: r.id,
    name: isPilgrimage(r.id) ? r.name : `Station ${r.label}`,
    status: states.get(r.id)!.status,
  }));
}

export type Book =
  | { state: "open"; standings: Standing[]; rounds: RoundProgress[] }
  | { state: "sealed" }
  | { state: "revealed"; standings: Standing[]; rounds: RoundProgress[] };

/** The leaderboard as players see it: hidden from the moment the final Station opens until the Abbots reveal it. */
export async function getBook(): Promise<Book> {
  const states = await getStationStates();
  const db = await getDb();
  const [g] = await db.select().from(game).where(eq(game.id, 1));
  if (g?.revealedAt) return { state: "revealed", standings: await getStandings(), rounds: roundProgress(states) };
  if (states.get(FINAL_STATION.id)!.status !== "sealed") return { state: "sealed" };
  return { state: "open", standings: await getStandings(), rounds: roundProgress(states) };
}

export async function reveal(): Promise<Result> {
  const states = await getStationStates();
  if (states.get(FINAL_STATION.id)!.status !== "closed") return fail("The final Station must close first.");
  const db = await getDb();
  await db
    .insert(game)
    .values({ id: 1, revealedAt: new Date() })
    .onConflictDoUpdate({ target: game.id, set: { revealedAt: new Date() } });
  return { ok: true };
}

export type Dispute = {
  teamId: string;
  teamName: string;
  stationId: number;
  questionId: string;
  prompt: string;
  given: string;
  accepted: string[];
};

export async function getDisputes(): Promise<Dispute[]> {
  const db = await getDb();
  const rows = await db
    .select({ a: answers, teamName: teams.name })
    .from(answers)
    .innerJoin(teams, eq(answers.teamId, teams.id))
    .where(eq(answers.appeal, "pending"));
  return rows.flatMap(({ a, teamName }) => {
    const found = findPart(roundById(a.stationId)?.questions ?? [], a.questionId);
    if (!found) return [];
    return [
      {
        teamId: a.teamId,
        teamName,
        stationId: a.stationId,
        questionId: a.questionId,
        prompt: found.part.label ? `${found.question.prompt} (${found.part.label})` : found.question.prompt,
        given: a.value,
        accepted: acceptedOf(found.part),
      },
    ];
  });
}

/** How many answer boxes a round has (music questions count two). */
export const answerBoxes = (stationId: number) => roundById(stationId)?.questions.flatMap(partsOf).length ?? 0;

/** For the Abbots' dashboard: how many answer boxes each Order has filled in for a round. */
export async function getAnswerCounts(stationId: number) {
  const db = await getDb();
  const rows = await db.select().from(answers).where(eq(answers.stationId, stationId));
  const counts = new Map<string, number>();
  for (const r of rows) if (r.value.trim()) counts.set(r.teamId, (counts.get(r.teamId) ?? 0) + 1);
  return counts;
}

/** For the Abbots' dashboard: which Orders have unlocked / sealed the given Station. */
export async function getTeamProgress(stationId: number) {
  const db = await getDb();
  const rows = await db.select().from(teamStations).where(eq(teamStations.stationId, stationId));
  return new Map(rows.map((r) => [r.teamId, { sealed: !!r.sealedAt }]));
}

/** Wipes the night. Returns every photo key so the caller can delete the files too. */
export async function resetAbbey(): Promise<Result<{ photos: string[] }>> {
  const photos = await photoKeys();
  const db = await getDb();
  await db.delete(answers);
  await db.delete(teamStations);
  await db.delete(players);
  await db.delete(teams);
  await db.delete(stationStates);
  await db.delete(game);
  return { ok: true, photos };
}
