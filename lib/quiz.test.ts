import { expect, it } from "vitest";
import * as quiz from "./quiz";

it("marks single and list questions, honours overrides, and wipes players", async () => {
  const a = await quiz.createGuest("  Dave ");
  const b = await quiz.createGuest("Sam");
  if (!a.ok || !b.ok) throw new Error("join failed");

  expect((await quiz.submitGuess(a.id, 1, "James Robert")).ok).toBe(true);
  expect(await quiz.submitGuess(a.id, 1, "again")).toEqual({ ok: false, error: "You've already locked in an answer." });
  await quiz.submitGuess(a.id, 7, "Oasis, Blur, The Killers");
  await quiz.submitGuess(b.id, 1, "Peter");

  // Nothing marked until the answers are in.
  expect((await quiz.getQuizViews(a.id)).find((q) => q.n === 1)).toMatchObject({ guess: "James Robert", points: null });

  await quiz.saveQuestion(1, "What are Sarah's middle names?", "James Robbert", false);
  await quiz.saveQuestion(7, "Name Mark's top 3 musical artists.", "Oasis, Killers, Coldplay", true);
  expect(await quiz.getLeaderboard(a.id)).toMatchObject([
    { name: "Dave", score: 3, me: true },
    { name: "Sam", score: 0, me: false },
  ]);

  await quiz.setPoints(b.id, 1, 1);
  expect((await quiz.getLeaderboard()).find((s) => s.name === "Sam")?.score).toBe(1);
  expect((await quiz.getQuizViews(b.id)).find((q) => q.n === 1)?.points).toBe(1);

  // Open-ended questions wait for the admin even when an answer is set.
  await quiz.submitGuess(a.id, 3, "Astronaut");
  await quiz.saveQuestion(3, "Dream job?", "Football pundit", false);
  expect((await quiz.getQuizViews(a.id))[3].points).toBeNull();
  await quiz.setPoints(a.id, 3, 1);
  expect((await quiz.getQuizViews(a.id))[3].points).toBe(1);

  // Retired questions are hidden and can't be answered.
  expect((await quiz.getQuestions()).some((q) => q.n === 5)).toBe(false);
  expect((await quiz.submitGuess(a.id, 5, "Someone")).ok).toBe(false);

  await quiz.wipePlayers();
  expect(await quiz.getLeaderboard()).toEqual([]);
  expect((await quiz.getQuestions()).find((q) => q.n === 1)?.answer).toBe("James Robbert");
});
