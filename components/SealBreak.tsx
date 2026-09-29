"use client";

import { motion } from "motion/react";
import { WaxSeal } from "./WaxSeal";

/** The seal cracks in two and falls away. Calls onDone when finished. */
export function SealBreak({ numeral, onDone }: { numeral: number; onDone: () => void }) {
  const half = (side: "left" | "right") => (
    <motion.div
      className="absolute inset-0"
      style={{ clipPath: side === "left" ? "polygon(0 0, 52% 0, 46% 22%, 55% 37%, 45% 55%, 53% 70%, 48% 100%, 0 100%)" : "polygon(52% 0, 100% 0, 100% 100%, 48% 100%, 53% 70%, 45% 55%, 55% 37%, 46% 22%)" }}
      initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
      animate={{ x: side === "left" ? -70 : 70, y: 90, rotate: side === "left" ? -28 : 24, opacity: 0 }}
      transition={{ delay: 0.35, duration: 0.9, ease: [0.5, 0, 0.75, 0] }}
    >
      <WaxSeal numeral={numeral} className="h-full w-full" />
    </motion.div>
  );

  return (
    <div className="flex flex-col items-center py-10" aria-live="polite">
      <motion.div
        className="relative h-40 w-40"
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 0.35 }}
        onAnimationComplete={() => setTimeout(onDone, 1100)}
      >
        {half("left")}
        {half("right")}
      </motion.div>
      <motion.p
        className="font-display text-3xl text-oxblood"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        The Word is spoken
      </motion.p>
    </div>
  );
}
