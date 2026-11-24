import { readJson } from "#src/services/shared/readJson";
import { createEvictingPromiseCache } from "@esposter/shared";

// The parsed JSON of the object at a url, before any reader's schema has been applied to it.
// An object is immutable under its hash, so one fetch of it serves every reader of that page's lifetime.
// A second reader that asks while the first is still in flight is served by that same fetch
export const readGameDataObject: (url: string) => Promise<unknown> = createEvictingPromiseCache(
  (url: string) => url,
  readJson,
);
