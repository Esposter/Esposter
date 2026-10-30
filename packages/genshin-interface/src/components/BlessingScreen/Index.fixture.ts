// The Blessing screen of a team of two, its pool holding half of the maximum for one statue
export const props = {
  autoRecoverTitle: "Auto-recover when nearby",
  closeLabel: "Back",
  isAutoRecoverOn: true,
  members: [
    { healthShare: 1, id: 1, name: "Traveler" },
    { healthShare: 0.4, id: 2, name: "Amber" },
  ],
  poolAmount: 2500,
  poolMaximum: 5000,
  thresholdPercent: 50,
  title: "Statue's Blessing",
  worshipTitle: "Worship Statue",
};
