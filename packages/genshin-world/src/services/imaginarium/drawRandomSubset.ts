// The items drawn at random: each given a roll from the random source in the order the items are given, and the
// Lowest-rolled taken. The same source draws the same items, so a draw replays from its seed
export const drawRandomSubset = <T>(items: readonly T[], count: number, random: () => number): T[] =>
  items
    .map((item) => ({ item, roll: random() }))
    .toSorted((firstEntry, secondEntry) => firstEntry.roll - secondEntry.roll)
    .slice(0, count)
    .map(({ item }) => item);
