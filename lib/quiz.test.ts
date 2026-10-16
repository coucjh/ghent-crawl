import { expect, it } from "vitest";
import { QUESTIONS } from "./questions";
import * as quiz from "./quiz";

const n = (prompt: string) => QUESTIONS.findIndex((q) => q.prompt.includes(prompt));

it("marks guesses against the fixed answers and wipes players", async () => {
  const a = await quiz.createGuest("  Dave ");
  const b = await quiz.createGuest("Sam");
  if (!a.ok || !b.ok) throw new Error("join failed");

  const middle = n("Mark's middle names");
  const song = n("Spotify");
  expect((await quiz.submitGuess(a.id, middle, "frank & grosvenor")).ok).toBe(true);
  expect(await quiz.submitGuess(a.id, middle, "again")).toEqual({ ok: false, error: "You've already locked in an answer." });
  await quiz.submitGuess(a.id, song, "UFOF by Big Thief");
  await quiz.submitGuess(b.id, middle, "Peter");

  expect(await quiz.getLeaderboard(a.id)).toMatchObject([
    { name: "Dave", score: 2, me: true },
    { name: "Sam", score: 0, me: false },
  ]);

  // No answer yet: waits as "not marked yet" and scores nothing.
  const sarah = n("Sarah's middle names");
  if (!QUESTIONS[sarah].answer) {
    await quiz.submitGuess(b.id, sarah, "Jane");
    expect((await quiz.getQuizViews(b.id)).find((q) => q.n === sarah)?.points).toBeNull();
  }

  // Retired questions are hidden and can't be answered.
  const retired = n("first kiss");
  expect((await quiz.getQuizViews()).some((q) => q.n === retired)).toBe(false);
  expect((await quiz.submitGuess(a.id, retired, "Someone")).ok).toBe(false);

  await quiz.deleteGuest(b.id);
  expect((await quiz.getLeaderboard()).map((s) => s.name)).toEqual(["Dave"]);

  await quiz.wipePlayers();
  expect(await quiz.getLeaderboard()).toEqual([]);
});

it("every multiple-choice answer is one of its options", () => {
  for (const q of QUESTIONS) if (q.options && q.answer) expect(q.options).toContain(q.answer);
});
