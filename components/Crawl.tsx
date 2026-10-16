"use client";

import { AnimatePresence, motion } from "motion/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { stopOf, type QuizView, type Standing } from "@/lib/questions";
import { directionsUrl, STOPS } from "@/lib/stops";
import { Finale } from "./Finale";
import { Leaderboard, NameGate, QuizBlock } from "./Quiz";
import { eruptSharks } from "./sharks";
import { Splash } from "./Splash";

// Leaflet touches `window` on import.
const CrawlMap = dynamic(() => import("./CrawlMap").then((m) => m.CrawlMap), { ssr: false });

const KEY = "crawl-stop";
const DONE = STOPS.length;

function load() {
  try {
    const n = Number(localStorage.getItem(KEY));
    return Number.isInteger(n) && n >= 0 && n <= DONE ? n : 0;
  } catch {
    return 0;
  }
}

export function Crawl({ guest, quizzes, standings }: { guest: string | null; quizzes: QuizView[]; standings: Standing[] }) {
  const router = useRouter();
  const [licked, setLicked] = useState(false);
  const [board, setBoard] = useState(false);
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, String(index));
    } catch {}
  }, [index]);

  // Keeps the leaderboard and "not marked yet" answers fresh.
  useEffect(() => {
    if (!licked || !guest) return;
    const id = setInterval(() => document.visibilityState === "visible" && router.refresh(), 15000);
    return () => clearInterval(id);
  }, [licked, guest, router]);

  const go = (to: number) => {
    setDir(to > index ? 1 : -1);
    if (to > index && to < DONE) {
      setFlash(STOPS[to].food ? "CHIPS 🍟" : "NEXT STOP!");
      setTimeout(() => setFlash(null), 1100);
      setTimeout(() => eruptSharks([STOPS[to].emoji]), 2600);
      navigator.vibrate?.(60);
    }
    setIndex(to);
  };

  if (!licked)
    return (
      <Splash
        onLick={() => {
          setIndex(load());
          setLicked(true);
        }}
      />
    );
  if (!guest) return <NameGate />;
  if (index === DONE) return <Finale standings={standings} onRestart={() => setIndex(0)} />;

  const stop = STOPS[index];
  const last = index === DONE - 1;

  return (
    <motion.main
      className="flex h-dvh flex-col overflow-hidden"
      initial={{ clipPath: "circle(0% at 50% 60%)" }}
      animate={{ clipPath: "circle(150% at 50% 60%)" }}
      transition={{ duration: 0.9, ease: "easeInOut" }}
    >
      <div className="relative min-h-0 flex-1 border-b-4 border-ink">
        <CrawlMap index={index} />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[1000] flex justify-center gap-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
          {STOPS.map((s, n) => (
            <motion.span
              key={n}
              className="grid h-9 w-9 place-items-center rounded-full border-[3px] border-ink text-lg"
              animate={{
                backgroundColor: n < index ? "#b6ff3b" : n === index ? "#ff2e88" : "#ffffff",
                scale: n === index ? 1.25 : 1,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              {n < index ? "✓" : s.emoji}
            </motion.span>
          ))}
          <button
            className="pointer-events-auto ml-1 grid h-9 w-9 place-items-center rounded-full border-[3px] border-ink bg-zest text-lg"
            onClick={() => setBoard(true)}
            aria-label="Leaderboard"
          >
            🏆
          </button>
        </div>
      </div>

      <div className="relative max-h-[65dvh] shrink-0 overflow-x-hidden overflow-y-auto bg-zest px-4 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-ink">
        <AnimatePresence mode="popLayout" custom={dir} initial={false}>
          <motion.section
            key={index}
            custom={dir}
            variants={{
              in: (d: number) => ({ x: `${d * 110}%`, rotate: d * 8, opacity: 0 }),
              still: { x: 0, rotate: 0, opacity: 1 },
              out: (d: number) => ({ x: `${d * -110}%`, rotate: d * -8, opacity: 0 }),
            }}
            initial="in"
            animate="still"
            exit="out"
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
          >
            <div className="flex items-start gap-3">
              <motion.span
                className="grid h-14 w-14 shrink-0 place-items-center rounded-full border-4 border-ink bg-hot font-display text-2xl text-white shadow-[3px_3px_0_var(--color-ink)]"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.25, type: "spring", stiffness: 300, damping: 12 }}
              >
                {index + 1}
              </motion.span>
              <div className="min-w-0">
                <h1 className="font-display text-3xl leading-tight">{stop.name}</h1>
                <p className="text-lg font-semibold">{stop.tagline}</p>
              </div>
            </div>
            {stop.food && (
              <motion.p
                className="mt-3 inline-block rounded-full border-[3px] border-ink bg-hot px-3 py-1 font-display text-white"
                animate={{ rotate: [-4, 4, -4] }}
                transition={{ repeat: Infinity, duration: 0.6 }}
              >
                🍟 FOOD HERE
              </motion.p>
            )}
            <p className="mt-3 text-base">📍 {stop.address}</p>
            <p className="mt-1 text-base font-semibold">💡 {stop.tip}</p>
            {quizzes
              .filter((q) => stopOf(q.n) === index)
              .map((q) => (
                <QuizBlock key={q.n} quiz={q} />
              ))}
          </motion.section>
        </AnimatePresence>

        <div className="mt-5 flex items-center gap-3">
          <button className="btn btn-ghost shrink-0 px-4" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous stop">
            ←
          </button>
          <a className="btn btn-ghost shrink-0 px-4 text-base" href={directionsUrl(stop)} target="_blank" rel="noreferrer">
            🧭 Go
          </a>
          <motion.button
            className="btn flex-1"
            onClick={() => go(index + 1)}
            whileTap={{ scale: 0.92 }}
            animate={{ x: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
          >
            {last ? "Finish 🍑" : "Next pub →"}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {board && (
          <motion.div
            className="fixed inset-0 z-[1500] flex items-end bg-ink/60"
            onClick={() => setBoard(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="max-h-[80dvh] w-full overflow-y-auto rounded-t-3xl border-t-4 border-ink bg-zap px-4 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
              onClick={(e) => e.stopPropagation()}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="mb-4 flex items-center justify-between text-ink">
                <h2 className="font-display text-3xl">Leaderboard 🏆</h2>
                <button className="btn btn-ghost px-4 py-1" onClick={() => setBoard(false)} aria-label="Close">
                  ✕
                </button>
              </div>
              <Leaderboard standings={standings} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {flash && (
          <motion.div
            className="pointer-events-none fixed inset-0 z-[2000] grid place-items-center bg-hot"
            initial={{ clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)" }}
            animate={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
            exit={{ clipPath: "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)" }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <motion.p
              className="font-display text-[clamp(3rem,14vw,6rem)] text-zest"
              initial={{ scale: 0.2, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              {flash}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}
