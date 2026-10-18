// A region's three levels, one claimed, one claimable and one still locked, with two Oculi held toward the next level
export const props = {
  blessingTitle: "Sample Blessing",
  heldCount: 2,
  levels: [
    { level: 1, oculusCount: 1, rewards: [{ count: 2, name: "Sample Ore" }], state: "claimed" },
    {
      level: 2,
      oculusCount: 2,
      rewards: [
        { count: 1, name: "Sample Ore" },
        { count: 3, name: "Sample Coin" },
      ],
      state: "claimable",
    },
    { level: 3, oculusCount: 3, rewards: [{ count: 1, name: "Sample Gem" }], state: "locked" },
  ],
  title: "Sample Worship",
};
