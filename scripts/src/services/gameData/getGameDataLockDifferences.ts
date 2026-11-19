import type { GameDataLock } from "genshin-world";

import { getDifferingLockNames } from "#src/services/gameData/getDifferingLockNames";

// The keys whose hash differs between the generated lock and the committed one, or that only one of them holds, each
// Named by its kind. Sorted, so a failure lists them in one order
export const getGameDataLockDifferences = (generated: GameDataLock, committed: GameDataLock): string[] =>
  [
    ...getDifferingLockNames("object", generated.objects, committed.objects),
    ...getDifferingLockNames("index", generated.indexes, committed.indexes),
  ].toSorted();
