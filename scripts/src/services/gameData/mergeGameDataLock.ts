import type { GameDataScope } from "#src/models/gameData/GameDataScope";
import type { GameDataLock } from "genshin-world";

import { checkIsGameDataset } from "#src/services/gameData/checkIsGameDataset";
import { takeOne } from "@esposter/shared";

// The lock a publish commits: every entry a scope names is dropped and the planned entries take their place. A dataset
// Scope names every key under its dataset, and a key scope names that one key alone, so a fit republishing one key leaves
// Its dataset's other keys as they stand. An entry whose dataset has left GameDataset goes too, so a retired dataset
// Leaves the lock on its next write
export const mergeGameDataLock = (
  currentLock: GameDataLock,
  scopes: GameDataScope[],
  plannedLock: GameDataLock,
): GameDataLock => ({
  indexes: { ...keepUnscopedEntries(currentLock.indexes, scopes), ...plannedLock.indexes },
  objects: { ...keepUnscopedEntries(currentLock.objects, scopes), ...plannedLock.objects },
});

const keepUnscopedEntries = (entries: Record<string, string>, scopes: GameDataScope[]): Record<string, string> =>
  Object.fromEntries(
    Object.entries(entries).filter(([key]) => {
      const dataset = takeOne(key.split("/"));
      return checkIsGameDataset(dataset) && !scopes.some((scope) => scope === key || scope === dataset);
    }),
  );
