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
      total: 26,
      gates: [
        { id: 1, label: "I", at: 9 },
        { id: 2, label: "II", at: 10 },
        { id: g.pilgrimageId(1), label: "✦I", at: 13 },
        { id: 3, label: "III", at: 16 },
        { id: 4, label: "IV", at: 17 },
        { id: g.pilgrimageId(2), label: "✦II", at: 25 },
        { id: 5, label: "V", at: 26 },
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

describe("the Pilgrimages", () => {
  const P1 = g.pilgrimageId(1);
  const P2 = g.pilgrimageId(2);
  const status = async (id: number) => (await g.getStationStates()).get(id)!.status;
  const hold = async (id: number) => {
    await g.openStation(id);
    await g.closeStation(id);
  };

  it("hand over at Station III: the first opens with I and closes as III opens, the second opens then and closes with V", async () => {
    const a = await order("A");
    expect(await status(P1)).toBe("sealed");
    expect((await g.saveAnswer(a.id, P1, "q1", "Bavo")).ok).toBe(false);

    await g.openStation(1);
    expect(await status(P1)).toBe("open");
    expect(await status(P2)).toBe("sealed");
    const view = (await g.getStationView(a.id, P1))!;
    expect(view).toMatchObject({ unlocked: true, sealed: false, score: null, maxScore: 3, pilgrimage: { opensWith: 1, closesWith: 3 } });
    expect((await g.saveAnswer(a.id, P1, "q1", "Bavo")).ok).toBe(true); // no Word needed
    expect((await g.sealAnswers(a.id, P1)).ok).toBe(false);
    expect((await g.callLastOrders(P1)).ok).toBe(false);

    await g.closeStation(1);
    await hold(2);
    expect((await g.saveAnswer(a.id, P1, "q2.song", "sneaky snitch")).ok).toBe(true); // between pubs
    expect(await status(P1)).toBe("open");

    await g.openStation(3);
    expect(await status(P1)).toBe("closed");
    expect(await status(P2)).toBe("open");
    expect((await g.saveAnswer(a.id, P1, "q2.artist", "Kevin MacLeod")).ok).toBe(false);
    expect((await g.getStationView(a.id, P1))!.score).toBe(2);

    await g.closeStation(3);
    await hold(4);
    await g.openStation(5);
    expect(await status(P2)).toBe("closed");
  });

  it("keeps points hidden until the Pilgrimage closes, then lands them as its own segment of the race", async () => {
    const a = await order("A");
    await g.openStation(1);
    await g.saveAnswer(a.id, P1, "q1", "Saint Bavo");
    await g.closeStation(1);
    await hold(2);
    expect((await g.getStandings())[0].score).toBe(0);

    await g.openStation(3);
    let book = await g.getBook();
    if (book.state !== "open") throw new Error(book.state);
    expect(book.standings[0]).toMatchObject({ score: 1, previousScore: 0 });
    expect(book.track.last).toBe("the First Pilgrimage");

    await g.closeStation(3);
    book = await g.getBook();
    if (book.state !== "open") throw new Error(book.state);
    expect(book.track.last).toBe("Station III");
    expect(book.standings[0]).toMatchObject({ score: 1, previousScore: 1 });
  });
});

describe("photo challenges", () => {
  const P2 = g.pilgrimageId(2);
  const toP2 = async () => {
    for (const id of [1, 2]) {
      await g.openStation(id);
      await g.closeStation(id);
    }
    await g.openStation(3);
  };

  it("take one photo per Order per painting, replaceable until the Pilgrimage closes", async () => {
    const a = await order("A");
    expect((await g.savePhoto(a.id, P2, "q1", "a/1.jpg")).ok).toBe(false); // not open yet
    await toP2();

    expect(await g.savePhoto(a.id, P2, "q1", "a/1.jpg")).toEqual({ ok: true, replaced: null });
    expect(await g.savePhoto(a.id, P2, "q1", "a/2.jpg")).toEqual({ ok: true, replaced: "a/1.jpg" });
    expect((await g.saveAnswer(a.id, P2, "q1", "a/3.jpg")).ok).toBe(false); // only through savePhoto
    expect((await g.savePhoto(a.id, 3, "q1", "a/4.jpg")).ok).toBe(false); // not a photo question

    const view = (await g.getStationView(a.id, P2))!;
    expect(view.questions![0]).toMatchObject({ image: "/media/r1.jpg", parts: [{ id: "q1", kind: "photo", points: 5 }] });
    expect(view.answers.q1.value).toBe("a/2.jpg");
    expect(view.maxScore).toBe(8);
  });

  it("score only the crowned photo, and only once the Pilgrimage has closed", async () => {
    const a = await order("A");
    const b = await order("B");
    await toP2();
    await g.savePhoto(a.id, P2, "q1", "a/1.jpg");
    await g.savePhoto(b.id, P2, "q1", "b/1.jpg");
    await g.savePhoto(b.id, P2, "q2", "b/2.jpg");

    expect((await g.crownPhoto(P2, "q1", a.id)).ok).toBe(true);
    expect((await g.crownPhoto(P2, "q1", b.id)).ok).toBe(true); // the Abbots change their minds
    expect((await g.crownPhoto(P2, "q2", a.id)).ok).toBe(false); // A has no photo for q2
    expect((await g.getStandings()).map((s) => s.score)).toEqual([0, 0]); // still hidden

    // Replacing a crowned photo loses the crown
    await g.savePhoto(b.id, P2, "q1", "b/1-again.jpg");
    expect((await g.getPhotoBoard()).find((c) => c.partId === "q1")!.entries.every((e) => !e.crowned)).toBe(true);
    await g.crownPhoto(P2, "q1", b.id);

    await g.closeStation(3);
    await g.openStation(4);
    await g.closeStation(4);
    await g.openStation(5); // closes the Pilgrimage
    await g.crownPhoto(P2, "q2", b.id); // crowned after closing still counts

    const standings = await g.getStandings();
    expect(standings.find((s) => s.name === "B")!.score).toBe(8);
    expect(standings.find((s) => s.name === "A")!.score).toBe(0);
    expect((await g.getStationView(b.id, P2))!.score).toBe(8);
    expect((await g.appeal(a.id, P2, "q1")).ok).toBe(false); // no appeals on photos
    expect((await g.savePhoto(a.id, P2, "q2", "a/late.jpg")).ok).toBe(false);

    const board = await g.getPhotoBoard();
    expect(board).toMatchObject([
      { roundId: P2, partId: "q1", painting: "/media/r1.jpg", status: "closed", entries: [{ name: "A", crowned: false }, { name: "B", crowned: true }] },
      { roundId: P2, partId: "q2", entries: [{ name: "B", key: "b/2.jpg", crowned: true }] },
    ]);
  });

  it("hands back every photo key when an Order is deleted or the Abbey is reset, so the files can go too", async () => {
    const a = await order("A");
    const b = await order("B");
    await toP2();
    await g.savePhoto(a.id, P2, "q1", "a/1.jpg");
    await g.savePhoto(b.id, P2, "q1", "b/1.jpg");
    await g.saveAnswer(a.id, 3, "q1", "not a photo");
    expect(await g.deleteOrder(a.id)).toEqual({ ok: true, photos: ["a/1.jpg"] });
    expect(await g.resetAbbey()).toEqual({ ok: true, photos: ["b/1.jpg"] });
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
