import { describe, expect, it } from "vitest";
import { isCorrect, wordMatches } from "./marking";
import type { ChoiceQuestion, TextQuestion } from "./types";

const text = (answers: string[]): TextQuestion => ({ id: "q", type: "text", prompt: "", answers });
const choice: ChoiceQuestion = { id: "q", type: "choice", prompt: "", options: ["Scheldt", "Meuse"], answer: "Scheldt" };

describe("isCorrect — text", () => {
  const q = text(["Gravensteen", "Castle of the Counts"]);

  it.each([
    ["Gravensteen"],
    ["  gravensteen "],
    ["GRAVENSTEEN!"],
    ["the Gravensteen"],
    ["het gravensteen"],
    ["Gravesteen"], // one typo
    ["castle of the counts"],
  ])("accepts %j", (answer) => expect(isCorrect(q, answer)).toBe(true));

  it.each([[""], ["   "], ["Belfort"], ["Graafsteen"]])("rejects %j", (answer) =>
    expect(isCorrect(q, answer)).toBe(false),
  );

  it("ignores accents", () => {
    expect(isCorrect(text(["Liège"]), "liege")).toBe(true);
    expect(isCorrect(text(["Dom Pérignon"]), "dom perignon")).toBe(true);
  });

  it("requires exact numbers", () => {
    const year = text(["1989"]);
    expect(isCorrect(year, "1989")).toBe(true);
    expect(isCorrect(year, "1988")).toBe(false);
  });

  it("does not forgive typos in very short answers", () => {
    expect(isCorrect(text(["Au"]), "Ag")).toBe(false);
    expect(isCorrect(text(["Lamb"]), "Lamp")).toBe(false);
  });

  it("forgives two typos in long answers", () => {
    expect(isCorrect(text(["Scriptorium"]), "Scriptorum")).toBe(true);
    expect(isCorrect(text(["Fermentation"]), "Fermentasion")).toBe(true);
  });
});

describe("isCorrect — choice", () => {
  it("accepts only the exact option", () => {
    expect(isCorrect(choice, "Scheldt")).toBe(true);
    expect(isCorrect(choice, "Meuse")).toBe(false);
    expect(isCorrect(choice, "")).toBe(false);
  });
});

describe("wordMatches", () => {
  it("ignores case and surrounding whitespace", () => {
    expect(wordMatches("Lupulus", "  lupulus ")).toBe(true);
    expect(wordMatches("lupulus", "lupulu")).toBe(false);
  });
});
