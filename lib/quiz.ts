import "server-only";
import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { getDb } from "./db";
import { guesses, guests, questions } from "./db/schema";
import { isCorrect, scoreList } from "./marking";
import { DEFAULT_QUESTIONS, type QuizView, type Standing } from "./questions";

export type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

const isQuestion = (n: number) => Number.isInteger(n) && n >= 0 && n < DEFAULT_QUESTIONS.length && !DEFAULT_QUESTIONS[n].retired;

export async function getQuestions() {
  const rows = await (await getDb()).select().from(questions);
  return DEFAULT_QUESTIONS.flatMap((d, n) => {
    if (d.retired) return [];
    const row = rows.find((r) => r.n === n);
    return { n, prompt: row?.prompt ?? d.prompt, answer: row?.answer ?? d.answer ?? "", multi: row?.multi ?? !!d.multi, manual: !!d.manual, options: d.options, tag: d.tag };
  });
}

export async function saveQuestion(n: number, prompt: string, answer: string, multi: boolean): Promise<Result> {
  if (!isQuestion(n)) return { ok: false, error: "No such question." };
  prompt = prompt.trim();
  if (!prompt) return { ok: false, error: "The question can't be empty." };
  const row = { n, prompt, answer: answer.trim() || null, multi };
  await (await getDb()).insert(questions).values(row).onConflictDoUpdate({ target: questions.n, set: row });
  return { ok: true };
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

type Question = Awaited<ReturnType<typeof getQuestions>>[number];

/** The admin's mark if there is one, else marked against the answer; null while it's waiting for a person or an answer. */
function mark(q: Question, value: string, override: number | null): number | null {
  if (override !== null) return override;
  if (!q.answer || q.manual) return null;
  return q.multi ? scoreList(q.answer, value) : isCorrect(q.answer, value) ? 1 : 0;
}

/** Every guess, marked: the admin's view. */
export async function getMarkedGuesses() {
  const db = await getDb();
  const [qs, rows] = await Promise.all([
    getQuestions(),
    db
      .select({ guestId: guesses.guestId, name: guests.name, n: guesses.n, value: guesses.value, override: guesses.points })
      .from(guesses)
      .innerJoin(guests, eq(guests.id, guesses.guestId))
      .orderBy(guesses.createdAt),
  ]);
  // Answers to retired questions drop out.
  return rows.flatMap((r) => {
    const q = qs.find((q) => q.n === r.n);
    return q ? [{ ...r, points: mark(q, r.value, r.override) }] : [];
  });
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

/** A player's view of every question: their own guess and its points, never the answer. */
export async function getQuizViews(guestId?: string): Promise<QuizView[]> {
  const [qs, marked] = await Promise.all([getQuestions(), guestId ? getMarkedGuesses() : Promise.resolve([])]);
  return qs.map((q) => {
    const g = marked.find((m) => m.guestId === guestId && m.n === q.n);
    return { n: q.n, prompt: q.prompt, multi: q.multi, options: q.options, tag: q.tag, guess: g?.value, points: g?.points };
  });
}

export async function setPoints(guestId: string, n: number, points: number | null): Promise<Result> {
  if (points !== null && (!Number.isInteger(points) || points < 0 || points > 50)) return { ok: false, error: "Bad score." };
  await (await getDb())
    .update(guesses)
    .set({ points })
    .where(and(eq(guesses.guestId, guestId), eq(guesses.n, n)));
  return { ok: true };
}

/** Deletes every player and their answers (GDPR: run after the event). Questions and answers stay. */
export async function wipePlayers(): Promise<Result> {
  await (await getDb()).delete(guests);
  return { ok: true };
}
