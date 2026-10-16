import { LoginForm } from "@/components/abbot/controls";
import { isAbbot } from "@/lib/session";

export default async function AdminPage() {
  return (
    <main className="mx-auto max-w-md px-4 pt-[max(2rem,env(safe-area-inset-top))] pb-10">
      <h1 className="mb-6 text-center font-display text-5xl text-hot">Admin</h1>
      {(await isAbbot()) ? (
        <section className="rounded-3xl border-4 border-ink bg-zest p-6 shadow-[6px_6px_0_var(--color-ink)]">
          <h2 className="font-display text-3xl">Mr &amp; Mrs 💍</h2>
          <p className="mt-2 text-lg">Coming soon. Questions from the bride go here.</p>
        </section>
      ) : (
        <LoginForm />
      )}
    </main>
  );
}
