import { LOGIN_RECORDINGS_FOLDER } from "#src/services/gameData/constants";
import { publishGameDataPlan } from "#src/services/gameData/publishGameDataPlan";
import { planHostedAssetFiles } from "#src/services/hostedAssets/planHostedAssetFiles";
import { readHostedAssetSourceFolder } from "#src/services/hostedAssets/readHostedAssetSourceFolder";
import { DATA_ROOT } from "@esposter/shared-node/cache";
import { GameDataset } from "genshin-world/definitions";

// The login's music recordings, published from their working folder as the game data's own scope: each file is an
// Object named by the sha256 of its bytes, and the scope is replaced whole, so a recording the folder no longer holds
// Leaves the lock
export const publishLoginRecordings = async (isDryRun: boolean): Promise<string> => {
  const files = await readHostedAssetSourceFolder(DATA_ROOT, LOGIN_RECORDINGS_FOLDER, []);
  return publishGameDataPlan({
    isDryRun,
    plan: planHostedAssetFiles(GameDataset.LoginRecordings, files),
    scopes: [GameDataset.LoginRecordings],
  });
};
