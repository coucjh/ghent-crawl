import { expect, it } from "vitest";
import * as quiz from "./quiz";

it("marks single and list questions, honours overrides, and wipes players", async () => {
  const a = await quiz.createGuest("  Dave ");
  const b = await quiz.createGuest("Sam");
  if (!a.ok || !b.ok) throw new Error("join failed");

  expect((await quiz.submitGuess(a.id, 0, "James Robert")).ok).toBe(true);
  expect(await quiz.submitGuess(a.id, 0, "again")).toEqual({ ok: false, error: "You've already locked in an answer." });
  await quiz.submitGuess(a.id, 7, "Oasis, Blur, The Killers");
  await quiz.submitGuess(b.id, 0, "Peter");

  // Nothing marked until the answers are in.
  expect((await quiz.getQuizViews(a.id))[0]).toMatchObject({ guess: "James Robert", points: null });

  await quiz.saveQuestion(0, "What are Mark's middle names?", "James Robbert", false);
  await quiz.saveQuestion(7, "Name Mark's top 3 musical artists.", "Oasis, Killers, Coldplay", true);
  expect(await quiz.getLeaderboard(a.id)).toMatchObject([
    { name: "Dave", score: 3, me: true },
    { name: "Sam", score: 0, me: false },
  ]);

  await quiz.setPoints(b.id, 0, 1);
  expect((await quiz.getLeaderboard()).find((s) => s.name === "Sam")?.score).toBe(1);
  expect((await quiz.getQuizViews(b.id))[0].points).toBe(1);

  await quiz.wipePlayers();
  expect(await quiz.getLeaderboard()).toEqual([]);
  expect((await quiz.getQuestions())[0].answer).toBe("James Robbert");
});
