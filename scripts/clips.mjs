// Cuts the music-round clips: `npm run clips`.
//
// Reads media-src/clips.json — [{ "id": "m1", "source": "song.mp3", "start": "0:45", "seconds": 10 }] — and writes
// public/media/<id>.mp3 for each. Every clip has its embedded title/artist/artwork stripped so a phone can't show the
// answer. Full songs stay in media-src/ (git-ignored); only the short clips are committed.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";

const SRC = "media-src";
const OUT = "public/media";
const DEFAULT_SECONDS = 10;

const toSeconds = (t) => {
  if (typeof t === "number") return t;
  const [m, s] = String(t).split(":").map(Number);
  return s === undefined ? m : m * 60 + s;
};

const clips = JSON.parse(readFileSync(path.join(SRC, "clips.json"), "utf8"));
mkdirSync(OUT, { recursive: true });

let failed = false;
for (const { id, source, start = 0, seconds = DEFAULT_SECONDS } of clips) {
  const input = path.join(SRC, source);
  if (!/^m\d+$/.test(id)) {
    console.error(`✗ ${id}: ids must look like m1, m2… (neutral, so the filename can't give the song away)`);
    failed = true;
    continue;
  }
  if (!existsSync(input)) {
    console.error(`✗ ${id}: ${input} not found`);
    failed = true;
    continue;
  }
  const out = path.join(OUT, `${id}.mp3`);
  const fadeOut = Math.max(0, seconds - 0.6);
  execFileSync("ffmpeg", [
    ...["-y", "-hide_banner", "-loglevel", "error"],
    ...["-ss", String(toSeconds(start)), "-t", String(seconds), "-i", input],
    ...["-map", "0:a:0", "-map_metadata", "-1", "-vn"], // audio only: no tags, no cover art
    ...["-af", `afade=t=in:d=0.3,afade=t=out:st=${fadeOut}:d=0.6`],
    ...["-ac", "2", "-b:a", "128k", "-id3v2_version", "0", "-fflags", "+bitexact", "-flags:a", "+bitexact"],
    out,
  ]);
  console.log(`✓ ${out}  (${source} from ${start}, ${seconds}s)`);
}
process.exit(failed ? 1 : 0);
