"use client";

import { useId } from "react";

// Pint glass, 40×56: rim at y=4, base at y=52. The beer (with its head riding on top) slides down as it drains.
const GLASS = "M4 4 H36 L32 52 H8 Z";
const DRAIN_DEPTH = 44;

/** A pint that is `full` (0–1) full. */
export function BeerGlass({ full, className = "" }: { full: number; className?: string }) {
  const clip = useId();
  const level = Math.min(1, Math.max(0, full));
  return (
    <svg viewBox="0 0 40 56" className={className} aria-hidden>
      <defs>
        <clipPath id={clip}>
          <path d={GLASS} />
        </clipPath>
        <linearGradient id={`${clip}-beer`} x1="0" x2="1">
          <stop offset="0" stopColor="#b8761a" />
          <stop offset="0.45" stopColor="#e3a834" />
          <stop offset="1" stopColor="#a8661a" />
        </linearGradient>
      </defs>

      <path d={GLASS} fill="#f1e6c8" fillOpacity=".12" />
      <g clipPath={`url(#${clip})`}>
        {/* Server and phone read the clock a moment apart; the next tick corrects it. */}
        <g
          suppressHydrationWarning
          style={{ transform: `translateY(${(1 - level) * DRAIN_DEPTH}px)`, transition: "transform 300ms linear" }}
        >
          <rect x="0" y="9" width="40" height="50" fill={`url(#${clip}-beer)`} />
          {/* The head: a band of foam with a bubbly top edge. */}
          <rect x="0" y="6" width="40" height="5" fill="#fff8e7" />
          {[6, 12, 18, 24, 30, 36].map((cx) => (
            <circle key={cx} cx={cx} cy="6.5" r="3" fill="#fff8e7" />
          ))}
        </g>
        {level > 0 &&
          [
            [12, 0],
            [20, 0.7],
            [27, 1.4],
          ].map(([cx, delay]) => (
            <circle key={cx} cx={cx} cy="50" r="1.1" fill="#fff8e7" fillOpacity=".7" className="beer-bubble" style={{ animationDelay: `${delay}s` }} />
          ))}
      </g>
      <path d={GLASS} fill="none" stroke="#f1e6c8" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 9 L11.5 47" stroke="#fff" strokeOpacity=".35" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
