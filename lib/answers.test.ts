import { expect, it } from "vitest";
import { isCorrect, scoreList } from "./marking";
import { QUESTIONS } from "./questions";

const answer = (prompt: string) => QUESTIONS.find((q) => q.prompt.includes(prompt))!.answer;

it("accepts the ways people will type the free-text answers", () => {
  for (const g of ["Jayne", "jayne", "Jane"]) expect(isCorrect(answer("Sarah's middle"), g), g).toBe(true);
  for (const g of ["Hanley Road", "hanley rd", "Hanley", "Handley Road"]) expect(isCorrect(answer("London"), g), g).toBe(true);
  for (const g of ["Right", "right side", "the right", "Right hand side"]) expect(isCorrect(answer("tattoo"), g), g).toBe(true);
  expect(isCorrect(answer("tattoo"), "Left")).toBe(false);
});

it("scores the top 3 artists a point each", () => {
  const a = answer("top 3 musical");
  expect(scoreList(a, "The National, LCD Soundsystem, Frank Ocean")).toBe(3);
  expect(scoreList(a, "frank ocean, lcd sound system, Radiohead")).toBe(2);
  expect(scoreList(a, "national")).toBe(1);
});

it("has an answer for every live question but the proposal", () => {
  const missing = QUESTIONS.filter((q) => !q.retired && !q.answer).map((q) => q.prompt);
  expect(missing).toEqual(["Where did Mark propose?"]);
});
