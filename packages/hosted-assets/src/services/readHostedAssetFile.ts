import { HOSTED_ASSETS_CACHE_NAME } from "#src/services/constants";
import { storeHostedAssetFile } from "#src/services/storeHostedAssetFile";
import { noop } from "@esposter/shared";

// The read a product makes of one of its hosted objects, through the cache the preloader fills: the store answers a
// Held object from it, and a miss is stored under its url by the same store the preloader uses. So a file a product
// Reads before its preload is held when the preload plans, and the preload does not fetch it again
export const readHostedAssetFile = async (url: string): Promise<Blob> => {
  const cache = await caches.open(HOSTED_ASSETS_CACHE_NAME);
  return storeHostedAssetFile(cache, url, noop);
};
