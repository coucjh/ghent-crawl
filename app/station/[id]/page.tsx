import { notFound, redirect } from "next/navigation";
import { PlayerShell } from "@/components/PlayerShell";
import { stationById } from "@/lib/game";
import { currentPlayer } from "@/lib/session";

export default async function StationPage({ params, searchParams }: PageProps<"/station/[id]">) {
  const player = await currentPlayer();
  if (!player) redirect("/");
  const id = Number((await params).id);
  if (!stationById(id)) notFound();
  return <PlayerShell player={player} stationId={id} dev={"dev" in (await searchParams)} />;
}
