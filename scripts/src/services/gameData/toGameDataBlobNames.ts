import type { GameDataObjectRef } from "#src/models/gameData/GameDataObjectRef";

import { getGameDataBlobName } from "#src/services/gameData/getGameDataBlobName";

// The blob names of a set of stored objects, for a membership test against what the container holds
export const toGameDataBlobNames = (objects: GameDataObjectRef[]): Set<string> =>
  new Set(objects.map(({ dataset, hash }) => getGameDataBlobName(dataset, hash)));
