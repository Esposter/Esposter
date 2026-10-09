import type { GameDataPlan } from "#src/models/gameData/GameDataPlan";
import type { GameDataPublication } from "#src/models/gameData/GameDataPublication";
import type { GameDataRecord } from "#src/models/gameData/GameDataRecord";

import { getGameDataHash } from "#src/services/gameData/getGameDataHash";

const createGameDataRecord = (value: unknown, isIndex: boolean): GameDataRecord => {
  const json = JSON.stringify(value);
  return { hash: getGameDataHash(json), isIndex, json };
};

// The lock entries a publication names and every object they reach, each record once even when several names reach
// It. An index's entries are sorted by id before their hashes are collected, so the index object is the same whatever
// Order the step produced its records in
export const planGameDataPublication = ({ indexes, objects }: GameDataPublication): GameDataPlan => {
  const recordMap = new Map<string, GameDataRecord>();
  const addRecord = (value: unknown, isIndex: boolean): string => {
    const record = createGameDataRecord(value, isIndex);
    recordMap.set(record.hash, record);
    return record.hash;
  };
  const objectHashes = Object.fromEntries(
    Object.entries(objects).map(([key, value]) => [key, addRecord(value, false)]),
  );
  const indexHashes = Object.fromEntries(
    Object.entries(indexes).map(([indexKey, entries]) => {
      const entryHashes = Object.fromEntries(
        Object.keys(entries)
          .toSorted()
          .map((entryId) => [entryId, addRecord(entries[entryId], false)]),
      );
      return [indexKey, addRecord(entryHashes, true)];
    }),
  );
  return { lock: { indexes: indexHashes, objects: objectHashes }, records: [...recordMap.values()] };
};
