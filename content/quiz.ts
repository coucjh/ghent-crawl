import "server-only";
import type { Station } from "@/lib/types";

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
        { id: "q5", type: "choice", prompt: "According to Mark, saying 'I love you' is like firing first in a...", options: ["Duel", "War", "Gunfight", "Penalty shootout"], answer: "Duel" },
        { id: "q6", type: "text", prompt: "Mark, on buying the flat: \"I've entered the abyss. I've bought a [BLANK] in the abyss.\"", answers: ["House", "a house"] },
        { id: "q7", type: "choice", prompt: "Mark backs out of a date: \"Can't do it. It's too much. I'm not [BLANK]; I can't date.\"", options: ["American", "French", "Italian", "Jeremy"], answer: "American" },
        { id: "q8", type: "text", prompt: "Mark sums up his worldview: \"Life is all pain. Pain, rejection and...\"", answers: ["Gloom", "gloom"], points: 2 },
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
      { id: "q5", type: "text", prompt: "What is the process by which yeast turns sugar into alcohol?", answers: ["Fermentation"] },
      { id: "q6", type: "text", prompt: "Kriek is a Belgian beer made with which fruit?", answers: ["Cherries", "Cherry", "Sour cherries"] },
      { id: "q7", type: "text", prompt: "What is the name for the foam on top of a poured beer?", answers: ["Head", "Foam"] },
      { id: "q8", type: "text", prompt: "Gueuze is a blend of young and old…?", answers: ["Lambic", "Lambics"] },
    ],
  },
  {
    id: 3,
    name: "Of the Wider World",
    pub: "The Third Tavern (to be chosen)",
    word: "sanctus",
    questions: [
      { id: "q1", type: "text", prompt: "What is the capital of Belgium?", answers: ["Brussels", "Bruxelles", "Brussel"] },
      { id: "q2", type: "text", prompt: "Which Belgian detective did Agatha Christie create?", answers: ["Hercule Poirot", "Poirot"] },
      { id: "q3", type: "text", prompt: "What is the name of Tintin's dog (in English)?", answers: ["Snowy", "Milou"] },
      { id: "q4", type: "text", prompt: "How many sides does a hexagon have?", answers: ["6", "Six"] },
      { id: "q5", type: "choice", prompt: "Which planet is known as the Red Planet?", options: ["Mars", "Venus", "Jupiter", "Mercury"], answer: "Mars" },
      { id: "q6", type: "choice", prompt: "Which is the largest ocean?", options: ["Pacific", "Atlantic", "Indian", "Arctic"], answer: "Pacific" },
      { id: "q7", type: "text", prompt: "What is the chemical symbol for gold?", answers: ["Au"] },
      { id: "q8", type: "text", prompt: "In what year did the Berlin Wall fall?", answers: ["1989"] },
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
      { id: "q5", type: "choice", prompt: "Trappists are a branch of which order?", options: ["Cistercians", "Franciscans", "Dominicans", "Jesuits"], answer: "Cistercians" },
      { id: "q6", type: "text", prompt: "What was the room where monks copied manuscripts called?", answers: ["Scriptorium"] },
      { id: "q7", type: "text", prompt: "Which monk is (by legend) credited with inventing champagne?", answers: ["Dom Pérignon", "Pérignon"] },
      { id: "q8", type: "text", prompt: "Monks vow poverty, chastity and…?", answers: ["Obedience"] },
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
      { id: "q5", type: "text", prompt: "Which Belgian cyclist was nicknamed 'The Cannibal'?", answers: ["Eddy Merckx", "Merckx"] },
      { id: "q6", type: "text", prompt: "Which Belgian surrealist painted 'The Son of Man'?", answers: ["René Magritte", "Magritte"] },
      { id: "q7", type: "text", prompt: "What do Belgians call their beloved fried potatoes?", answers: ["Frites", "Frieten", "Fries", "Chips"] },
      { id: "q8", type: "text", prompt: "How many official languages does Belgium have?", answers: ["3", "Three"], points: 2 },
    ],
  },
];
