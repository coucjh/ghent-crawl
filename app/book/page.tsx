import Link from "next/link";
import { AutoRefresh } from "@/components/AutoRefresh";
import { BookView } from "@/components/BookView";
import { Masthead } from "@/components/PlayerShell";
import { getBook } from "@/lib/game";
import { currentPlayer } from "@/lib/session";

export default async function BookPage() {
  const [book, player] = await Promise.all([getBook(), currentPlayer()]);
  return (
    <>
      {book.state !== "revealed" && <AutoRefresh />}
      <Masthead />
      <div className="label-frame px-5 py-6">
        <h2 className="mb-4 text-center font-display text-4xl text-oxblood">The Book of Judgement</h2>
        <BookView book={book} highlight={player?.team.id} />
      </div>
      <Link href="/" className="btn-quiet btn mt-8 w-full">
        Return to your Station
      </Link>
    </>
  );
}
