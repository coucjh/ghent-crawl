/**
 * The quiz, in the order it was written. `n` (the index) is how saved answers refer to a question, so add new
 * questions at the end and place them with `stop`; never reorder or delete (set `retired` instead). Players see each
 * stop's questions in this order.
 *
 * `answer`: "/" separates accepted alternatives; in a `multi` (point per item) question "," separates the items.
 * `options`: multiple choice; the answer is one of the options, copied exactly.
 * `manual`: too open-ended to mark automatically, so the admin marks each answer by hand.
 * `tag`: a label shown above the question.
 * `retired`: dropped from the quiz; hidden everywhere and scores nothing.
 * The admin page can override the wording and the answer.
 */
export const DEFAULT_QUESTIONS: {
  stop: number;
  prompt: string;
  answer?: string;
  multi?: boolean;
  manual?: boolean;
  options?: string[];
  tag?: string;
  retired?: boolean;
}[] = [
  { stop: 0, prompt: "What are Mark's middle names?", answer: "Frank Grosvenor / Frank and Grosvenor" },
  { stop: 0, prompt: "What are Sarah's middle names?", answer: "" },
  { stop: 1, prompt: "Where was their first holiday together?", answer: "" },
  { stop: 1, prompt: "If Mark could have any job outside of the law, what would it be?", answer: "", manual: true },
  { stop: 2, prompt: "Who is Mark's favourite ever Newcastle player?", answer: "" },
  { stop: 2, prompt: "Who was Mark's first kiss?", answer: "", retired: true },
  { stop: 2, prompt: "Name all of Mark's significant girlfriends (as judged by Mark).", answer: "", multi: true, retired: true },
  { stop: 3, prompt: "Name Mark's top 3 musical artists.", answer: "", multi: true, tag: "🎵 Music round" },
  { stop: 4, prompt: "Which side of his body is Mark's shark tattoo on?", answer: "" },
  { stop: 4, prompt: "What does Sarah say is Mark's best trait?", answer: "", manual: true },
  { stop: 5, prompt: "Where did Mark propose?", answer: "", manual: true },
  { stop: 5, prompt: "Who said “I love you” first?", answer: "", retired: true },
  {
    stop: 3,
    prompt: "What was Mark's top song on Spotify in 2020?",
    answer: "UFOF by Big Thief",
    options: ["UFOF by Big Thief", "All My Friends by LCD Soundsystem", "Money Trees by Kendrick Lamar"],
    tag: "🎵 Music round",
  },
  { stop: 5, prompt: "What date did they get engaged?", answer: "", manual: true },
  { stop: 2, prompt: "What was the name of the street of the first place they lived in London?", answer: "" },
];

export const stopOf = (n: number) => DEFAULT_QUESTIONS[n].stop;

/** What a player's phone gets for each question: never the answer. `points` is null until it can be marked. */
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
