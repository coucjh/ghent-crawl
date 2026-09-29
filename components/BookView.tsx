"use client";

import confetti from "canvas-confetti";
import { motion, useReducedMotion } from "motion/react";
import { useEffect } from "react";
import type { Book, Standing } from "@/lib/game";
import { roman, WaxSeal } from "./WaxSeal";

const REVEAL_STEP = 1.4; // seconds between each Order being read out

function Row({ s, rank, highlight }: { s: Standing; rank: number; highlight?: string }) {
  return (
    <div className={`flex items-center gap-4 border-b border-vellum-deep py-3 ${s.teamId === highlight ? "bg-gilt/15" : ""}`}>
      <span className={`w-12 text-center text-2xl font-semibold ${rank === 1 ? "text-gilt" : "text-oxblood"}`}>{roman(rank)}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xl leading-tight">{s.name}</p>
        <p className="truncate text-sm text-ink-soft">{s.members.join(" · ")}</p>
      </div>
      <span className="text-3xl tabular-nums">{s.score}</span>
    </div>
  );
}

/** Between Stations: scores slide into their new order as they change. */
function Standings({ standings, highlight }: { standings: Standing[]; highlight?: string }) {
  return (
    <div>
      {standings.map((s, i) => (
        <motion.div key={s.teamId} layout transition={{ type: "spring", stiffness: 260, damping: 30 }}>
          <Row s={s} rank={i + 1} highlight={highlight} />
        </motion.div>
      ))}
    </div>
  );
}

/** The final judgement: read out from last place to first, then gold for the winner. */
function Reveal({ standings, highlight }: { standings: Standing[]; highlight?: string }) {
  const reduce = useReducedMotion();
  const n = standings.length;

  useEffect(() => {
    if (n === 0) return;
    const id = setTimeout(
      () => {
        const colors = ["#d4af5a", "#b08a3e", "#6b1420", "#f1e6c8"];
        confetti({ particleCount: 140, spread: 80, origin: { y: 0.35 }, colors, disableForReducedMotion: true });
        setTimeout(() => confetti({ particleCount: 80, spread: 120, origin: { y: 0.3 }, colors, disableForReducedMotion: true }), 400);
      },
      reduce ? 0 : ((n - 1) * REVEAL_STEP + 0.8) * 1000,
    );
    return () => clearTimeout(id);
  }, [n, reduce]);

  return (
    <div>
      {standings.map((s, i) => (
        <motion.div
          key={s.teamId}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: (n - 1 - i) * REVEAL_STEP, duration: 0.6 }}
        >
          <Row s={s} rank={i + 1} highlight={highlight} />
        </motion.div>
      ))}
      {n > 0 && (
        <motion.p
          className="mt-6 text-center font-display text-3xl text-oxblood"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: (n - 1) * REVEAL_STEP + 0.8 }}
        >
          Glory to {standings[0].name}
        </motion.p>
      )}
    </div>
  );
}

export function BookView({ book, highlight }: { book: Book; highlight?: string }) {
  if (book.state === "sealed")
    return (
      <div className="flex flex-col items-center py-6 text-center">
        <WaxSeal numeral={5} className="mb-5 h-32 w-32 drop-shadow-lg" />
        <p className="text-lg italic">The Book is sealed until the final judgement. The Abbots will reveal all.</p>
      </div>
    );
  if (book.standings.length === 0) return <p className="text-center italic">No Orders have been founded yet.</p>;
  return book.state === "revealed" ? (
    <Reveal standings={book.standings} highlight={highlight} />
  ) : (
    <Standings standings={book.standings} highlight={highlight} />
  );
}
