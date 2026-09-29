import { AutoRefresh } from "@/components/AutoRefresh";
import { Masthead, PlayerShell } from "@/components/PlayerShell";
import { Welcome } from "@/components/Welcome";
import { joiningLocked, listOrders } from "@/lib/game";
import { currentPlayer } from "@/lib/session";

export default async function Home({ searchParams }: PageProps<"/">) {
  const player = await currentPlayer();
  const dev = "dev" in (await searchParams);
  if (player) return <PlayerShell player={player} dev={dev} />;

  return (
    <>
      <AutoRefresh />
      <Masthead />
      <p className="mb-6 text-center text-lg italic">
        Five taverns. Five sealed Stations. At each, the barkeep holds the Word that breaks the seal.
      </p>
      <Welcome locked={await joiningLocked()} orders={await listOrders()} />
    </>
  );
}
