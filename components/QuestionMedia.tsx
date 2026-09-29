"use client";

import Image from "next/image";
import { useRef, useState, useSyncExternalStore } from "react";

/** A picture-round image: fills the column, tap to see it full screen. */
export function Picture({ src }: { src: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button type="button" onClick={() => dialog.current?.showModal()} className="mt-3 block w-full border border-gilt p-1">
        <Image src={src} alt="The picture for this question" width={1200} height={900} sizes="(max-width: 448px) 100vw, 448px" className="h-auto w-full" />
        <span className="smallcaps mt-1 block text-center text-xs text-ink-soft">Tap to enlarge</span>
      </button>
      <dialog
        ref={dialog}
        onClick={() => dialog.current?.close()}
        className="m-auto max-h-none max-w-none bg-transparent p-2 backdrop:bg-ink/90"
      >
        <Image src={src} alt="The picture for this question, enlarged" width={1600} height={1200} sizes="100vw" className="h-auto max-h-[90dvh] w-auto max-w-[96vw]" />
        <p className="smallcaps mt-2 text-center text-sm text-vellum-light">Tap to close</p>
      </dialog>
    </>
  );
}

// "One play per phone" lives in this phone's localStorage. Not tamper-proof, by design.
const playedKey = (src: string) => `abbey-played:${src}`;
const PLAYED_EVENT = "abbey-played";

function hasPlayed(src: string) {
  try {
    return localStorage.getItem(playedKey(src)) === "1";
  } catch {
    return false;
  }
}

function markPlayed(src: string) {
  try {
    localStorage.setItem(playedKey(src), "1");
  } catch {
    // Private mode: the limit simply won't stick.
  }
  window.dispatchEvent(new Event(PLAYED_EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(PLAYED_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(PLAYED_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** A music clip that may be heard once on this phone. Pausing and resuming within that one play is fine. */
export function ClipPlayer({ src }: { src: string }) {
  const audio = useRef<HTMLAudioElement>(null);
  const used = useSyncExternalStore(subscribe, () => hasPlayed(src), () => false);
  const [started, setStarted] = useState(false); // started on this visit, so it may be resumed
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ended, setEnded] = useState(false);

  async function toggle() {
    const el = audio.current!;
    if (playing) return el.pause();
    await el.play();
    if (!started) {
      setStarted(true);
      markPlayed(src);
    }
  }

  const spent = ended || (used && !started);
  return (
    <div className="mt-3 flex items-center gap-3 border border-gilt bg-vellum-light/60 p-2">
      <audio
        ref={audio}
        src={src}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setEnded(true)}
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime / (e.currentTarget.duration || 1))}
      />
      <button type="button" className="btn shrink-0 px-3 py-1 text-base" disabled={spent} onClick={toggle}>
        {spent ? "Heard" : playing ? "❚❚ Pause" : started ? "▶ Resume" : "▶ Play"}
      </button>
      <div className="min-w-0 flex-1">
        <div className="h-1.5 bg-vellum-deep">
          <div className="h-full bg-oxblood transition-[width] duration-200" style={{ width: `${(spent ? 1 : progress) * 100}%` }} />
        </div>
        <p className="smallcaps mt-1 text-xs text-ink-soft">
          {spent ? "Played on this phone" : started ? "Your one play" : "One play per phone — listen well"}
        </p>
      </div>
    </div>
  );
}
