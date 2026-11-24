import { HOSTED_ASSETS_CACHE_NAME } from "#src/services/constants";

// Drops one object from the cache under its url, so the next read of it fetches it again
export const dropHostedAssetFile = async (url: string): Promise<void> => {
  await (await caches.open(HOSTED_ASSETS_CACHE_NAME)).delete(url);
};
