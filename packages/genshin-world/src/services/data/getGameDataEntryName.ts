import type { HostedAssetName } from "hosted-assets";

import { gameDataLock } from "#src/services/data/gameDataLock";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The name an entry of an index is stored under: its index's scope and extension, as its lock entry names them.
// So a reader and the walk over the lock name the same object
export const getGameDataEntryName = (indexKey: string, sha256: string): HostedAssetName => {
  const indexObject = gameDataLock.indexes[indexKey];
  if (indexObject === undefined)
    throw new InvalidOperationError(Operation.Read, indexKey, "is not in the game data lock");
  return { extension: indexObject.extension, scope: indexObject.scope, sha256 };
};
