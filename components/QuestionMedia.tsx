"use client";

import Image from "next/image";
import { useRef, useState, useSyncExternalStore } from "react";

/**
 * A picture: fills the column, tap to see it full screen. `plain` skips Next's image optimiser — needed for private
 * challenge photos, which the optimiser can't fetch without the viewer's login cookie.
 */
export function Picture({ src, plain = false, alt = "The picture for this question" }: { src: string; plain?: boolean; alt?: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button type="button" onClick={() => dialog.current?.showModal()} className="mt-3 block w-full border border-gilt p-1">
        {plain ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt} className="h-auto w-full" />
        ) : (
          <Image src={src} alt={alt} width={1200} height={900} sizes="(max-width: 448px) 100vw, 448px" className="h-auto w-full" />
        )}
        <span className="smallcaps mt-1 block text-center text-xs text-ink-soft">Tap to enlarge</span>
      </button>
      <dialog
        ref={dialog}
        onClick={() => dialog.current?.close()}
        className="m-auto max-h-none max-w-none bg-transparent p-2 backdrop:bg-ink/90"
      >
        {plain ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={`${alt}, enlarged`} className="h-auto max-h-[90dvh] w-auto max-w-[96vw]" />
        ) : (
          <Image src={src} alt={`${alt}, enlarged`} width={1600} height={1200} sizes="100vw" className="h-auto max-h-[90dvh] w-auto max-w-[96vw]" />
        )}
        <p className="smallcaps mt-2 text-center text-sm text-vellum-light">Tap to close</p>
      </dialog>
    </>
  );
}

// "One play per phone" lives in this phone's localStorage, keyed by player as well as clip: Reset the Abbey wipes
// the players, so everyone who rejoins hears each clip afresh. Not tamper-proof, by design.
const playedKey = (listener: string, src: string) => `abbey-played:${listener}:${src}`;
const PLAYED_EVENT = "abbey-played";

function hasPlayed(key: string) {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function markPlayed(key: string) {
  try {
    localStorage.setItem(key, "1");
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

/** A music clip that `listener` may hear once on this phone. Pausing and resuming within that one play is fine. */
export function ClipPlayer({ src, listener }: { src: string; listener: string }) {
  const audio = useRef<HTMLAudioElement>(null);
  const key = playedKey(listener, src);
  const used = useSyncExternalStore(subscribe, () => hasPlayed(key), () => false);
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
      markPlayed(key);
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
