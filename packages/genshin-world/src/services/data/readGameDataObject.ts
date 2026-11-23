import { readJson } from "#src/services/shared/readJson";
import { createEvictingPromiseCache } from "@esposter/shared";

// The parsed JSON of the object at a url, before any reader's schema has been applied to it. An object is immutable
// Under Its hash, so one fetch of it serves every reader of that page's lifetime, including a second reader that asks
// While the First is still in flight
export const readGameDataObject: (url: string) => Promise<unknown> = createEvictingPromiseCache(
  (url: string) => url,
  readJson,
);
