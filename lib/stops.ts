export type Stop = {
  name: string;
  tagline: string;
  address: string;
  tip: string;
  /** [lat, lng] — approximate; the Directions button searches by name + address, so it doesn't depend on these. */
  at: [number, number];
  food?: boolean;
  emoji: string;
};

export const STOPS: Stop[] = [
  {
    name: "Café Den Turk",
    tagline: "Ghent's oldest pub. Warm-up time.",
    address: "Botermarkt 3, 9000 Gent",
    tip: "Famous for its draught. Or go Trappist.",
    at: [51.0543, 3.7258],
    emoji: "🍺",
  },
  {
    name: "Het Waterhuis aan de Bierkant",
    tagline: "Canal-side, with a beer list as long as your arm.",
    address: "Groentenmarkt 9, 9000 Gent",
    tip: "Try a house brew: Gandavum, Klokke Roeland or Mammelokker",
    at: [51.0569, 3.7217],
    emoji: "🌊",
  },
  {
    name: "Dulle Griet",
    tagline: "Order a Max. Hand over a shoe.",
    address: "Vrijdagmarkt 50, 9000 Gent",
    tip: "Order the house Max (1.2 L). Your shoe goes up in the basket till the glass comes back 👟",
    at: [51.0573, 3.7264],
    emoji: "👟",
  },
  {
    name: "Friet & Bar Sympa",
    tagline: "FOOD. Chips, sauce, repeat.",
    address: "Bij Sint-Jacobs 16, 9000 Gent",
    tip: "Get stoofvleessaus on the fries if they have it.",
    at: [51.05645, 3.7287],
    food: true,
    emoji: "🍟",
  },
  {
    name: "Trollekelder",
    tagline: "A cellar full of trolls and strong beer.",
    address: "Bij Sint-Jacobs 17, 9000 Gent",
    tip: "House Trollebier, blond or brown, or brave the 'newspaper' menu 🧌",
    at: [51.0562, 3.729],
    emoji: "🧌",
  },
  {
    name: "Afsnis",
    tagline: "The last one. Brown café, open late.",
    address: "Bij Sint-Jacobs 10, 9000 Gent",
    tip: "Last orders. Make it count.",
    at: [51.0567, 3.72925],
    emoji: "🏁",
  },
];

export const directionsUrl = (s: Stop) =>
  `https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=${encodeURIComponent(`${s.name}, ${s.address}`)}`;
