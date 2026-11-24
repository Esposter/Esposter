import type { GameDataIndexKey } from "#src/generated/gameDataKeys";

import { gameDataLock } from "#src/services/data/gameDataLock";
import { readGameDataObject } from "#src/services/data/readGameDataObject";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { getHostedAssetUrl, hostedAssetIndexSchema } from "hosted-assets";

// An index object as the lock names it: each entry id mapped to the sha256 of that entry's record
export const readGameDataIndex = async (
  gameDataBaseUrl: string,
  indexKey: GameDataIndexKey,
): Promise<Record<string, string>> => {
  const indexObject = gameDataLock.indexes[indexKey];
  if (indexObject === undefined)
    throw new InvalidOperationError(Operation.Read, indexKey, "is not in the game data lock");
  return hostedAssetIndexSchema.parse(await readGameDataObject(getHostedAssetUrl(gameDataBaseUrl, indexObject)));
};
