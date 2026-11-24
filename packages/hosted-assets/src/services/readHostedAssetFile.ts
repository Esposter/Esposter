import { HOSTED_ASSETS_CACHE_NAME } from "#src/services/constants";
import { storeHostedAssetFile } from "#src/services/storeHostedAssetFile";
import { noop } from "@esposter/shared";

// The read a product makes of one of its hosted objects, through the cache the preloader fills: a held object is
// Answered from it, and a miss is stored under its url by the preloader's own store. So a file a product reads before
// Its preload is held when the preload plans, and the preload does not fetch it again
export const readHostedAssetFile = async (url: string): Promise<Blob> => {
  const cache = await caches.open(HOSTED_ASSETS_CACHE_NAME);
  const held = await cache.match(url);
  return held ? held.blob() : storeHostedAssetFile(cache, url, noop);
};
