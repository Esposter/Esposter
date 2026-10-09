import { fetchGameDataObject } from "#src/services/data/fetchGameDataObject";
import { createEvictingPromiseCache } from "@esposter/shared";

// An object is immutable under its hash, so one fetch of it serves every reader of that page's lifetime, including a
// Second reader that asks while the first is still in flight
const readCachedGameDataObject = createEvictingPromiseCache((url: string) => url, fetchGameDataObject);

// The parsed JSON of the object a hash names under the host's base, before any reader's schema has been applied to it
export const readGameDataObject = (gameDataBaseUrl: string, hash: string): Promise<unknown> =>
  readCachedGameDataObject(`${gameDataBaseUrl}/${hash}.json`);
