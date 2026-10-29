import type { GameDataKeyScope } from "#src/models/gameData/GameDataKeyScope";

import { checkIsGameDataKeyScope } from "#src/services/gameData/checkIsGameDataKeyScope";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The lock keys a step republishes on their own, each checked to sit under a dataset, so a key naming none is refused
// Before anything is published rather than dropped from the lock on its next write
export const toGameDataKeyScopes = (keys: readonly string[]): GameDataKeyScope[] =>
  keys.map((key) => {
    if (!checkIsGameDataKeyScope(key))
      throw new InvalidOperationError(Operation.Read, key, "is no key under a game dataset");
    return key;
  });
