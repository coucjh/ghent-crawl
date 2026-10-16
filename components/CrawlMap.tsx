"use client";

import "leaflet/dist/leaflet.css";
import type * as Leaflet from "leaflet";
import { useEffect, useRef, useState } from "react";
import { STOPS } from "@/lib/stops";

type MapState = { L: typeof Leaflet; map: Leaflet.Map; pins: Leaflet.Marker[]; walker: Leaflet.Marker; drawn: number };

const pinIcon = (L: typeof Leaflet, n: number, current: number) =>
  L.divIcon({
    className: "",
    iconSize: [36, 36],
    html: `<div class="pin ${n === current ? "pin-active" : n < current ? "pin-done" : ""}">${n + 1}</div>`,
  });

/** Real map of the route. On each new stop: zoom out over both pins, draw the leg, walk the beer along it, zoom in. */
export function CrawlMap({ index }: { index: number }) {
  const el = useRef<HTMLDivElement>(null);
  const state = useRef<MapState>(null);
  const [initial] = useState(index);

  useEffect(() => {
    let cancelled = false;
    import("leaflet").then((L) => {
      if (cancelled || !el.current) return;
      const at = initial;
      const map = L.map(el.current, { zoomControl: false, attributionControl: true }).setView(STOPS[at].at, 17);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      }).addTo(map);
      const pins = STOPS.map((s, n) => L.marker(s.at, { icon: pinIcon(L, n, at) }).addTo(map));
      for (let n = 1; n <= at; n++) leg(L, map, n, false);
      const walker = L.marker(STOPS[at].at, {
        icon: L.divIcon({ className: "", html: `<div class="walker">🍺</div>`, iconSize: [30, 30], iconAnchor: [15, 40] }),
        zIndexOffset: 1000,
      }).addTo(map);
      state.current = { L, map, pins, walker, drawn: at };
    });
    return () => {
      cancelled = true;
      state.current?.map.remove();
      state.current = null;
    };
  }, [initial]);

  useEffect(() => {
    const s = state.current;
    if (!s || s.drawn === index) return;
    const { L, map, pins, walker } = s;
    const from = s.drawn;
    s.drawn = index;
    pins.forEach((p, n) => p.setIcon(pinIcon(L, n, index)));

    // Going back: no show, just move.
    if (index < from) {
      walker.setLatLng(STOPS[index].at);
      map.flyTo(STOPS[index].at, 17, { duration: 1 });
      return;
    }

    let raf = 0;
    let stopped = false;
    const a = STOPS[from].at;
    const b = STOPS[index].at;
    map.flyToBounds([a, b], { padding: [80, 80], maxZoom: 17, duration: 1 });
    map.once("moveend", () => {
      if (stopped) return;
      leg(L, map, index, true);
      const start = performance.now();
      const walk = (t: number) => {
        const k = Math.min(1, (t - start) / 1400);
        const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
        walker.setLatLng([a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e]);
        if (k < 1) raf = requestAnimationFrame(walk);
        else map.flyTo(b, 18, { duration: 1.2 });
      };
      raf = requestAnimationFrame(walk);
    });
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
    };
  }, [index]);

  return <div ref={el} className="h-full w-full" />;
}

function leg(L: typeof Leaflet, map: Leaflet.Map, n: number, animate: boolean) {
  const line = L.polyline([STOPS[n - 1].at, STOPS[n].at], {
    color: "#ff2e88",
    weight: 7,
    lineCap: "round",
    className: `route ${animate ? "route-draw" : ""}`,
  }).addTo(map);
  line.getElement()?.setAttribute("pathLength", "1");
}
