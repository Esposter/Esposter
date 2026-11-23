import type { GameDataPlan } from "#src/models/gameData/GameDataPlan";
import type { GameDataRecord } from "#src/models/gameData/GameDataRecord";
import type { GameDataPublication } from "#src/models/shared/GameDataPublication";

import { createGameDataRecord } from "#src/services/gameData/createGameDataRecord";
import { getGameDataObjectKey } from "#src/services/gameData/getGameDataObjectKey";
import { toGameDataLockObject } from "#src/services/gameData/toGameDataLockObject";

// The lock entries a publication names and every object they reach, each record once even when several names reach
// It. An index's entries are sorted by id before their hashes are collected, so the index object is the same whatever
// Order the step produced its records in. An entry is stored under its index's key, so one record reached under two
// Keys is two records.
export const planGameDataPublication = ({ indexes, objects }: GameDataPublication): GameDataPlan => {
  const recordMap = new Map<string, GameDataRecord>();
  const addRecord = (dataset: string, value: unknown, isIndex: boolean): GameDataRecord => {
    const record = createGameDataRecord(dataset, value, isIndex);
    recordMap.set(getGameDataObjectKey(record), record);
    return record;
  };
  const objectLock = Object.fromEntries(
    Object.entries(objects).map(([key, value]) => [key, toGameDataLockObject(addRecord(key, value, false))]),
  );
  const indexLock = Object.fromEntries(
    Object.entries(indexes).map(([indexKey, entries]) => {
      const entryHashes = Object.fromEntries(
        Object.keys(entries)
          .toSorted()
          .map((entryId) => [entryId, addRecord(indexKey, entries[entryId], false).hash]),
      );
      return [indexKey, toGameDataLockObject(addRecord(indexKey, entryHashes, true))];
    }),
  );
  return { lock: { indexes: indexLock, objects: objectLock }, records: [...recordMap.values()] };
};
