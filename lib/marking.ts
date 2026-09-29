import type { Question } from "./types";

const ARTICLES = /^(the|a|an|de|het|le|la|les|een) /;

export function normalise(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(ARTICLES, "");
}

function levenshtein(a: string, b: string): number {
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const above = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = above;
    }
  }
  return prev[b.length];
}

/** How many typos we forgive, by length of the accepted answer. Numbers must be exact. */
function tolerance(accepted: string): number {
  if (/\d/.test(accepted)) return 0;
  if (accepted.length >= 8) return 2;
  if (accepted.length >= 5) return 1;
  return 0;
}

export function isCorrect(question: Question, answer: string): boolean {
  if (question.type === "choice") return answer === question.answer;
  const given = normalise(answer);
  if (!given) return false;
  return question.answers.some((a) => {
    const accepted = normalise(a);
    return levenshtein(given, accepted) <= tolerance(accepted);
  });
}

export function wordMatches(word: string, attempt: string): boolean {
  return word.trim().toLowerCase() === attempt.trim().toLowerCase();
}
