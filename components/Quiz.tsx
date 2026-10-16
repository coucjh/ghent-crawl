"use client";

import { AnimatePresence, motion } from "motion/react";
import { useActionState } from "react";
import { guessAction, joinAction } from "@/app/actions";
import type { QuizView, Standing } from "@/lib/questions";

export function NameGate() {
  const [state, action, pending] = useActionState(joinAction, {});
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4">
      <motion.form
        action={action}
        className="w-full max-w-sm space-y-5 rounded-3xl border-4 border-ink bg-zest p-6 text-ink shadow-[8px_8px_0_var(--color-ink)]"
        initial={{ scale: 0.5, rotate: -8, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 14 }}
      >
        <h1 className="font-display text-5xl leading-tight">It&apos;s clean!! ✨</h1>
        <p className="text-lg font-semibold">Now, who are you? Two questions at every pub. Most points wins.</p>
        <input name="name" required maxLength={24} placeholder="Your first name" autoComplete="given-name" className="field" />
        {state.error && <p className="font-bold text-hot">{state.error}</p>}
        <button className="btn w-full" disabled={pending}>
          Let&apos;s go 🍻
        </button>
      </motion.form>
    </main>
  );
}

function verdict(points: number | null | undefined, multi: boolean) {
  if (points == null) return { text: "⏳ Not marked yet", className: "bg-white" };
  if (points === 0) return { text: "❌ Nope", className: "bg-white" };
  return { text: multi ? `✅ +${points}` : "✅ Correct! +1", className: "bg-lime" };
}

export function QuizBlock({ quiz }: { quiz: QuizView }) {
  const [state, action, pending] = useActionState(guessAction.bind(null, quiz.n), {});
  const v = verdict(quiz.points, quiz.multi);
  return (
    <div className="mt-3 rounded-2xl border-[3px] border-ink bg-white p-3">
      <p className="font-display text-lg leading-snug">{quiz.prompt}</p>
      {quiz.multi && <p className="text-sm font-semibold text-hot">A point for each one. Separate them with commas.</p>}
      {quiz.guess ? (
        <motion.div
          className={`mt-2 flex flex-wrap items-center justify-between gap-2 rounded-xl border-[3px] border-ink px-3 py-2 ${v.className}`}
          initial={{ scale: 0.6, rotate: -4 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 12 }}
        >
          <span className="font-semibold">“{quiz.guess}”</span>
          <span className="font-display">{v.text}</span>
        </motion.div>
      ) : (
        <form action={action} className="mt-2 flex gap-2">
          <input name="guess" required maxLength={300} placeholder="Your answer" autoComplete="off" className="field mt-0 min-w-0 flex-1 py-2 text-lg" />
          <button className="btn shrink-0 px-4 py-2 text-base" disabled={pending}>
            Lock in
          </button>
        </form>
      )}
      {state.error && <p className="mt-1 font-bold text-hot">{state.error}</p>}
    </div>
  );
}

export function Leaderboard({ standings, className = "" }: { standings: Standing[]; className?: string }) {
  return (
    <ol className={`space-y-2 ${className}`}>
      <AnimatePresence initial={false}>
        {standings.map((s, i) => (
          <motion.li
            key={s.id}
            layout
            className={`flex items-center gap-3 rounded-2xl border-[3px] border-ink px-3 py-2 text-ink ${s.me ? "bg-hot text-white" : "bg-white"}`}
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 20 }}
          >
            <span className="w-8 font-display text-xl">{["🥇", "🥈", "🥉"][i] ?? i + 1}</span>
            <span className="flex-1 truncate text-lg font-bold">{s.name}</span>
            <span className="font-display text-2xl tabular-nums">{s.score}</span>
          </motion.li>
        ))}
      </AnimatePresence>
      {standings.length === 0 && <p className="text-center font-semibold">Nobody yet.</p>}
    </ol>
  );
}
