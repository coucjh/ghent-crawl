// Client-safe game settings (no answers here — those live in content/quiz.ts).

/** The emblems an Order can choose. Each may be taken by only one Order. */
export const ORDER_EMOJI = ["🍺", "🧇", "🍟", "🍫", "🦈", "🐉", "🦉", "🐗", "🦊", "🐺", "🐸", "🐐", "🦁", "🐙", "👑", "🔔"];

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
export const roman = (n: number) => ROMAN[n] ?? String(n);

/** Points for the one photo the Abbots crown in each photo challenge (unless the question sets its own). */
export const CROWNED_PHOTO_POINTS = 5;

/** Length of the "Last Orders" countdown. */
export const LAST_ORDERS_SECONDS = 120;
