import confetti from "canvas-confetti";

const shapes = new Map<string, confetti.Shape>();
const shape = (text: string) => {
  if (!shapes.has(text)) shapes.set(text, confetti.shapeFromText({ text, scalar: 3 }));
  return shapes.get(text)!;
};

// Mark's Rainbow Rhythms head, as a confetti shape. Loaded once in the browser; eruptions before it's ready go without.
let head: confetti.Shape | undefined;
if (typeof window !== "undefined") {
  const img = new Image();
  img.src = "/mark-head.png";
  img
    .decode()
    .then(() => createImageBitmap(img, { resizeWidth: 96, resizeHeight: 96, resizeQuality: "high" }))
    .then((bitmap) => {
      // The same framing canvas-confetti gives text shapes at scalar 3.
      const s = 1 / 3;
      head = { type: "bitmap", bitmap, matrix: [s, 0, 0, s, -48 * s, -48 * s] } as unknown as confetti.Shape;
    })
    .catch(() => {});
}

const fire = (from: confetti.Shape[], x: number, particleCount: number) =>
  confetti({
    shapes: from,
    scalar: 3,
    particleCount,
    angle: 90 + (0.5 - x) * 30,
    spread: 55,
    startVelocity: 65,
    gravity: 1.1,
    ticks: 220,
    flat: true,
    origin: { x, y: 1.05 },
    disableForReducedMotion: true,
  });

/** Sharks erupt from the bottom of the screen in a few waves, with the odd extra emoji and Mark's head mixed in. */
export function eruptSharks(extras: string[] = [], waves = 4) {
  const shark = shape("🦈");
  const others = extras.map(shape);
  for (let w = 0; w < waves; w++)
    setTimeout(() => {
      for (const x of [0.2, 0.5, 0.8]) fire([shark, shark, shark, ...others, ...(head ? [head] : [])], x, 14);
    }, w * 280);
  // Then a burst of nothing but heads.
  setTimeout(() => head && fire([head], 0.5, 12), waves * 280 + 150);
}
