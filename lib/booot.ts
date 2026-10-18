/** Booot's standard berth (visit.gent.be), geocoded with OpenStreetMap. Go searches by name + address. */
export const PICKUP = {
  name: "Booot",
  address: "Coupure Links 9, 9000 Gent",
  at: [51.04646, 3.7198] as [number, number],
};

/** Down the Leie from the Graslei, between Ajuinlei and Recolettenlei, to the mouth of the Coupure. */
export const SAIL: [number, number][] = [
  [51.0548, 3.721],
  [51.053, 3.7207],
  [51.0513, 3.7207],
  [51.0495, 3.7205],
  [51.0478, 3.7203],
  PICKUP.at,
];

export const boootDirectionsUrl = () =>
  `https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=${encodeURIComponent(`${PICKUP.name}, ${PICKUP.address}`)}`;
