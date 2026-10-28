import { GAME_DATA_DEV_BASE_URL } from "#src/services/gameData/constants";
import { getGameDataBlobName } from "#src/services/gameData/getGameDataBlobName";

// The URL the dev account serves one published object at, by its dataset and hash
export const getGameDataObjectUrl = (dataset: string, hash: string): string =>
  `${GAME_DATA_DEV_BASE_URL}/${getGameDataBlobName(dataset, hash)}`;
