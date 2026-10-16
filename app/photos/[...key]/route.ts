import { photoOwner, readPhoto } from "@/lib/photos";
import { isAbbot } from "@/lib/session";

/** Serves an uploaded photo — admin only. */
export async function GET(_req: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const key = (await params).key.join("/");
  if (!photoOwner(key)) return new Response("Not found", { status: 404 });
  if (!(await isAbbot())) return new Response("Admin only.", { status: 403 });

  const body = await readPhoto(key);
  if (!body) return new Response("Not found", { status: 404 });
  return new Response(body, {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, max-age=86400, immutable" },
  });
}
