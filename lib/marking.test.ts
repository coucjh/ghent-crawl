import { describe, expect, it } from "vitest";
import { isCorrect, scoreList } from "./marking";

describe("isCorrect", () => {
  it.each([["Alan Shearer"], ["  alan shearer! "], ["Alan Sheerer"], ["shearer"]])("accepts %j", (guess) =>
    expect(isCorrect("Alan Shearer / Shearer", guess)).toBe(true),
  );

  it.each([[""], ["Kevin Keegan"], ["Shear"]])("rejects %j", (guess) =>
    expect(isCorrect("Alan Shearer / Shearer", guess)).toBe(false),
  );

  it("ignores accents and leading articles", () => {
    expect(isCorrect("Mallorca", "mállorca")).toBe(true);
    expect(isCorrect("The Algarve", "algarve")).toBe(true);
  });

  it("does not forgive typos in short answers or numbers", () => {
    expect(isCorrect("Tim", "Tom")).toBe(false);
    expect(isCorrect("2009", "2008")).toBe(false);
  });
});

describe("scoreList", () => {
  const answer = "Oasis, The Killers, Kings of Leon / KOL";

  it("scores a point per item, in any order, typos forgiven", () => {
    expect(scoreList(answer, "kol, oasis")).toBe(2);
    expect(scoreList(answer, "Killers\nOasis\nKings of Lion")).toBe(3);
  });

  it("doesn't score the same item twice", () => expect(scoreList(answer, "Oasis, oasis, Oasis")).toBe(1));

  it("only counts as many guesses as there are items", () =>
    expect(scoreList(answer, "Blur, Pulp, Suede, Oasis")).toBe(0));
});
