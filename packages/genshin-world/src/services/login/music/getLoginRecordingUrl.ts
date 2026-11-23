import { GameDataset } from "#src/models/data/GameDataset";
import { checkIsGameDataKey } from "#src/services/data/checkIsGameDataKey";
import { getGameDataRecord } from "#src/services/data/getGameDataRecord";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { getHostedAssetUrl } from "hosted-assets";

// The url a login recording is served at under the hosted game data's origin: the lock names its object under the
// Recordings' scope by the recording's file name, so the url is the one the preload fetched and the cache answers
export const getLoginRecordingUrl = (gameDataBaseUrl: string, file: string): string => {
  const key = `${GameDataset.LoginRecordings}/${file}`;
  if (!checkIsGameDataKey(key)) throw new InvalidOperationError(Operation.Read, key, "is not in the game data lock");
  return getHostedAssetUrl(gameDataBaseUrl, getGameDataRecord(key));
};
