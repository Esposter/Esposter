import { GAME_DATA_DEV_BASE_URL } from "#src/services/gameData/constants";
import { getGameDataObjectKey } from "#src/services/gameData/getGameDataObjectKey";

// The URL the dev environment's public bucket serves one published object at, by its dataset and hash
export const getGameDataObjectUrl = (dataset: string, hash: string): string =>
  `${GAME_DATA_DEV_BASE_URL}/${getGameDataObjectKey(dataset, hash)}`;
