import { getGameDataObjectUrl } from "#src/services/gameData/getGameDataObjectUrl";
import { readPublishedGameDataObject } from "#src/services/gameData/readPublishedGameDataObject";
import { fetchResponse } from "#src/services/shared/fetchResponse";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { CONTENT_CACHE_DIRECTORY, readContentAddressedObject } from "@esposter/shared-node/cache";
import { existsSync } from "node:fs";
import { join } from "node:path";

// The same object, or undefined when the dev account holds no blob under its name, so a comparison reads a blob the account
// Lacks as new rather than failing on it. A cached object is read as the cache serves it; a fetched one is verified and cached
export const readPublishedGameDataObjectIfStored = async <T>(dataset: string, hash: string): Promise<T | undefined> => {
  if (existsSync(join(CONTENT_CACHE_DIRECTORY, hash))) return readPublishedGameDataObject<T>(dataset, hash);
  const url = getGameDataObjectUrl(dataset, hash);
  const response = await fetchResponse(url);
  if (response.status === 404) return undefined;
  if (!response.ok) throw new InvalidOperationError(Operation.Read, url, `responds ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const verified = await readContentAddressedObject(hash, () => Promise.resolve(bytes));
  return parseMachineJson<T>(verified.toString("utf8"));
};
