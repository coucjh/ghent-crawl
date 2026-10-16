import { DeletePlayer, LoginForm, WipeForm } from "@/components/abbot/controls";
import { getLeaderboard } from "@/lib/quiz";
import { isAbbot } from "@/lib/session";

const CARD = "mb-6 rounded-3xl border-4 border-ink bg-white p-5 text-ink shadow-[6px_6px_0_var(--color-ink)]";

export default async function AdminPage() {
  if (!(await isAbbot()))
    return (
      <main className="mx-auto max-w-md px-4 pt-[max(2rem,env(safe-area-inset-top))] pb-10">
        <h1 className="mb-6 text-center font-display text-5xl text-hot">Admin</h1>
        <LoginForm />
      </main>
    );

  const players = await getLeaderboard();

  return (
    <main className="mx-auto max-w-md px-4 pt-[max(2rem,env(safe-area-inset-top))] pb-10">
      <h1 className="mb-6 text-center font-display text-5xl text-hot">Admin</h1>

      <section className={CARD}>
        <h2 className="mb-3 font-display text-3xl">Players</h2>
        <ul className="divide-y divide-ink/15">
          {players.map((p) => (
            <li key={p.id} className="flex items-center gap-3 py-2">
              <span className="min-w-0 flex-1 truncate text-lg font-bold">{p.name}</span>
              <span className="font-display text-xl tabular-nums">{p.score}</span>
              <DeletePlayer id={p.id} name={p.name} />
            </li>
          ))}
          {players.length === 0 && <li className="py-1 italic">Nobody yet.</li>}
        </ul>
      </section>

      <section className={`${CARD} border-dashed`}>
        <h2 className="mb-3 font-display text-2xl">Wipe players</h2>
        <WipeForm />
      </section>
    </main>
  );
}
