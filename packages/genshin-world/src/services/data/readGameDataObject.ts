import { readJson } from "#src/services/shared/readJson";
import { createEvictingPromiseCache } from "@esposter/shared";

// An object is immutable under its hash, so one fetch of it serves every reader of that page's lifetime, including a
// Second reader that asks while the first is still in flight
const readCachedGameDataObject = createEvictingPromiseCache((url: string) => url, readJson);

// The parsed JSON of the object a hash names under its dataset's key, at the host's base, before any reader's schema
// Has been applied to it
export const readGameDataObject = (gameDataBaseUrl: string, dataset: string, hash: string): Promise<unknown> =>
  readCachedGameDataObject(`${gameDataBaseUrl}/${dataset}/${hash}.json`);
