import { redirect } from "next/navigation";
import { PlayerShell } from "@/components/PlayerShell";
import { PILGRIMAGE_ID } from "@/lib/game";
import { currentPlayer } from "@/lib/session";

export default async function PilgrimagePage() {
  const player = await currentPlayer();
  if (!player) redirect("/");
  return <PlayerShell player={player} stationId={PILGRIMAGE_ID} dev={false} />;
}
