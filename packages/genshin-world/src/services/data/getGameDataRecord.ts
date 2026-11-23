import type { GameDataKey } from "#src/generated/gameDataKeys";
import type { HostedAssetObject } from "hosted-assets";

import { gameDataLock } from "#src/services/data/gameDataLock";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The lock's entry for a record read by its key, which names the object the record is stored as
export const getGameDataRecord = (key: GameDataKey): HostedAssetObject => {
  const object = gameDataLock.objects[key];
  if (object === undefined) throw new InvalidOperationError(Operation.Read, key, "is not in the game data lock");
  return object;
};
