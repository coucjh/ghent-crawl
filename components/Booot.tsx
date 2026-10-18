"use client";

import { AnimatePresence, motion } from "motion/react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { boootDirectionsUrl, PICKUP } from "@/lib/booot";
import { eruptSharks } from "./sharks";

// Leaflet touches `window` on import.
const BoatMap = dynamic(() => import("./BoatMap").then((m) => m.BoatMap), { ssr: false });

export function Booot() {
  const [sailing, setSailing] = useState(false);
  const [arrived, setArrived] = useState(false);

  if (!sailing)
    return (
      <main className="relative flex h-dvh flex-col items-center justify-end overflow-hidden bg-ink pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <motion.img
          src="/booot-intro.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ scale: 1.35, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 4, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
        <motion.h1
          className="relative mb-6 px-4 text-center font-display text-[clamp(3rem,15vw,6rem)] leading-none text-zest drop-shadow-[4px_4px_0_var(--color-ink)]"
          initial={{ y: 120, rotate: -10, opacity: 0 }}
          animate={{ y: 0, rotate: 0, opacity: 1 }}
          transition={{ delay: 1.2, type: "spring", stiffness: 200, damping: 12 }}
        >
          All aboard! 🚤
        </motion.h1>
        <motion.button
          className="btn relative px-10 py-5 text-3xl"
          onClick={() => setSailing(true)}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: [1, 1.08, 1] }}
          transition={{ opacity: { delay: 2 }, scale: { delay: 2, repeat: Infinity, duration: 0.9 } }}
        >
          Set sail ⛵
        </motion.button>
      </main>
    );

  return (
    <motion.main
      className="flex h-dvh flex-col overflow-hidden"
      initial={{ clipPath: "circle(0% at 50% 60%)" }}
      animate={{ clipPath: "circle(150% at 50% 60%)" }}
      transition={{ duration: 0.9, ease: "easeInOut" }}
    >
      <div className="relative min-h-0 flex-1 border-b-4 border-ink">
        <BoatMap
          onArrive={() => {
            setArrived(true);
            eruptSharks(["🚤", "⚓"]);
          }}
        />
      </div>
      <div className="relative shrink-0 overflow-hidden bg-zap px-4 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-ink">
        <svg aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-6 w-[200%] animate-[waves_4s_linear_infinite]" viewBox="0 0 200 10" preserveAspectRatio="none">
          <path d="M0 5 Q 5 0 10 5 T 20 5 T 30 5 T 40 5 T 50 5 T 60 5 T 70 5 T 80 5 T 90 5 T 100 5 T 110 5 T 120 5 T 130 5 T 140 5 T 150 5 T 160 5 T 170 5 T 180 5 T 190 5 T 200 5 V 0 H 0 Z" fill="var(--color-night)" />
        </svg>
        <div className="mt-3 flex items-start gap-3">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border-4 border-ink bg-hot text-3xl shadow-[3px_3px_0_var(--color-ink)]">
            🚤
          </span>
          <div>
            <h1 className="font-display text-3xl leading-tight">Boat pickup</h1>
            <p className="text-lg font-semibold">{PICKUP.name}, Coupure</p>
          </div>
        </div>
        <p className="mt-3 text-base">📍 {PICKUP.address}</p>
        <AnimatePresence>
          {arrived && (
            <motion.p className="mt-1 text-base font-semibold" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              ⚓ Pickup&apos;s here. Don&apos;t fall in.
            </motion.p>
          )}
        </AnimatePresence>
        <motion.a
          className="btn mt-5 w-full"
          href={boootDirectionsUrl()}
          target="_blank"
          rel="noreferrer"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
        >
          🧭 Go
        </motion.a>
      </div>
    </motion.main>
  );
}
