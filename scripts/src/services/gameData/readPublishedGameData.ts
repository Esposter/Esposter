import { readGameDataLock } from "#src/services/gameData/readGameDataLock";
import { readPublishedGameDataObject } from "#src/services/gameData/readPublishedGameDataObject";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A record another step published, read through the lock on disk from the dev account, never through genshin-world's
// Build, which holds the lock of its last build rather than the one an earlier step just wrote. Unchecked, as a fitted
// File read from disk is: the caller names what it holds, or parses it with the reader's schema
export const readPublishedGameData = async <T>(key: string): Promise<T> => {
  const { objects } = await readGameDataLock();
  const hash = objects[key];
  if (hash === undefined) throw new InvalidOperationError(Operation.Read, key, "is not in the game data lock");
  return readPublishedGameDataObject<T>(key, hash);
};
