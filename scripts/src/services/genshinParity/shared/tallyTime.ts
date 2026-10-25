// Counts one more occurrence of a key and adds its time to that key's running total
export const tallyTime = <Key>(tallies: Map<Key, { count: number; ms: number }>, key: Key, ms: number): void => {
  const total = tallies.get(key) ?? { count: 0, ms: 0 };
  tallies.set(key, { count: total.count + 1, ms: total.ms + ms });
};
