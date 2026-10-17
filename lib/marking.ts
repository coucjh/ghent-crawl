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

/** `answer` may list several accepted alternatives separated by "/". */
export function isCorrect(answer: string, guess: string): boolean {
  const given = normalise(guess);
  if (!given) return false;
  return answer
    .split("/")
    .map(normalise)
    .filter(Boolean)
    .some((accepted) => levenshtein(given, accepted) <= tolerance(accepted));
}

/**
 * A list question: the answer's items are separated by ",", and each one named scores a point. Guesses are split on
 * commas and new lines; a guess that matches nothing whole is tried word by word ("Frederick Grosvenor" without a
 * comma). Only the first as many guesses as there are items count, so listing every name you can think of doesn't pay.
 */
export function scoreList(answer: string, guess: string): number {
  const items = answer.split(",").filter((a) => normalise(a));
  const left = [...items];
  const take = (g: string) => {
    const i = left.findIndex((item) => isCorrect(item, g));
    if (i >= 0) left.splice(i, 1);
    return i >= 0;
  };
  for (const g of guess.split(/[,\n]/).filter((g) => normalise(g)).slice(0, items.length))
    if (!take(g)) for (const word of normalise(g).split(" ")) take(word);
  return items.length - left.length;
}
