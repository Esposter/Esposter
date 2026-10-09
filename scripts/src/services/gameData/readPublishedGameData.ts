import { readGameDataLock } from "#src/services/gameData/readGameDataLock";
import { readPublishedGameDataObject } from "#src/services/gameData/readPublishedGameDataObject";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A record another step published, read through the lock on disk from the dev account, never through genshin-world's
// Build, which a step running under tsx may load stale. Unchecked, as a fitted file read from disk is: the caller names
// What it holds, or parses it with the reader's schema
// oxlint-disable-next-line typescript/no-unnecessary-type-parameters -- the caller names the type the record holds
export const readPublishedGameData = async <T>(key: string): Promise<T> => {
  const { objects } = await readGameDataLock();
  const hash = objects[key];
  if (hash === undefined) throw new InvalidOperationError(Operation.Read, key, "is not in the game data lock");
  return readPublishedGameDataObject<T>(hash);
};
