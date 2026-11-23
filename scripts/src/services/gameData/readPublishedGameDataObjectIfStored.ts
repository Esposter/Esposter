import { GAME_DATA_DEV_BASE_URL } from "#src/services/gameData/constants";
import { readPublishedGameDataObject } from "#src/services/gameData/readPublishedGameDataObject";
import { fetchResponse } from "#src/services/shared/fetchResponse";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { HOSTED_ASSETS_MIRROR_DIRECTORY, readContentAddressedObject } from "@esposter/shared-node/cache";
import { getGameDataObjectName } from "genshin-world";
import { getHostedAssetUrl } from "hosted-assets";
import { existsSync } from "node:fs";
import { join } from "node:path";

// The same object, or undefined when the dev bucket holds no object under its key, so a comparison reads an object the bucket
// Lacks as new rather than failing on it. A cached object is read as the cache serves it; a fetched one is verified and cached
export const readPublishedGameDataObjectIfStored = async <T>(dataset: string, hash: string): Promise<T | undefined> => {
  if (existsSync(join(HOSTED_ASSETS_MIRROR_DIRECTORY, hash))) return readPublishedGameDataObject<T>(dataset, hash);
  const url = getHostedAssetUrl(GAME_DATA_DEV_BASE_URL, getGameDataObjectName(dataset, hash));
  const response = await fetchResponse(url);
  if (response.status === 404) return undefined;
  if (!response.ok) throw new InvalidOperationError(Operation.Read, url, `responds ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const verified = await readContentAddressedObject(hash, () => Promise.resolve(bytes));
  return parseMachineJson<T>(verified.toString("utf8"));
};
