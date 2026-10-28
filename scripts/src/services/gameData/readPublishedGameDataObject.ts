import { GAME_DATA_DEV_BASE_URL } from "#src/services/gameData/constants";
import { getGameDataBlobName } from "#src/services/gameData/getGameDataBlobName";
import { fetchOk } from "#src/services/shared/fetchOk";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { CONTENT_CACHE_DIRECTORY, readContentAddressedObject } from "@esposter/shared-node/cache";
import { existsSync } from "node:fs";
import { join } from "node:path";

// The JSON of one published object, by its dataset and hash, through the machine-wide content cache. The cache is keyed
// By the hash alone, since the content is what the hash names, so the dev account serves each object once per machine
// However many steps, loops and worktrees read it
export const readPublishedGameDataObject = async <T>(dataset: string, hash: string): Promise<T> => {
  const bytes = await readContentAddressedObject(
    hash,
    async () =>
      new Uint8Array(
        await (await fetchOk(`${GAME_DATA_DEV_BASE_URL}/${getGameDataBlobName(dataset, hash)}`)).arrayBuffer(),
      ),
  );
  return parseMachineJson<T>(bytes.toString("utf8"));
};

// The same object, or undefined when the dev account holds no blob under its name, so a comparison reads a blob the account
// lacks as new rather than failing on it. A cached object is read as the cache serves it; a fetched one is verified and cached
export const readPublishedGameDataObjectIfStored = async <T>(dataset: string, hash: string): Promise<T | undefined> => {
  if (existsSync(join(CONTENT_CACHE_DIRECTORY, hash))) return readPublishedGameDataObject<T>(dataset, hash);
  const url = `${GAME_DATA_DEV_BASE_URL}/${getGameDataBlobName(dataset, hash)}`;
  const response = await fetch(url);
  if (response.status === 404) return undefined;
  if (!response.ok) throw new InvalidOperationError(Operation.Read, url, `responds ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const verified = await readContentAddressedObject(hash, async () => bytes);
  return parseMachineJson<T>(verified.toString("utf8"));
};
