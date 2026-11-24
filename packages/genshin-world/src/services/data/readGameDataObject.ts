import { readJson } from "#src/services/shared/readJson";
import { createEvictingPromiseCache } from "@esposter/shared";
import { HOSTED_ASSETS_FETCH_TIMEOUT_MS } from "hosted-assets";

// The parsed JSON of the object at a url, before any reader's schema has been applied to it.
// An object is immutable under its hash, so one fetch of it serves every reader of that page's lifetime.
// A second reader that asks while the first is still in flight is served by that same fetch
// The objects are hosted assets, so they get the hosted budget the preload already gives the same bytes: the login
// Reads its records while the packs download on the same link, and a cold record of a few hundred kilobytes outlasts
// The world's ten-second data budget there
export const readGameDataObject: (url: string) => Promise<unknown> = createEvictingPromiseCache(
  (url: string) => url,
  (url: string) => readJson(url, HOSTED_ASSETS_FETCH_TIMEOUT_MS),
);
