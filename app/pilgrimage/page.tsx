import { redirect } from "next/navigation";
import { PILGRIMAGE_IDS, getStationStates } from "@/lib/game";
import { currentPlayer } from "@/lib/session";

/** /pilgrimage goes to whichever Pilgrimage is open (or the first). */
export default async function PilgrimageIndex() {
  if (!(await currentPlayer())) redirect("/");
  const states = await getStationStates();
  const open = PILGRIMAGE_IDS.findIndex((id) => states.get(id)!.status === "open");
  redirect(`/pilgrimage/${open === -1 ? 1 : open + 1}`);
}
