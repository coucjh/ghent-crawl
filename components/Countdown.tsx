"use client";

import { useEffect, useState } from "react";

function remaining(closesAt: string) {
  return Math.max(0, Math.ceil((new Date(closesAt).getTime() - Date.now()) / 1000));
}

/** The "Last Orders" banner, ticking down to the moment the Station closes itself. */
export function LastOrders({ closesAt }: { closesAt: string }) {
  const [left, setLeft] = useState(() => remaining(closesAt));
  useEffect(() => {
    const id = setInterval(() => setLeft(remaining(closesAt)), 250);
    return () => clearInterval(id);
  }, [closesAt]);

  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, "0");
  return (
    <div role="timer" className="sticky top-[env(safe-area-inset-top)] z-10 -mx-4 mb-4 flex items-baseline justify-between bg-oxblood px-5 py-2 text-vellum-light shadow-md">
      <span className="font-display text-2xl">Last Orders!</span>
      <span className="text-2xl tabular-nums">
        {mm}:{ss}
      </span>
    </div>
  );
}
