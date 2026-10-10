import {
  ASSET_PATH_INDEX_PATH,
  ASSET_PATH_INDEX_TIMEOUT_MILLISECONDS,
  ASSET_PATH_INDEX_URL,
} from "#src/services/genshinAssets/world/constants";
import { fetchOk } from "#src/services/shared/fetchOk";
import { existsSync } from "node:fs";
import { mkdir, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

// The community's index at its path, fetched from its source when the path holds no file. A copy that brought it (the
// `asset-index` folder is in the fleet's data) never fetches it. The file is written beside its place and moved in, so
// So a fetch cut short leaves no file a later run reads as the index
export const ensureAssetPathIndex = async (indexPath: string = ASSET_PATH_INDEX_PATH): Promise<string> => {
  if (existsSync(indexPath)) return indexPath;
  const response = await fetchOk(ASSET_PATH_INDEX_URL, { timeoutMs: ASSET_PATH_INDEX_TIMEOUT_MILLISECONDS });
  await mkdir(dirname(indexPath), { recursive: true });
  const partialPath = `${indexPath}.part`;
  await writeFile(partialPath, new Uint8Array(await response.arrayBuffer()));
  await rename(partialPath, indexPath);
  return indexPath;
};
