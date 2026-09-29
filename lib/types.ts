// Shared, client-safe types. Nothing here may contain correct answers.

type QuestionBase = {
  id: string;
  prompt: string;
  /** Points per answer box (music questions have two). Default 1. */
  points?: number;
  /** Picture round: an image under /public, e.g. "/media/p1.jpg". */
  image?: string;
};

export type TextQuestion = QuestionBase & {
  type: "text";
  /** Accepted answers; matching ignores case, accents, punctuation, leading articles and small typos. */
  answers: string[];
};

export type ChoiceQuestion = QuestionBase & {
  type: "choice";
  options: string[];
  /** Must be one of `options`. */
  answer: string;
};

/** A clip to name: two answer boxes, Artist and Song, each fuzzy-matched like a text answer. */
export type MusicQuestion = QuestionBase & {
  type: "music";
  /** A clip under /public, e.g. "/media/m1.mp3" (made by `npm run clips`). */
  clip: string;
  artist: string[];
  song: string[];
};

export type Question = TextQuestion | ChoiceQuestion | MusicQuestion;

export type Station = {
  id: number;
  name: string;
  pub: string;
  /** The passcode the barkeep holds. Matched case- and whitespace-insensitively. */
  word: string;
  questions: Question[];
};

/** One Pilgrimage for the night: answered between (and during) pubs, with no Word. */
export type Pilgrimage = {
  name: string;
  /** Opens automatically when this Station opens. */
  opensWith: number;
  /** Closes — and is marked, its points landing all at once — when this Station opens. */
  closesWith: number;
  questions: Question[];
};

/** One answer box. Text and choice questions have one (its id is the question's); music questions have two. */
export type PublicPart = { id: string; label?: string; kind: "text" | "choice"; options?: string[]; points: number };

/** A question as sent to the browser — correct answers stripped. */
export type PublicQuestion = {
  id: string;
  type: Question["type"];
  prompt: string;
  image?: string;
  clip?: string;
  parts: PublicPart[];
};

export type StationStatus = "sealed" | "open" | "closed";
