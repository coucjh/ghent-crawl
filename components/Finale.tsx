"use client";

import confetti from "canvas-confetti";
import { motion } from "motion/react";
import { useEffect } from "react";

const RAIN = ["🍑", "👅", "🍟", "🍺", "🍑", "🍟", "👅", "🍑", "🍺", "🍟", "🍑", "👅"];

export function Finale({ onRestart }: { onRestart: () => void }) {
  useEffect(() => {
    const end = Date.now() + 3000;
    const colors = ["#ff2e88", "#ffe14d", "#00e0ff", "#b6ff3b"];
    const frame = () => {
      confetti({ particleCount: 6, angle: 60, spread: 70, origin: { x: 0 }, colors, disableForReducedMotion: true });
      confetti({ particleCount: 6, angle: 120, spread: 70, origin: { x: 1 }, colors, disableForReducedMotion: true });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center gap-8 overflow-hidden px-4 text-center">
      {RAIN.map((e, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="pointer-events-none absolute top-0 text-4xl"
          style={{ left: `${(i / RAIN.length) * 100 + 3}%` }}
          initial={{ y: "-10vh", rotate: 0 }}
          animate={{ y: "110vh", rotate: 360 }}
          transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: (i * 0.37) % 2.5, ease: "linear" }}
        >
          {e}
        </motion.span>
      ))}
      <motion.h1
        className="font-display text-[clamp(3rem,15vw,7rem)] leading-none"
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 10 }}
      >
        Arsehole licked <span className="inline-block">🍑</span>
      </motion.h1>
      <motion.p
        className="font-display text-3xl text-zest"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        enjoy your chips 🍟
      </motion.p>
      <motion.button
        className="btn btn-ghost relative"
        onClick={onRestart}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        Start again
      </motion.button>
    </main>
  );
}
