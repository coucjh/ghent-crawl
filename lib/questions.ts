/**
 * The quiz, in the order it was written. `n` (the index) is how saved answers refer to a question, so add new
 * questions at the end and place them with `stop`; never reorder or delete (set `retired` instead). Players see each
 * stop's questions in this order. Every answer is marked automatically against `answer`.
 *
 * `answer`: "/" separates accepted alternatives (small typos are forgiven); in a `multi` (point per item) question ","
 *   separates the items. Empty means not known yet: answers wait as "not marked yet".
 * `options`: multiple choice; `answer` is one of the options, copied exactly.
 * `tag`: a label shown above the question.
 * `retired`: dropped from the quiz; hidden everywhere and scores nothing.
 */
export const QUESTIONS: {
  stop: number;
  prompt: string;
  answer: string;
  multi?: boolean;
  options?: string[];
  tag?: string;
  retired?: boolean;
}[] = [
  { stop: 0, prompt: "What are Mark's middle names?", answer: "Frank Grosvenor / Frank and Grosvenor" },
  { stop: 0, prompt: "What are Sarah's middle names?", answer: "" },
  { stop: 1, prompt: "Where was their first holiday together?", answer: "" },
  // TODO: multiple choice once we have the real answer and two decoys.
  { stop: 1, prompt: "If Mark could have any job outside of the law, what would it be?", answer: "" },
  { stop: 2, prompt: "Who is Mark's favourite ever Newcastle player?", answer: "" },
  { stop: 2, prompt: "Who was Mark's first kiss?", answer: "", retired: true },
  { stop: 2, prompt: "Name all of Mark's significant girlfriends (as judged by Mark).", answer: "", multi: true, retired: true },
  { stop: 3, prompt: "Name Mark's top 3 musical artists.", answer: "", multi: true, tag: "🎵 Music round" },
  { stop: 4, prompt: "Which side of his body is Mark's shark tattoo on?", answer: "" },
  { stop: 4, prompt: "What does Sarah say is Mark's best trait?", answer: "" },
  // TODO: multiple choice once we have the real answer and two decoys.
  { stop: 5, prompt: "Where did Mark propose?", answer: "" },
  { stop: 5, prompt: "Who said “I love you” first?", answer: "", retired: true },
  {
    stop: 3,
    prompt: "What was Mark's top song on Spotify in 2020?",
    answer: "UFOF by Big Thief",
    options: ["UFOF by Big Thief", "All My Friends by LCD Soundsystem", "Money Trees by Kendrick Lamar"],
    tag: "🎵 Music round",
  },
  {
    stop: 5,
    prompt: "What date did they get engaged?",
    answer: "20 December 2025",
    options: ["13 December 2025", "20 December 2025", "24 December 2025"],
  },
  { stop: 2, prompt: "What was the name of the street of the first place they lived in London?", answer: "" },
];

export const stopOf = (n: number) => QUESTIONS[n].stop;

/** What a player's phone gets for each question: never the answer. `points` is null while the answer isn't known yet. */
export type QuizView = {
  n: number;
  prompt: string;
  multi: boolean;
  options?: string[];
  tag?: string;
  guess?: string;
  points?: number | null;
};
export type Standing = { id: string; name: string; score: number; me: boolean };
