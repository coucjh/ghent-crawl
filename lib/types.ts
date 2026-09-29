// Shared, client-safe types. Nothing here may contain correct answers.

export type TextQuestion = {
  id: string;
  type: "text";
  prompt: string;
  /** Accepted answers; matching ignores case, accents, punctuation, leading articles and small typos. */
  answers: string[];
  points?: number;
};

export type ChoiceQuestion = {
  id: string;
  type: "choice";
  prompt: string;
  options: string[];
  /** Must be one of `options`. */
  answer: string;
  points?: number;
};

export type Question = TextQuestion | ChoiceQuestion;

export type Station = {
  id: number;
  name: string;
  pub: string;
  /** The passcode the barkeep holds. Matched case- and whitespace-insensitively. */
  word: string;
  questions: Question[];
};

/** A question as sent to the browser — correct answers stripped. */
export type PublicQuestion = {
  id: string;
  type: "text" | "choice";
  prompt: string;
  options?: string[];
  points: number;
};

export type StationStatus = "sealed" | "open" | "closed";
