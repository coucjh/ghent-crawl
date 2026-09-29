"use client";

import { useRef, useState } from "react";
import { savePhotoAction } from "@/app/actions";
import { Picture } from "./QuestionMedia";

const MAX_EDGE = 1600;

/** Shrinks a phone photo to a ~300 KB JPEG before it leaves the phone — quick on mobile data. */
async function shrink(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("The photo could not be read."))), "image/jpeg", 0.82),
  );
}

/** One photo per Order per challenge. Any member may send or replace it until the Pilgrimage closes. */
export function PhotoField({ stationId, partId, serverKey }: { stationId: number; partId: string; serverKey: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState<string>();
  const [preview, setPreview] = useState<string | null>(null);

  async function send(file: File) {
    setStatus("sending");
    setError(undefined);
    try {
      const jpeg = await shrink(file);
      setPreview(URL.createObjectURL(jpeg));
      const form = new FormData();
      form.append("photo", jpeg, "photo.jpg");
      const r = await savePhotoAction(stationId, partId, form);
      if (r.error) throw new Error(r.error);
      setStatus("idle");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "The photo could not be sent.");
    } finally {
      setPreview(null);
      if (input.current) input.current.value = "";
    }
  }

  const src = preview ?? (serverKey ? `/photos/${serverKey}` : null);
  return (
    <div className="pt-3">
      <span className="smallcaps text-sm text-ink-soft">Your Order&apos;s re-enactment</span>
      {src && <Picture src={src} plain />}
      <input
        ref={input}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => e.target.files?.[0] && send(e.target.files[0])}
      />
      <button type="button" className={`btn mt-2 w-full ${src ? "btn-quiet" : ""}`} disabled={status === "sending"} onClick={() => input.current?.click()}>
        {status === "sending" ? "Sending to the Abbots…" : src ? "Replace the photo" : "📷 Take or choose a photo"}
      </button>
      <p className="mt-1 text-right text-sm">
        {status === "error" ? (
          <span className="italic text-oxblood">{error}</span>
        ) : (
          serverKey && status === "idle" && <span className="smallcaps text-ink-soft">sent — only the Abbots and your Order see it</span>
        )}
      </p>
    </div>
  );
}
