import { beforeEach, describe, expect, it, vi } from "vitest";
import { ORDER_EMOJI } from "./config";
import * as g from "./game";

// Runs against in-memory PGlite (DATABASE_URL=pglite://memory, see vitest.config.mts) with a fixture quiz.
vi.mock("@/content/quiz", () => import("../test/fixture-quiz"));

let emblem = 0;
async function order(name: string, firstName = "Tom") {
  const r = await g.foundOrder(name, firstName, ORDER_EMOJI[emblem++ % ORDER_EMOJI.length]);
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
    expect(await g.listOrders()).toMatchObject([{ id: team.id, name: "Order of St. Stella" }]);
    expect((await g.joinOrder("no-such-order", "Bob")).ok).toBe(false);
    const tomAgain = await g.joinOrder(team.id, " tom ");
    const p = await g.getPlayer((tomAgain as { playerId: string }).playerId);
    expect(p!.player.firstName).toBe("Tom");
    expect(p!.members).toEqual(["Tom", "Anna"]);
  });

  it("caps the number of Orders and rejects duplicates", async () => {
    await order("A");
    expect((await g.foundOrder("a", "X", "🦉")).ok).toBe(false);
    await order("B");
    await order("C");
    await order("D");
    expect(await g.foundOrder("E", "X", "🦉")).toMatchObject({ ok: false });
  });

  it("gives each Order its own emblem from the set", async () => {
    expect((await g.foundOrder("A", "Tom", "🦈")).ok).toBe(true);
    expect(await g.foundOrder("B", "Anna", "🦈")).toMatchObject({ ok: false, error: "Another Order already bears that emblem." });
    expect((await g.foundOrder("B", "Anna", "💩")).ok).toBe(false);
    expect(await g.listOrders()).toMatchObject([{ name: "A", emoji: "🦈" }]);
  });

  it("locks new joiners once Station I opens, but still lets members rejoin", async () => {
    const team = await order("A", "Tom");
    await g.openStation(1);
    expect((await g.foundOrder("B", "X", "🦉")).ok).toBe(false);
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

describe("picture and music questions", () => {
  it("sends the picture and clip, splits music into Artist and Song boxes, and marks each", async () => {
    const a = await order("A");
    for (const id of [1, 2]) {
      await g.openStation(id);
      await g.closeStation(id);
    }
    await g.openStation(3);
    await g.grantEntry(a.id, 3);

    const open = (await g.getStationView(a.id, 3))!;
    expect(open.questions![0]).toMatchObject({ image: "/media/p1.jpg", parts: [{ id: "q1", kind: "text" }] });
    expect(open.questions![1]).toMatchObject({
      clip: "/media/m1.mp3",
      parts: [
        { id: "q2.artist", label: "Artist", kind: "text" },
        { id: "q2.song", label: "Song", kind: "text" },
      ],
    });
    expect(JSON.stringify(open)).not.toContain("Sneaky Snitch");
    expect(open.maxScore).toBe(3);

    expect((await g.saveAnswer(a.id, 3, "q2", "whole question")).ok).toBe(false); // must answer a part
    await g.saveAnswer(a.id, 3, "q2.artist", "kevin macleod");
    await g.saveAnswer(a.id, 3, "q2.song", "Sneaky Snatch");
    await g.saveAnswer(a.id, 3, "q1", "Belfort");
    await g.closeStation(3);

    const marked = (await g.getStationView(a.id, 3))!;
    expect(marked.score).toBe(2); // artist + a one-letter typo in the song
    expect(marked.corrections).toMatchObject({ q1: "Gravensteen", "q2.artist": "Kevin MacLeod", "q2.song": "Sneaky Snitch" });

    await g.saveAnswer(a.id, 3, "q2.song", "x"); // closed: ignored
    expect((await g.appeal(a.id, 3, "q1")).ok).toBe(true);
    expect((await g.getDisputes())[0]).toMatchObject({ prompt: "What is this?", given: "Belfort" });
  });
});

describe("the race", () => {
  it("lays one track segment per Station and remembers where each Order stood before the last one", async () => {
    const a = await order("A");
    const b = await order("B");
    await g.openStation(1);
    await g.speakWord(a.id, 1, "pax");
    await g.saveAnswer(a.id, 1, "q1", "Gravensteen");
    await g.saveAnswer(a.id, 1, "q8", "dragon");
    await g.closeStation(1);

    let book = await g.getBook();
    if (book.state !== "open") throw new Error(book.state);
    expect(book.track).toEqual({
      total: 18,
      gates: [
        { id: 1, label: "I", at: 9 },
        { id: 2, label: "II", at: 10 },
        { id: 3, label: "III", at: 13 },
        { id: g.PILGRIMAGE_ID, label: "✦", at: 16 },
        { id: 4, label: "IV", at: 17 },
        { id: 5, label: "V", at: 18 },
      ],
      last: "Station I",
    });
    expect(book.standings).toMatchObject([
      { name: "A", score: 3, previousScore: 0, lane: 0 },
      { name: "B", score: 0, previousScore: 0, lane: 1 },
    ]);

    await g.openStation(2);
    await g.speakWord(b.id, 2, "lupulus");
    await g.saveAnswer(b.id, 2, "q1", "filler");
    await g.closeStation(2);
    book = await g.getBook();
    if (book.state !== "open") throw new Error(book.state);
    expect(book.track.last).toBe("Station II");
    expect(book.standings).toMatchObject([
      { name: "A", score: 3, previousScore: 3 },
      { name: "B", score: 1, previousScore: 0 },
    ]);
  });
});

describe("the Pilgrimage", () => {
  const P = g.PILGRIMAGE_ID;
  const hold = async (id: number) => {
    await g.openStation(id);
    await g.closeStation(id);
  };

  it("opens with Station I, needs no Word, stays open between pubs, and closes when Station IV opens", async () => {
    const a = await order("A");
    expect((await g.getStationStates()).get(P)!.status).toBe("sealed");
    expect((await g.saveAnswer(a.id, P, "q1", "Bavo")).ok).toBe(false);

    await g.openStation(1);
    expect((await g.getStationStates()).get(P)!.status).toBe("open");
    const view = (await g.getStationView(a.id, P))!;
    expect(view).toMatchObject({ unlocked: true, sealed: false, score: null, maxScore: 3 });
    expect((await g.saveAnswer(a.id, P, "q1", "Bavo")).ok).toBe(true); // no Word needed
    expect((await g.sealAnswers(a.id, P)).ok).toBe(false);
    expect((await g.callLastOrders(P)).ok).toBe(false);

    await g.closeStation(1);
    await hold(2);
    await hold(3);
    expect((await g.saveAnswer(a.id, P, "q2.song", "sneaky snitch")).ok).toBe(true); // between pubs
    expect((await g.getStationStates()).get(P)!.status).toBe("open");

    await g.openStation(4);
    expect((await g.getStationStates()).get(P)!.status).toBe("closed");
    expect((await g.saveAnswer(a.id, P, "q2.artist", "Kevin MacLeod")).ok).toBe(false);
    expect((await g.getStationView(a.id, P))!.score).toBe(2);
  });

  it("keeps its points hidden until it closes, then lands them as its own segment of the race", async () => {
    const a = await order("A");
    await g.openStation(1);
    await g.saveAnswer(a.id, P, "q1", "Saint Bavo");
    await g.closeStation(1);
    await hold(2);
    await hold(3);
    expect((await g.getStandings())[0].score).toBe(0);

    await g.openStation(4);
    let book = await g.getBook();
    if (book.state !== "open") throw new Error(book.state);
    expect(book.standings[0]).toMatchObject({ score: 1, previousScore: 0 });
    expect(book.track.gates.map((gate) => gate.label)).toEqual(["I", "II", "III", "✦", "IV", "V"]);
    expect(book.track.last).toBe("the Pilgrimage");

    await g.closeStation(4);
    book = await g.getBook();
    if (book.state !== "open") throw new Error(book.state);
    expect(book.track.last).toBe("Station IV");
    expect(book.standings[0]).toMatchObject({ score: 1, previousScore: 1 });
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
