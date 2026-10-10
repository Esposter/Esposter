import { readGameDataLock } from "#src/services/gameData/readGameDataLock";
import { readPublishedGameDataObject } from "#src/services/gameData/readPublishedGameDataObject";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { gameDataIndexSchema } from "genshin-world";

// One entry of an index another step published, read through the lock on disk and the index from the dev account
// oxlint-disable-next-line typescript/no-unnecessary-type-parameters -- the caller names the type the record holds
export const readPublishedGameDataEntry = async <T>(indexKey: string, entryId: string): Promise<T> => {
  const { indexes } = await readGameDataLock();
  const indexHash = indexes[indexKey];
  if (indexHash === undefined)
    throw new InvalidOperationError(Operation.Read, indexKey, "is not in the game data lock");
  const index = gameDataIndexSchema.parse(await readPublishedGameDataObject(indexHash));
  const hash = index[entryId];
  if (hash === undefined)
    throw new InvalidOperationError(Operation.Read, `${indexKey}/${entryId}`, "is not in its index");
  return readPublishedGameDataObject<T>(hash);
};
