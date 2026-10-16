import { Crawl } from "@/components/Crawl";
import { getLeaderboard, getQuizViews } from "@/lib/quiz";
import { currentGuest } from "@/lib/session";

export default async function Home() {
  const guest = await currentGuest();
  const [quizzes, standings] = await Promise.all([getQuizViews(guest?.id), getLeaderboard(guest?.id)]);
  return <Crawl guest={guest?.name ?? null} quizzes={quizzes} standings={standings} />;
}
