// The items in a random order from the seeded source: each item takes a random key, and the items sort by their keys
export const shuffleWithRandom = <T>(items: readonly T[], random: () => number): T[] =>
  items
    .map((item) => ({ item, key: random() }))
    .toSorted((firstItem, secondItem) => firstItem.key - secondItem.key)
    .map(({ item }) => item);
