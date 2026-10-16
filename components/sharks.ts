import confetti from "canvas-confetti";

const shapes = new Map<string, confetti.Shape>();
const shape = (text: string) => {
  if (!shapes.has(text)) shapes.set(text, confetti.shapeFromText({ text, scalar: 3 }));
  return shapes.get(text)!;
};

/** Sharks erupt from the bottom of the screen, a few waves of them, with the odd extra emoji mixed in. */
export function eruptSharks(extras: string[] = [], waves = 4) {
  const shark = shape("🦈");
  const others = extras.map(shape);
  for (let w = 0; w < waves; w++)
    setTimeout(() => {
      for (const x of [0.2, 0.5, 0.8])
        confetti({
          shapes: [shark, shark, shark, ...others],
          scalar: 3,
          particleCount: 14,
          angle: 90 + (0.5 - x) * 30,
          spread: 55,
          startVelocity: 65,
          gravity: 1.1,
          ticks: 220,
          flat: true,
          origin: { x, y: 1.05 },
          disableForReducedMotion: true,
        });
    }, w * 280);
}
