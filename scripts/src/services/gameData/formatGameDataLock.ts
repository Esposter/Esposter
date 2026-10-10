import type { GameDataLock } from "genshin-world";

// The lock as it is committed: keys sorted and one entry a line, so a patch's diff names exactly the keys it changed
// And two machines that publish the same records write the same bytes
export const formatGameDataLock = (lock: GameDataLock): string =>
  `${JSON.stringify(
    {
      indexes: Object.fromEntries(Object.entries(lock.indexes).toSorted(([left], [right]) => compareKeys(left, right))),
      objects: Object.fromEntries(Object.entries(lock.objects).toSorted(([left], [right]) => compareKeys(left, right))),
    },
    null,
    2,
  )}\n`;

// Code unit order, which is the same on every machine, unlike a locale's collation
const compareKeys = (left: string, right: string): number => (left < right ? -1 : left > right ? 1 : 0);
