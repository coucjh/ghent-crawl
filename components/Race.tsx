"use client";

import { motion, useReducedMotion } from "motion/react";
import type { Standing, Track } from "@/lib/game";

const RUN_SECONDS = 1.6;
const LANE_STAGGER = 0.2;

/**
 * The Book as a race. Each Order has its own lane; the track is split into one segment per round (each Station, and
 * the Pilgrimage), as long as the points it offers. On arrival every token runs from where it stood before the last
 * round to where it stands now, so the Book replays the most recent round.
 */
export function Race({
  standings,
  track,
  highlight,
  startDelay = 0,
}: {
  standings: Standing[];
  track: Track;
  highlight?: string;
  startDelay?: number;
}) {
  const reduce = useReducedMotion();
  const lanes = [...standings].sort((a, b) => a.lane - b.lane);
  const pct = (score: number) => `${(score / track.total) * 100}%`;

  return (
    <figure className="mb-6">
      <figcaption className="smallcaps mb-1 text-center text-sm text-ink-soft">
        {track.last ? `The run of ${track.last}` : "At the starting line"}
      </figcaption>

      <div className="relative mx-5">
        {/* Station gates: a faint rule where each Station's points end, the finish in oxblood. */}
        <div className="relative h-5" aria-hidden>
          {track.gates.map((g) => (
            <span key={g.id} className="smallcaps absolute -translate-x-1/2 text-xs text-ink-soft" style={{ left: pct(g.at) }}>
              {g.label}
            </span>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-5 bottom-0" aria-hidden>
          <span className="absolute inset-y-0 left-0 border-l border-gilt" />
          {track.gates.map((g, i) => (
            <span
              key={g.id}
              className={`absolute inset-y-0 ${i === track.gates.length - 1 ? "border-l-2 border-oxblood" : "border-l border-dashed border-gilt/70"}`}
              style={{ left: pct(g.at) }}
            />
          ))}
        </div>

        <ol>
          {lanes.map((s, i) => {
            const delta = s.score - s.previousScore;
            const delay = reduce ? 0 : startDelay + 0.4 + i * LANE_STAGGER;
            const duration = reduce ? 0 : RUN_SECONDS;
            return (
              <li
                key={s.teamId}
                className={`relative h-14 border-b border-vellum-deep ${s.teamId === highlight ? "bg-gilt/15" : ""}`}
                aria-label={`${s.name}: ${s.score} of ${track.total}`}
              >
                <span className="absolute top-0.5 right-1 max-w-[55%] truncate bg-vellum-light px-1 text-xs text-ink-soft">{s.name}</span>
                <motion.span
                  className="absolute top-[58%] text-3xl leading-none"
                  style={{ x: "-50%", y: "-50%" }}
                  initial={{ left: pct(s.previousScore) }}
                  animate={{ left: pct(s.score), rotate: delta > 0 && !reduce ? [0, -12, 10, -12, 10, 0] : 0 }}
                  transition={{ delay, duration, ease: [0.3, 0, 0.2, 1] }}
                >
                  {s.emoji}
                  {delta > 0 && (
                    <motion.span
                      className="absolute -top-2 left-full ml-0.5 text-sm font-semibold text-verdigris"
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
      </div>
    </figure>
  );
}
