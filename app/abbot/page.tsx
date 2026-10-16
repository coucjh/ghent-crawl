import { LoginForm, PointsButtons, QuestionForm, WipeForm } from "@/components/abbot/controls";
import { Leaderboard } from "@/components/Quiz";
import { stopOf } from "@/lib/questions";
import { getLeaderboard, getMarkedGuesses, getQuestions } from "@/lib/quiz";
import { isAbbot } from "@/lib/session";
import { STOPS } from "@/lib/stops";

const CARD = "mb-6 rounded-3xl border-4 border-ink bg-white p-5 text-ink shadow-[6px_6px_0_var(--color-ink)]";

export default async function AdminPage() {
  if (!(await isAbbot()))
    return (
      <main className="mx-auto max-w-md px-4 pt-[max(2rem,env(safe-area-inset-top))] pb-10">
        <h1 className="mb-6 text-center font-display text-5xl text-hot">Admin</h1>
        <LoginForm />
      </main>
    );

  const [questions, guesses, standings] = await Promise.all([getQuestions(), getMarkedGuesses(), getLeaderboard()]);

  return (
    <main className="mx-auto max-w-md px-4 pt-[max(2rem,env(safe-area-inset-top))] pb-10">
      <h1 className="mb-6 text-center font-display text-5xl text-hot">Admin</h1>

      <section className={`${CARD} bg-zap`}>
        <h2 className="mb-3 font-display text-3xl">Leaderboard 🏆</h2>
        <Leaderboard standings={standings} />
      </section>

      <section className={CARD}>
        <h2 className="mb-1 font-display text-3xl">Answers 🧠</h2>
        <p className="mb-4 text-sm">Marked automatically against the correct answer (small typos forgiven). Overrule with the buttons.</p>
        {questions.map((q) => {
          const these = guesses.filter((g) => g.n === q.n);
          return (
            <div key={q.n} className="mb-4">
              <p className="font-bold">
                Q{q.n + 1}. {q.prompt}
              </p>
              {q.options && <p className="text-sm">Options: {q.options.join(" · ")}</p>}
              <p className="text-sm">
                Answer: {q.answer || <em>not set yet</em>}
                {q.manual && <strong className="text-hot"> · mark these by hand</strong>}
              </p>
              <ul className="mt-1 divide-y divide-ink/15">
                {these.map((g) => (
                  <li key={g.guestId} className="flex items-center gap-2 py-1.5">
                    <span className="w-8 font-bold tabular-nums">{g.points ?? "⏳"}</span>
                    <span className="min-w-0 flex-1">
                      <strong>{g.name}</strong>: {g.value}
                      {g.override !== null && <span className="text-xs"> (overruled)</span>}
                    </span>
                    <PointsButtons guestId={g.guestId} n={g.n} multi={q.multi} points={g.points} overridden={g.override !== null} />
                  </li>
                ))}
                {these.length === 0 && <li className="py-1 text-sm italic">No answers yet.</li>}
              </ul>
            </div>
          );
        })}
      </section>

      <section className={CARD}>
        <h2 className="mb-1 font-display text-3xl">Questions ✍️</h2>
        <p className="mb-4 text-sm">In pub order. For multiple choice, copy the right option exactly. Changes show on phones within 15 seconds.</p>
        <div className="space-y-4">
          {questions.toSorted((a, b) => stopOf(a.n) - stopOf(b.n) || a.n - b.n).map((q) => (
            <QuestionForm key={q.n} n={q.n} pub={STOPS[stopOf(q.n)].name} prompt={q.prompt} answer={q.answer} multi={q.multi} />
          ))}
        </div>
      </section>

      <section className={`${CARD} border-dashed`}>
        <h2 className="mb-3 font-display text-2xl">Wipe players</h2>
        <WipeForm />
      </section>
    </main>
  );
}
