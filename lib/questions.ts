/** Two questions per stop, in stop order. The admin can reword them and sets the correct answers. */
export const PER_STOP = 2;

/**
 * `answer`: "/" separates accepted alternatives; in a `multi` (point per item) question "," separates the items.
 * `manual`: too open-ended to mark automatically, so the admin marks each answer by hand.
 * The admin page can override the wording and the answer.
 */
export const DEFAULT_QUESTIONS: { prompt: string; answer?: string; multi?: boolean; manual?: boolean }[] = [
  { prompt: "What are Mark's middle names?", answer: "" },
  { prompt: "What are Sarah's middle names?", answer: "" },
  { prompt: "Where was their first holiday together?", answer: "" },
  { prompt: "If Mark could have any job outside of the law, what would it be?", answer: "", manual: true },
  { prompt: "Who is Mark's favourite ever Newcastle player?", answer: "" },
  { prompt: "Who was Mark's first kiss?", answer: "" },
  { prompt: "Name all of Mark's significant girlfriends (as judged by Mark).", answer: "", multi: true },
  { prompt: "Name Mark's top 3 musical artists.", answer: "", multi: true },
  { prompt: "Which side of his body is Mark's shark tattoo on?", answer: "" },
  { prompt: "What does Sarah say is Mark's best trait?", answer: "", manual: true },
  { prompt: "Where did Mark propose?", answer: "", manual: true },
  { prompt: "Who said “I love you” first?", answer: "" },
];

export const stopOf = (n: number) => Math.floor(n / PER_STOP);

/** What a player's phone gets for each question: never the answer. `points` is null until it can be marked. */
export type QuizView = { n: number; prompt: string; multi: boolean; guess?: string; points?: number | null };
export type Standing = { id: string; name: string; score: number; me: boolean };
