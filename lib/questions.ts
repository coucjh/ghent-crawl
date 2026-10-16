/** Two questions per stop, in stop order. The admin can reword them and sets the correct answers. */
export const PER_STOP = 2;

export const DEFAULT_QUESTIONS: { prompt: string; multi?: boolean }[] = [
  { prompt: "What are Mark's middle names?" },
  { prompt: "What are Sarah's middle names?" },
  { prompt: "Where was their first holiday together?" },
  { prompt: "If Mark could have any job outside of the law, what would it be?" },
  { prompt: "Who is Mark's favourite ever Newcastle player?" },
  { prompt: "Who was Mark's first kiss?" },
  { prompt: "Name all of Mark's significant girlfriends (as judged by Mark).", multi: true },
  { prompt: "Name Mark's top 3 musical artists.", multi: true },
  { prompt: "Which side of his body is Mark's shark tattoo on?" },
  { prompt: "What does Sarah say is Mark's best trait?" },
  { prompt: "Where did Mark propose?" },
  { prompt: "Who said “I love you” first?" },
];

export const stopOf = (n: number) => Math.floor(n / PER_STOP);

/** What a player's phone gets for each question: never the answer. `points` is null until it can be marked. */
export type QuizView = { n: number; prompt: string; multi: boolean; guess?: string; points?: number | null };
export type Standing = { id: string; name: string; score: number; me: boolean };
