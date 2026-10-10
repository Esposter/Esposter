import {
  ASSET_PATH_INDEX_PATH,
  ASSET_PATH_INDEX_TIMEOUT_MILLISECONDS,
  ASSET_PATH_INDEX_URL,
} from "#src/services/genshinAssets/world/constants";
import { fetchOk } from "#src/services/shared/fetchOk";
import { publishFile } from "#src/services/shared/publishFile";
import { existsSync } from "node:fs";

// The community's index at its path, fetched from its source when the path holds no file. A copy that brought it (the
// `asset-index` folder is in the fleet's data) never fetches it. It is published through a partial file of its own, so a
// Fetch cut short leaves no file a later run reads as the index, and two runs fetching it at once never share one
export const ensureAssetPathIndex = async (indexPath: string = ASSET_PATH_INDEX_PATH): Promise<string> => {
  if (existsSync(indexPath)) return indexPath;
  const response = await fetchOk(ASSET_PATH_INDEX_URL, { timeoutMs: ASSET_PATH_INDEX_TIMEOUT_MILLISECONDS });
  await publishFile(indexPath, new Uint8Array(await response.arrayBuffer()));
  return indexPath;
};
