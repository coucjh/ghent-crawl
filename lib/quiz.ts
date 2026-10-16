import "server-only";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { guesses, guests } from "./db/schema";
import { isCorrect, scoreList } from "./marking";
import { QUESTIONS, type QuizView, type Standing } from "./questions";

export type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

const isQuestion = (n: number) => Number.isInteger(n) && n >= 0 && n < QUESTIONS.length && !QUESTIONS[n].retired;

/** Points for a guess at question n; null while its answer isn't known yet (or the question is retired). */
function mark(n: number, value: string): number | null {
  const q = QUESTIONS[n];
  if (!q || q.retired || !q.answer) return null;
  return q.multi ? scoreList(q.answer, value) : isCorrect(q.answer, value) ? 1 : 0;
}

export async function createGuest(name: string): Promise<Result<{ id: string }>> {
  name = name.trim().replace(/\s+/g, " ");
  if (!name) return { ok: false, error: "Tell us your first name." };
  if (name.length > 24) return { ok: false, error: "Just your first name." };
  const id = randomUUID();
  await (await getDb()).insert(guests).values({ id, name });
  return { ok: true, id };
}

export async function getGuest(id: string) {
  const [g] = await (await getDb()).select().from(guests).where(eq(guests.id, id));
  return g ?? null;
}

export async function submitGuess(guestId: string, n: number, value: string): Promise<Result> {
  if (!isQuestion(n)) return { ok: false, error: "No such question." };
  value = value.trim();
  if (!value) return { ok: false, error: "Type an answer first." };
  if (value.length > 300) return { ok: false, error: "Keep it shorter." };
  const inserted = await (await getDb()).insert(guesses).values({ guestId, n, value }).onConflictDoNothing().returning();
  return inserted.length ? { ok: true } : { ok: false, error: "You've already locked in an answer." };
}

/** Every guess at a live question, marked. */
export async function getMarkedGuesses() {
  const rows = await (await getDb())
    .select({ guestId: guesses.guestId, name: guests.name, n: guesses.n, value: guesses.value })
    .from(guesses)
    .innerJoin(guests, eq(guests.id, guesses.guestId))
    .orderBy(guesses.createdAt);
  return rows.filter((r) => isQuestion(r.n)).map((r) => ({ ...r, points: mark(r.n, r.value) }));
}

export async function getLeaderboard(meId?: string): Promise<Standing[]> {
  const [people, marked] = await Promise.all([(await getDb()).select().from(guests), getMarkedGuesses()]);
  return people
    .map((p) => ({
      id: p.id,
      name: p.name,
      score: marked.filter((m) => m.guestId === p.id).reduce((sum, m) => sum + (m.points ?? 0), 0),
      me: p.id === meId,
    }))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
}

/** A player's view of every live question: their own guess and its points, never the answer. */
export async function getQuizViews(guestId?: string): Promise<QuizView[]> {
  const mine = guestId ? (await getMarkedGuesses()).filter((m) => m.guestId === guestId) : [];
  return QUESTIONS.flatMap((q, n) => {
    if (q.retired) return [];
    const g = mine.find((m) => m.n === n);
    return [{ n, prompt: q.prompt, multi: !!q.multi, options: q.options, tag: q.tag, guess: g?.value, points: g?.points }];
  });
}

export async function deleteGuest(id: string): Promise<Result> {
  await (await getDb()).delete(guests).where(eq(guests.id, id));
  return { ok: true };
}

/** Deletes every player and their answers (GDPR: run after the event). */
export async function wipePlayers(): Promise<Result> {
  await (await getDb()).delete(guests);
  return { ok: true };
}
