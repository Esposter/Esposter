import type { GameDataLock } from "genshin-world";

import { takeOne } from "@esposter/shared";
import { GameDataset } from "genshin-world";

// The lock a publish commits: every entry of the scopes it replaces is dropped and the planned entries take their place,
// And an entry whose dataset has left GameDataset goes with them, so a retired dataset leaves the lock on its next write
export const mergeGameDataLock = (
  currentLock: GameDataLock,
  scopes: GameDataset[],
  plannedLock: GameDataLock,
): GameDataLock => ({
  indexes: { ...keepUnscopedEntries(currentLock.indexes, scopes), ...plannedLock.indexes },
  objects: { ...keepUnscopedEntries(currentLock.objects, scopes), ...plannedLock.objects },
});

const checkIsGameDataset = (dataset: string): dataset is GameDataset =>
  (Object.values(GameDataset) as string[]).includes(dataset);

const keepUnscopedEntries = (entries: Record<string, string>, scopes: GameDataset[]): Record<string, string> =>
  Object.fromEntries(
    Object.entries(entries).filter(([key]) => {
      const dataset = takeOne(key.split("/"));
      return checkIsGameDataset(dataset) && !scopes.includes(dataset);
    }),
  );
