import { photoOwner, readPhoto } from "@/lib/photos";
import { currentPlayer, isAbbot } from "@/lib/session";

/** Serves a challenge photo — only to the Abbots and to the Order that took it. */
export async function GET(_req: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const key = (await params).key.join("/");
  const owner = photoOwner(key);
  if (!owner) return new Response("Not found", { status: 404 });

  const allowed = (await isAbbot()) || (await currentPlayer())?.team.id === owner;
  if (!allowed) return new Response("These photos are for the Abbots and the Order that took them.", { status: 403 });

  const body = await readPhoto(key);
  if (!body) return new Response("Not found", { status: 404 });
  return new Response(body, {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, max-age=86400, immutable" },
  });
}
