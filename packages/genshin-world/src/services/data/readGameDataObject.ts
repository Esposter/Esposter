import { createEvictingPromiseCache } from "@esposter/shared";
import { readHostedAssetFile } from "hosted-assets";

// The parsed JSON of the object at a url, before any reader's schema has been applied to it.
// An object is immutable under its hash, so one fetch of it serves every reader of that page's lifetime.
// A second reader that asks while the first is still in flight is served by that same fetch.
// The object is read through the hosted cache, so a cold visit fetches it once and the preload finds it held. Its
// Fetch gets the hosted budget the preload gives the same bytes, not the world's ten-second data budget: the login
// Reads its records while the packs download on the same link, and a cold record of a few hundred kilobytes outlasts
// The world's ten-second data budget there
export const readGameDataObject: (url: string) => Promise<unknown> = createEvictingPromiseCache(
  (url: string) => url,
  async (url: string) => {
    const blob = await readHostedAssetFile(url);
    const json: unknown = await new Response(blob).json();
    return json;
  },
);
