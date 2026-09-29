import { notFound, redirect } from "next/navigation";
import { PlayerShell } from "@/components/PlayerShell";
import { PILGRIMAGE_IDS, pilgrimageId } from "@/lib/game";
import { currentPlayer } from "@/lib/session";

export default async function PilgrimagePage({ params }: PageProps<"/pilgrimage/[n]">) {
  const player = await currentPlayer();
  if (!player) redirect("/");
  const id = pilgrimageId(Number((await params).n));
  if (!PILGRIMAGE_IDS.includes(id)) notFound();
  return <PlayerShell player={player} stationId={id} dev={false} />;
}
