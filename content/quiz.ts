import "server-only";
import type { Station } from "@/lib/types";

// PLACEHOLDER CONTENT — replace names, pubs, Words and questions before the night.
// Question ids must be unique within a Station; changing them after answers exist orphans those answers.

export const MAX_ORDERS = 4;

export const STATIONS: Station[] = [
  {
    id: 1,
    name: "Of Ghent",
    pub: "The First Tavern (to be chosen)",
    word: "pax",
    questions: [
      { id: "q1", type: "text", prompt: "What is the name of the medieval castle in the centre of Ghent?", answers: ["Gravensteen", "'s-Gravensteen", "Castle of the Counts"] },
      { id: "q2", type: "choice", prompt: "Which river meets the Lys in Ghent?", options: ["Scheldt", "Meuse", "Rhine", "Yser"], answer: "Scheldt" },
      { id: "q3", type: "text", prompt: "The Ghent Altarpiece is also known as the Adoration of the Mystic…?", answers: ["Lamb"] },
      { id: "q4", type: "text", prompt: "Which family of painters created the Ghent Altarpiece?", answers: ["Van Eyck", "Van Eyck brothers", "Jan van Eyck", "Hubert and Jan van Eyck"] },
      { id: "q5", type: "text", prompt: "Which Holy Roman Emperor was born in Ghent in 1500?", answers: ["Charles V", "Charles the Fifth", "Karel V", "Charles 5"] },
      { id: "q6", type: "choice", prompt: "What is the official language of Ghent?", options: ["Dutch", "French", "German", "English"], answer: "Dutch" },
      { id: "q7", type: "text", prompt: "What is the name of Ghent's famous ten-day summer festival?", answers: ["Gentse Feesten", "Ghent Festivities", "Ghent Festival"] },
      { id: "q8", type: "text", prompt: "What creature sits atop Ghent's belfry as a weathervane?", answers: ["Dragon", "A dragon"], points: 2 },
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
