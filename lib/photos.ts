import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

// Where photo-challenge photos live. Keys look like "<teamId>/<uuid>.jpg" and are served only through /photos/<key>,
// which checks the viewer. Production: private Vercel Blob. Local dev: ./.uploads (git-ignored).

const useBlob = !!process.env.BLOB_READ_WRITE_TOKEN;
const LOCAL_DIR = path.join(process.cwd(), ".uploads");
const blobPath = (key: string) => `photos/${key}`;
const KEY = /^[\w-]+\/[\w-]+\.jpg$/;

export const MAX_PHOTO_BYTES = 3 * 1024 * 1024;

/** The Order a photo key belongs to, or null if the key isn't one of ours. */
export function photoOwner(key: string): string | null {
  return KEY.test(key) ? key.split("/")[0] : null;
}

export async function storePhoto(teamId: string, jpeg: ArrayBuffer): Promise<string> {
  const key = `${teamId}/${randomUUID()}.jpg`;
  if (useBlob) {
    const { put } = await import("@vercel/blob");
    await put(blobPath(key), Buffer.from(jpeg), { access: "private", contentType: "image/jpeg", addRandomSuffix: false });
  } else if (process.env.VERCEL) {
    throw new Error("Photo storage isn't set up: add a Blob store to this Vercel project (Storage → Blob).");
  } else {
    await mkdir(path.join(LOCAL_DIR, teamId), { recursive: true });
    await writeFile(path.join(LOCAL_DIR, key), Buffer.from(jpeg));
  }
  return key;
}

export async function readPhoto(key: string): Promise<ReadableStream<Uint8Array> | ArrayBuffer | null> {
  if (!photoOwner(key)) return null;
  if (useBlob) {
    const { get } = await import("@vercel/blob");
    const result = await get(blobPath(key), { access: "private" });
    return result?.statusCode === 200 ? result.stream : null;
  }
  const file = await readFile(path.join(LOCAL_DIR, key)).catch(() => null);
  return file && new Uint8Array(file).buffer;
}

export async function deletePhotos(keys: string[]) {
  const ours = keys.filter((k) => photoOwner(k));
  if (ours.length === 0) return;
  if (useBlob) {
    const { del } = await import("@vercel/blob");
    await del(ours.map(blobPath));
  } else {
    await Promise.all(ours.map((k) => rm(path.join(LOCAL_DIR, k), { force: true })));
  }
}
