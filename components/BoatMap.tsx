"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import { PICKUP, SAIL } from "@/lib/booot";

/** The boat sails down the Leie to the pickup, leaving a wake, then the map zooms in on the pin. */
export function BoatMap({ onArrive }: { onArrive: () => void }) {
  const el = useRef<HTMLDivElement>(null);
  const arrive = useRef(onArrive);

  useEffect(() => {
    let cancelled = false;
    let raf = 0;
    let remove = () => {};
    import("leaflet").then((L) => {
      if (cancelled || !el.current) return;
      const map = L.map(el.current, { zoomControl: false }).fitBounds(L.latLngBounds(SAIL), { padding: [60, 60] });
      remove = () => map.remove();
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      const pin = L.marker(PICKUP.at, {
        icon: L.divIcon({ className: "", iconSize: [36, 36], html: `<div class="pin">⚓</div>` }),
      }).addTo(map);
      const wake = L.polyline([SAIL[0]], { color: "#00e0ff", weight: 6, dashArray: "2 10", lineCap: "round" }).addTo(map);
      const boat = L.marker(SAIL[0], {
        icon: L.divIcon({ className: "", html: `<div class="boat">🚤</div>`, iconSize: [40, 40], iconAnchor: [20, 30] }),
        zIndexOffset: 1000,
      }).addTo(map);

      // Sail at a constant speed along the whole line.
      const legs = SAIL.slice(1).map((p, i) => map.distance(SAIL[i], p));
      const total = legs.reduce((a, b) => a + b, 0);
      const start = performance.now() + 600;
      const sail = (t: number) => {
        let d = (Math.max(0, Math.min(1, (t - start) / 5000)) ** 0.9) * total;
        let i = 0;
        while (i < legs.length - 1 && d > legs[i]) d -= legs[i++];
        const k = Math.min(1, d / legs[i]);
        const [a, b] = [SAIL[i], SAIL[i + 1]];
        const here: [number, number] = [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
        boat.setLatLng(here);
        wake.setLatLngs([...SAIL.slice(0, i + 1), here]);
        if (t - start < 5000) raf = requestAnimationFrame(sail);
        else {
          pin.setIcon(L.divIcon({ className: "", iconSize: [36, 36], html: `<div class="pin pin-active">⚓</div>` }));
          map.flyTo(PICKUP.at, 17, { duration: 1.4 });
          arrive.current();
        }
      };
      raf = requestAnimationFrame(sail);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      remove();
    };
  }, []);

  return <div ref={el} className="h-full w-full" />;
}
