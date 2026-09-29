import { beforeEach, describe, expect, it, vi } from "vitest";
import * as g from "./game";

// Runs against in-memory PGlite (DATABASE_URL=pglite://memory, see vitest.config.mts) using the real quiz content.

async function order(name: string, firstName = "Tom") {
  const r = await g.foundOrder(name, firstName);
  if (!r.ok) throw new Error(r.error);
  const p = await g.getPlayer(r.playerId);
  return p!.team;
}

beforeEach(async () => {
  vi.useRealTimers();
  await g.resetAbbey();
});

describe("joining", () => {
  it("founds an Order and lets others join it, restoring existing names", async () => {
    const team = await order("Order of St. Stella", "Tom");
    const anna = await g.joinOrder(team.id, "Anna");
    expect(anna.ok).toBe(true);
    expect(await g.listOrders()).toEqual([{ id: team.id, name: "Order of St. Stella" }]);
    expect((await g.joinOrder("no-such-order", "Bob")).ok).toBe(false);
    const tomAgain = await g.joinOrder(team.id, " tom ");
    const p = await g.getPlayer((tomAgain as { playerId: string }).playerId);
    expect(p!.player.firstName).toBe("Tom");
    expect(p!.members).toEqual(["Tom", "Anna"]);
  });

  it("caps the number of Orders and rejects duplicates", async () => {
    await order("A");
    expect((await g.foundOrder("a", "X")).ok).toBe(false);
    await order("B");
    await order("C");
    await order("D");
    expect(await g.foundOrder("E", "X")).toMatchObject({ ok: false });
  });

  it("locks new joiners once Station I opens, but still lets members rejoin", async () => {
    const team = await order("A", "Tom");
    await g.openStation(1);
    expect((await g.foundOrder("B", "X")).ok).toBe(false);
    expect((await g.joinOrder(team.id, "Newbie")).ok).toBe(false);
    expect((await g.joinOrder(team.id, "Tom")).ok).toBe(true);
  });
});

describe("a Station", () => {
  it("runs open → Word → answer → close → marked → appeal → accepted", async () => {
    const team = await order("A");
    expect((await g.speakWord(team.id, 1, "pax")).ok).toBe(false); // not open yet

    expect((await g.openStation(1)).ok).toBe(true);
    expect((await g.saveAnswer(team.id, 1, "q1", "Gravensteen")).ok).toBe(false); // no Word yet
    expect((await g.speakWord(team.id, 1, "wrong")).ok).toBe(false);
    expect((await g.speakWord(team.id, 1, " PAX ")).ok).toBe(true);

    let view = await g.getStationView(team.id, 1);
    expect(view!.questions).toHaveLength(8);
    expect(JSON.stringify(view)).not.toContain("Castle of the Counts"); // answers never leak while open

    await g.saveAnswer(team.id, 1, "q1", "the gravesteen"); // typo + article → correct
    await g.saveAnswer(team.id, 1, "q2", "Meuse"); // wrong choice
    await g.saveAnswer(team.id, 1, "q8", "wyvern"); // wrong, worth 2 → will be appealed
    expect((await g.saveAnswer(team.id, 1, "q2", "Danube")).ok).toBe(false); // not an option

    expect((await g.closeStation(1)).ok).toBe(true);
    expect((await g.saveAnswer(team.id, 1, "q1", "late")).ok).toBe(false);

    view = await g.getStationView(team.id, 1);
    expect(view!.score).toBe(1);
    expect(view!.answers.q1.correct).toBe(true);
    expect(view!.answers.q2.correct).toBe(false);
    expect(view!.corrections!.q1).toBe("Gravensteen");

    expect((await g.appeal(team.id, 1, "q1")).ok).toBe(false); // already correct
    expect((await g.appeal(team.id, 1, "q5")).ok).toBe(false); // unanswered
    expect((await g.appeal(team.id, 1, "q8")).ok).toBe(true);
    expect((await g.appeal(team.id, 1, "q8")).ok).toBe(false); // only once

    const disputes = await g.getDisputes();
    expect(disputes).toHaveLength(1);
    expect(disputes[0]).toMatchObject({ teamName: "A", given: "wyvern", accepted: ["Dragon", "A dragon"] });

    await g.resolveAppeal(team.id, 1, "q8", true);
    expect(await g.getDisputes()).toHaveLength(0);
    expect((await g.getStationView(team.id, 1))!.score).toBe(3);
    expect((await g.getStandings())[0]).toMatchObject({ name: "A", score: 3 });
  });

  it("blocks edits after sealing", async () => {
    const team = await order("A");
    await g.openStation(1);
    await g.speakWord(team.id, 1, "pax");
    await g.sealAnswers(team.id, 1);
    expect((await g.saveAnswer(team.id, 1, "q1", "x")).ok).toBe(false);
    expect((await g.getStationView(team.id, 1))!.sealed).toBe(true);
  });

  it("lets an Abbot grant entry without the Word", async () => {
    const team = await order("A");
    await g.openStation(1);
    await g.grantEntry(team.id, 1);
    expect((await g.saveAnswer(team.id, 1, "q1", "x")).ok).toBe(true);
  });

  it("opens Stations only in order and one at a time", async () => {
    expect((await g.openStation(2)).ok).toBe(false);
    await g.openStation(1);
    expect((await g.openStation(2)).ok).toBe(false);
    await g.closeStation(1);
    expect((await g.openStation(2)).ok).toBe(true);
    expect((await g.openStation(1)).ok).toBe(false);
  });

  it("closes itself when Last Orders runs out", async () => {
    const team = await order("A");
    await g.openStation(1);
    await g.speakWord(team.id, 1, "pax");
    await g.saveAnswer(team.id, 1, "q1", "Gravensteen");
    await g.callLastOrders(1, 120);
    expect((await g.getStationStates()).get(1)!.status).toBe("open");

    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(Date.now() + 121_000);
    expect((await g.saveAnswer(team.id, 1, "q2", "Scheldt")).ok).toBe(false);
    expect((await g.getStationStates()).get(1)!.status).toBe("closed");
    expect((await g.getStationView(team.id, 1))!.score).toBe(1);
  });
});

describe("the Book of Judgement", () => {
  it("is open until the final Station opens, sealed until revealed", async () => {
    const a = await order("A");
    await order("B");
    for (const id of [1, 2, 3, 4]) {
      await g.openStation(id);
      if (id === 1) {
        await g.speakWord(a.id, 1, "pax");
        await g.saveAnswer(a.id, 1, "q1", "Gravensteen");
      }
      await g.closeStation(id);
    }
    const book = await g.getBook();
    expect(book.state).toBe("open");
    expect(book.state === "open" && book.standings.map((s) => [s.name, s.score])).toEqual([
      ["A", 1],
      ["B", 0],
    ]);

    await g.openStation(5);
    expect((await g.getBook()).state).toBe("sealed");
    expect((await g.reveal()).ok).toBe(false);
    await g.closeStation(5);
    expect((await g.getBook()).state).toBe("sealed");
    expect((await g.reveal()).ok).toBe(true);
    expect((await g.getBook()).state).toBe("revealed");
  });
});
