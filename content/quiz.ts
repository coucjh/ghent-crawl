import "server-only";
import type { Pilgrimage, Station } from "@/lib/types";

// PLACEHOLDER CONTENT — replace names, pubs, Words and questions before the night.
// Question ids must be unique within a Station; changing them after answers exist orphans those answers.

export const MAX_ORDERS = 4;

export const STATIONS: Station[] = [
    {
      id: 1,
      name: "Peep show quotes involving Mark",
      pub: "Dulle Griet",
      word: "pax",
      questions: [
        { id: "q1", type: "text", prompt: "Complete this sentence, Hey Marrrk... come and put your tongue up Lindsey's arsehole [BLANK]", answers: ["It's Clean!", "its clean", "its clean!"] },
        { id: "q2", type: "choice", prompt: "Mark, horrified at the curry house: \"Four naan, Jeremy? Four? That's...\"", options: ["Insane", "Obscene", "Madness", "Disgusting"], answer: "Insane" },
        { id: "q3", type: "text", prompt: "Super Hans warns Mark not to trust popular opinion: \"People like Coldplay and voted for the...\"", answers: ["Nazis", "the Nazis", "Nazi", "Nazi party"] },
        { id: "q4", type: "text", prompt: "Mark tries to stay calm at a party: \"I'm Louis Theroux. I'm Louis Theroux with his wry smile at the...\"", answers: ["Orgy", "the orgy", "an orgy"] },
      ],
    },
  {
    id: 2,
    name: "Of Beer & Brewing",
    pub: "The Second Tavern (to be chosen)",
    word: "lupulus",
    questions: [
      { id: "q1", type: "choice", prompt: "Which grain is most commonly malted for beer?", options: ["Barley", "Rice", "Oats", "Rye"], answer: "Barley" },
      { id: "q2", type: "text", prompt: "Which flower gives beer its bitterness?", answers: ["Hops", "Hop"] },
      { id: "q3", type: "text", prompt: "Westvleteren is brewed at the Abbey of Saint…?", answers: ["Sixtus", "Saint Sixtus", "St Sixtus"] },
      { id: "q4", type: "choice", prompt: "Which Trappist beer comes in a skittle-shaped bottle?", options: ["Orval", "Chimay", "Westmalle", "Rochefort"], answer: "Orval" },
    ],
  },
  {
    id: 3,
    name: "The Picture Round",
    pub: "The Third Tavern (to be chosen)",
    word: "sanctus",
    questions: [
      { id: "q1", type: "text", prompt: "Which castle is this?", image: "/media/p1.jpg", answers: ["Gravensteen", "'s-Gravensteen", "Castle of the Counts"] },
      { id: "q2", type: "choice", prompt: "Which city's skyline is this?", image: "/media/p2.jpg", options: ["Ghent", "Bruges", "Antwerp", "Leuven"], answer: "Ghent" },
      { id: "q3", type: "text", prompt: "Name this small but famous statue.", image: "/media/p3.jpg", answers: ["Manneken Pis"] },
      { id: "q4", type: "text", prompt: "Name this building.", image: "/media/p4.jpg", answers: ["Atomium", "The Atomium"] },
    ],
  },
  {
    id: 4,
    name: "Of Monks & Monasteries",
    pub: "The Fourth Tavern (to be chosen)",
    word: "gratia",
    questions: [
      { id: "q1", type: "text", prompt: "What is the head of an abbey called?", answers: ["Abbot", "Abbess"] },
      { id: "q2", type: "text", prompt: "Benedictine monks follow the Rule of Saint…?", answers: ["Benedict"] },
      { id: "q3", type: "text", prompt: "What is the shaved crown of a monk's head called?", answers: ["Tonsure"] },
      { id: "q4", type: "choice", prompt: "What is a monk's hooded garment called?", options: ["Cowl", "Cape", "Cassock", "Surplice"], answer: "Cowl" },
    ],
  },
  {
    id: 5,
    name: "Of Belgium",
    pub: "The Fifth Tavern (to be chosen)",
    word: "amen",
    questions: [
      { id: "q1", type: "choice", prompt: "Which colour is NOT on the Belgian flag?", options: ["Blue", "Black", "Yellow", "Red"], answer: "Blue" },
      { id: "q2", type: "text", prompt: "Belgian waffles come in two famous styles: Brussels and…?", answers: ["Liège", "Luik", "Luttich"] },
      { id: "q3", type: "text", prompt: "What is the famous statue of a urinating boy in Brussels called?", answers: ["Manneken Pis"] },
      { id: "q4", type: "choice", prompt: "Which Belgian city is famous for its diamond trade?", options: ["Antwerp", "Bruges", "Leuven", "Namur"], answer: "Antwerp" },
    ],
  },
];

// PLACEHOLDER — the Pilgrimages, answered on the road. Music clips are cut by `npm run clips` (see media-src/clips.json);
// the test clips are free Kevin MacLeod tracks and the paintings are public domain (docs/test-media-credits.md).
export const PILGRIMAGES: Pilgrimage[] = [
  {
    name: "The Chorister's Pilgrimage",
    opensWith: 1,
    closesWith: 3,
    questions: [
      { id: "q1", type: "music", prompt: "Name this chant", clip: "/media/m1.mp3", artist: ["Kevin MacLeod"], song: ["Sneaky Snitch"] },
      { id: "q2", type: "music", prompt: "Name this chant", clip: "/media/m2.mp3", artist: ["Kevin MacLeod"], song: ["Monkeys Spinning Monkeys"] },
      { id: "q3", type: "music", prompt: "Name this chant", clip: "/media/m3.mp3", artist: ["Kevin MacLeod"], song: ["Fluffing a Duck"] },
      { id: "q4", type: "music", prompt: "Name this chant", clip: "/media/m4.mp3", artist: ["Kevin MacLeod"], song: ["Carefree"] },
      { id: "q5", type: "music", prompt: "Name this chant", clip: "/media/m5.mp3", artist: ["Kevin MacLeod"], song: ["Local Forecast", "Local Forecast Elevator"] },
    ],
  },
  {
    name: "The Painters' Pilgrimage",
    opensWith: 3,
    closesWith: 5,
    questions: [
      { id: "q1", type: "photo", prompt: "Re-enact the Adoration of the Mystic Lamb, from the Ghent Altarpiece. Best on the walk to Station IV.", image: "/media/r1.jpg" },
      { id: "q2", type: "photo", prompt: "Re-enact Christ Carrying the Cross, Bosch's crowd of faces in Ghent's MSK. Best on the walk to Station V.", image: "/media/r2.jpg" },
    ],
  },
];
