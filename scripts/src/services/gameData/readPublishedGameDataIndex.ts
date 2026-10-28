import { readGameDataLock } from "#src/services/gameData/readGameDataLock";
import { readPublishedGameDataObject } from "#src/services/gameData/readPublishedGameDataObject";
import { InvalidOperationError, Operation } from "@esposter/shared";

// An index another step published, read through the lock on disk: each entry's id and the hash of its record
export const readPublishedGameDataIndex = async (indexKey: string): Promise<Record<string, string>> => {
  const { indexes } = await readGameDataLock();
  const indexHash = indexes[indexKey];
  if (indexHash === undefined)
    throw new InvalidOperationError(Operation.Read, indexKey, "is not in the game data lock");
  return readPublishedGameDataObject<Record<string, string>>(indexKey, indexHash);
};
