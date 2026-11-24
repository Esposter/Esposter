import type { HostedAssetName } from "hosted-assets";

import { gameDataLock } from "#src/services/data/gameDataLock";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { getHostedAssetEntryName } from "hosted-assets";

// The name an entry of a game data index is stored under, named by the lock's entry for that index
export const getGameDataEntryName = (indexKey: string, sha256: string): HostedAssetName => {
  const indexObject = gameDataLock.indexes[indexKey];
  if (indexObject === undefined)
    throw new InvalidOperationError(Operation.Read, indexKey, "is not in the game data lock");
  return getHostedAssetEntryName(indexObject, sha256);
};
