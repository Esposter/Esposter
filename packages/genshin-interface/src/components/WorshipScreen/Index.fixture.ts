// The Worship Statue screen of a region at level two, with three Oculi collected and not yet offered
export const props = {
  collectedCount: 3,
  level: 2,
  levels: [
    { isReached: true, level: 1, rewards: [{ label: "Adventure EXP x30" }] },
    { isReached: true, level: 2, rewards: [{ label: "Primogem x40" }, { label: "Sigil x1" }] },
    { isReached: false, level: 3, rewards: [{ label: "Primogem x60" }] },
  ],
  offerLabel: "Offer",
  title: "Worship Statue",
};
