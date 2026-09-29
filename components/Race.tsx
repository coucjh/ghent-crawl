"use client";

import { motion, useReducedMotion } from "motion/react";
import type { RoundProgress, Standing } from "@/lib/game";
import type { StationStatus } from "@/lib/types";

const RUN_SECONDS = 1.6;
const LANE_STAGGER = 0.2;

const STATE: Record<StationStatus, { text: string; mark: string; className: string }> = {
  closed: { text: "complete", mark: "✓", className: "border-verdigris/50 text-verdigris" },
  open: { text: "started", mark: "●", className: "border-oxblood bg-oxblood text-vellum-light" },
  sealed: { text: "not yet", mark: "○", className: "border-ink-soft/30 text-ink-soft/70" },
};

/** Where the night has got to: every round in order, not yet → started → complete. */
function RoundStrip({ rounds }: { rounds: RoundProgress[] }) {
  return (
    <ol className="mb-4 flex flex-wrap justify-center gap-1.5" aria-label="Rounds">
      {rounds.map((r) => {
        const s = STATE[r.status];
        return (
          <li key={r.id} className={`border px-2 py-0.5 text-sm ${s.className}`}>
            <span aria-hidden>{s.mark}</span> {r.name} <span className="smallcaps">· {s.text}</span>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * The Book as a race of scores: each Order runs in its own lane, placed relative to the leader. On arrival every
 * token runs from where it stood before the latest round to where it stands now, with the points it just gained.
 */
export function Race({
  standings,
  rounds,
  highlight,
  startDelay = 0,
}: {
  standings: Standing[];
  rounds: RoundProgress[];
  highlight?: string;
  startDelay?: number;
}) {
  const reduce = useReducedMotion();
  const lanes = [...standings].sort((a, b) => a.lane - b.lane);
  const best = Math.max(1, ...standings.map((s) => s.score));
  const bestBefore = Math.max(1, ...standings.map((s) => s.previousScore));
  // The leader sits at 78% so its score still fits beside the token.
  const at = (score: number, top: number) => `${(score / top) * 78}%`;

  return (
    <figure className="mb-6">
      <RoundStrip rounds={rounds} />
      <ol className="border-l border-gilt">
        {lanes.map((s, i) => {
          const delta = s.score - s.previousScore;
          const delay = reduce ? 0 : startDelay + 0.4 + i * LANE_STAGGER;
          const duration = reduce ? 0 : RUN_SECONDS;
          return (
            <li
              key={s.teamId}
              className={`relative h-14 border-b border-vellum-deep ${s.teamId === highlight ? "bg-gilt/15" : ""}`}
              aria-label={`${s.name}: ${s.score} points`}
            >
              <span className="absolute top-0.5 left-2 max-w-[70%] truncate text-xs text-ink-soft">{s.name}</span>
              <motion.span
                className="absolute top-[60%] flex items-center gap-1.5 whitespace-nowrap pl-1"
                style={{ y: "-50%" }}
                initial={{ left: at(s.previousScore, bestBefore) }}
                animate={{ left: at(s.score, best) }}
                transition={{ delay, duration, ease: [0.3, 0, 0.2, 1] }}
              >
                <motion.span
                  className="text-3xl leading-none"
                  animate={{ rotate: delta > 0 && !reduce ? [0, -12, 10, -12, 10, 0] : 0 }}
                  transition={{ delay, duration }}
                >
                  {s.emoji}
                </motion.span>
                <span className="text-xl font-semibold tabular-nums">{s.score}</span>
                {delta > 0 && (
                  <motion.span
                    className="text-sm font-semibold text-verdigris"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: delay + duration, duration: 0.4 }}
                  >
                    +{delta}
                  </motion.span>
                )}
              </motion.span>
            </li>
          );
        })}
      </ol>
    </figure>
  );
}
