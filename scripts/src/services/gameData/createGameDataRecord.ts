import type { GameDataRecord } from "#src/models/gameData/GameDataRecord";

import { getGameDataHash } from "#src/services/gameData/getGameDataHash";

export const createGameDataRecord = (dataset: string, value: unknown, isIndex: boolean): GameDataRecord => {
  const json = JSON.stringify(value);
  return { dataset, hash: getGameDataHash(json), isIndex, json };
};
