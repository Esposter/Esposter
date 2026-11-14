import type { GameDataObjectRef } from "#src/models/gameData/GameDataObjectRef";

import { getGameDataObjectKey } from "#src/services/gameData/getGameDataObjectKey";

// The keys of a set of stored objects, for a membership test against what the bucket holds
export const toGameDataObjectKeys = (objects: GameDataObjectRef[]): Set<string> =>
  new Set(objects.map(({ dataset, hash }) => getGameDataObjectKey(dataset, hash)));
