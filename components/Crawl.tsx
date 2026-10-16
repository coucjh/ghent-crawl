"use client";

import { AnimatePresence, motion } from "motion/react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { directionsUrl, STOPS } from "@/lib/stops";
import { Finale } from "./Finale";
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

export function Crawl() {
  const [licked, setLicked] = useState(false);
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, String(index));
    } catch {}
  }, [index]);

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
  if (index === DONE) return <Finale onRestart={() => setIndex(0)} />;

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
        </div>
      </div>

      <div className="relative shrink-0 overflow-hidden bg-zest px-4 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-ink">
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
