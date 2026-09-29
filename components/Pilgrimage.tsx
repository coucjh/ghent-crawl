import Link from "next/link";
import type { StationStatus } from "@/lib/types";
import { WaxSeal, type SealState } from "./WaxSeal";

const sealState: Record<StationStatus, SealState> = { sealed: "sealed", open: "open", closed: "broken" };

/** The row of seals across the top: the route of the night at a glance. */
export function Pilgrimage({ stations, current }: { stations: { id: number; status: StationStatus }[]; current?: number }) {
  return (
    <nav aria-label="Stations" className="flex justify-between gap-1">
      {stations.map((s) => {
        const seal = <WaxSeal numeral={s.id} state={sealState[s.status]} className="h-full w-full" />;
        const cls = `block aspect-square w-[18%] transition-transform ${s.id === current ? "scale-110 drop-shadow-md" : "opacity-85"}`;
        return s.status === "sealed" ? (
          <span key={s.id} className={`${cls} grayscale-[40%]`}>
            {seal}
          </span>
        ) : (
          <Link key={s.id} href={`/station/${s.id}`} className={`${cls} hover:scale-105`} aria-current={s.id === current ? "page" : undefined}>
            {seal}
          </Link>
        );
      })}
    </nav>
  );
}
