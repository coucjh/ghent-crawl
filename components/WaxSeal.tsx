// The signature element: every Station is a wax seal. Pure SVG, usable from server and client components.

export type SealState = "sealed" | "open" | "broken";

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
export const roman = (n: number) => ROMAN[n] ?? String(n);

// An irregular, poured-wax outline.
const EDGE = (() => {
  const pts: string[] = [];
  for (let deg = 0; deg < 360; deg += 4) {
    const t = (deg * Math.PI) / 180;
    const r = 46 * (1 + 0.035 * Math.sin(11 * t) + 0.025 * Math.sin(5 * t + 1.3) + 0.015 * Math.sin(17 * t + 0.4));
    pts.push(`${(50 + r * Math.cos(t)).toFixed(2)},${(50 + r * Math.sin(t)).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
})();

/** Gradients shared by every seal on the page. Render once, in the root layout. */
export function SealDefs() {
  return (
    <svg width="0" height="0" aria-hidden className="absolute">
      <defs>
        <radialGradient id="wax" cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#9a2a36" />
          <stop offset="55%" stopColor="#6b1420" />
          <stop offset="100%" stopColor="#3a0810" />
        </radialGradient>
        <radialGradient id="wax-spent" cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#8a5a4f" />
          <stop offset="100%" stopColor="#4a2a26" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function WaxSeal({ numeral, state = "sealed", className = "" }: { numeral: number; state?: SealState; className?: string }) {
  const spent = state === "broken";
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label={`Station ${roman(numeral)}, ${state}`}>
      {state === "open" && <circle cx="50" cy="50" r="49" fill="none" stroke="var(--color-gilt-bright)" strokeWidth="2.5" className="animate-pulse" />}
      <path d={EDGE} fill={spent ? "url(#wax-spent)" : "url(#wax)"} />
      <circle cx="50" cy="50" r="31" fill="none" stroke="#000" strokeOpacity=".28" strokeWidth="3" />
      <circle cx="50" cy="50" r="31" fill="none" stroke="#fff" strokeOpacity=".12" strokeWidth="1" transform="translate(-.8 -.8)" />
      <text
        x="50"
        y="51"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-garamond), serif"
        fontSize={roman(numeral).length > 2 ? 24 : 30}
        fontWeight="600"
        fill="#000"
        fillOpacity=".35"
      >
        {roman(numeral)}
      </text>
      <text
        x="49.2"
        y="50.2"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-garamond), serif"
        fontSize={roman(numeral).length > 2 ? 24 : 30}
        fontWeight="600"
        fill={spent ? "#c9a99a" : "var(--color-gilt-bright)"}
        fillOpacity=".9"
      >
        {roman(numeral)}
      </text>
      {spent && (
        <path d="M50 3 L46 22 L55 37 L45 55 L53 70 L48 97" fill="none" stroke="#2a1210" strokeOpacity=".8" strokeWidth="1.6" strokeLinejoin="bevel" />
      )}
    </svg>
  );
}
