"use client";

import { useEffect, useState } from "react";
import { LAST_ORDERS_SECONDS } from "@/lib/config";
import { BeerGlass } from "./BeerGlass";

const msLeft = (closesAt: string) => Math.max(0, new Date(closesAt).getTime() - Date.now());

/** The "Last Orders" banner: a pint drains while the clock ticks down to the moment the Station closes itself. */
export function LastOrders({ closesAt }: { closesAt: string }) {
  const [ms, setMs] = useState(() => msLeft(closesAt));
  useEffect(() => {
    const id = setInterval(() => setMs(msLeft(closesAt)), 250);
    return () => clearInterval(id);
  }, [closesAt]);

  const left = Math.ceil(ms / 1000);
  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, "0");
  return (
    <div role="timer" className="sticky top-[env(safe-area-inset-top)] z-10 -mx-4 mb-4 flex items-center gap-3 bg-oxblood px-5 py-2 text-vellum-light shadow-md">
      <BeerGlass full={ms / (LAST_ORDERS_SECONDS * 1000)} className="h-12 w-9 shrink-0" />
      <span className="flex-1 font-display text-2xl">Last Orders!</span>
      <span className="text-2xl tabular-nums" suppressHydrationWarning>
        {mm}:{ss}
      </span>
    </div>
  );
}
