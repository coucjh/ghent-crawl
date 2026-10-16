"use client";

import { motion } from "motion/react";
import { useState } from "react";

const LINES = [["Pssst,", "Marko", "👅🍑"], ["come", "lick", "Lindsay's", "arsehole...."]];

export function Splash({ onLick }: { onLick: () => void }) {
  const [dodges, setDodges] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  // "Don't lick" runs away three times, then gives up and becomes another LICK.
  const dodge = (e: React.PointerEvent) => {
    if (dodges >= 3) return;
    e.preventDefault();
    setDodges((d) => d + 1);
    setOffset({ x: (Math.random() - 0.5) * 220, y: -40 - Math.random() * 180 });
  };
  let i = 0;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-12 overflow-hidden px-4 text-center">
      <h1 className="font-display text-[clamp(2.75rem,13vw,6rem)] leading-[1.05]">
        {LINES.map((line, l) => (
          <span key={l} className="block">
            {line.map((word) => (
              <motion.span
                key={word}
                className={`mx-[0.12em] inline-block ${word === "Marko" ? "text-zest" : word === "Lindsay's" ? "text-zap" : ""}`}
                initial={{ opacity: 0, y: 80, rotate: -20, scale: 0.3 }}
                animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
                transition={{ delay: 0.3 + i++ * 0.22, type: "spring", stiffness: 260, damping: 14 }}
              >
                {word.includes("👅") ? (
                  <motion.span
                    className="inline-block"
                    animate={{ rotate: [0, -12, 12, 0], scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.4, delay: 2 }}
                  >
                    {word}
                  </motion.span>
                ) : (
                  word
                )}
              </motion.span>
            ))}
          </span>
        ))}
      </h1>

      <motion.div
        className="flex flex-wrap items-center justify-center gap-5"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.2, type: "spring" }}
      >
        <motion.button
          className="btn px-10 py-5 text-3xl"
          onClick={onLick}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 0.9 }}
        >
          Lick 👅
        </motion.button>
        <motion.button
          className={`btn ${dodges >= 3 ? "" : "btn-ghost"} text-xl`}
          animate={offset}
          transition={{ type: "spring", stiffness: 500, damping: 18 }}
          onPointerDown={dodge}
          onPointerEnter={(e) => e.pointerType === "mouse" && dodge(e)}
          onClick={() => dodges >= 3 && onLick()}
        >
          {dodges >= 3 ? "Fine. Lick 👅" : ["Don't lick", "Nope 😬", "Nice try", "Still no"][dodges]}
        </motion.button>
      </motion.div>
    </main>
  );
}
