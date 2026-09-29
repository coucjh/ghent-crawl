import type { Station } from "@/lib/types";

// Stand-in for content/quiz.ts in tests, so the real questions can change freely.

export const MAX_ORDERS = 4;

const filler = (id: number, word: string): Station => ({
  id,
  name: `Station ${id}`,
  pub: `Pub ${id}`,
  word,
  questions: [{ id: "q1", type: "text", prompt: "Filler?", answers: ["filler"] }],
});

export const STATIONS: Station[] = [
  {
    id: 1,
    name: "Of Ghent",
    pub: "The First Tavern",
    word: "pax",
    questions: [
      { id: "q1", type: "text", prompt: "Castle?", answers: ["Gravensteen", "'s-Gravensteen", "Castle of the Counts"] },
      { id: "q2", type: "choice", prompt: "River?", options: ["Scheldt", "Meuse", "Rhine", "Yser"], answer: "Scheldt" },
      { id: "q3", type: "text", prompt: "Mystic…?", answers: ["Lamb"] },
      { id: "q4", type: "text", prompt: "Painters?", answers: ["Van Eyck"] },
      { id: "q5", type: "text", prompt: "Emperor?", answers: ["Charles V"] },
      { id: "q6", type: "choice", prompt: "Language?", options: ["Dutch", "French"], answer: "Dutch" },
      { id: "q7", type: "text", prompt: "Festival?", answers: ["Gentse Feesten"] },
      { id: "q8", type: "text", prompt: "Weathervane?", answers: ["Dragon", "A dragon"], points: 2 },
    ],
  },
  filler(2, "lupulus"),
  filler(3, "sanctus"),
  filler(4, "gratia"),
  filler(5, "amen"),
];
