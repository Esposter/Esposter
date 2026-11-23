import type { HostedAssetPreloadSet } from "hosted-assets";

import { dungeonsLock } from "#src/services/dungeons/loader/dungeonsLock";
import { getHostedAssetPath, getHostedAssetUrl } from "hosted-assets";

// Every object the dungeons lock names, each under its hosted url once. The scope prefixes are the lock's scopes, so a
// Successful preload evicts only this product's stale entries from the cache every product shares
export const readDungeonsPreloadSet = (origin: string): HostedAssetPreloadSet => {
  const objects = Object.values(dungeonsLock.objects);
  const files = objects.map((object) => ({
    bytes: object.bytes,
    path: getHostedAssetPath(object),
    url: getHostedAssetUrl(origin, object),
  }));
  return {
    files: [...new Map(files.map((file) => [file.url, file])).values()],
    scopePrefixes: [...new Set(objects.map(({ scope }) => `${origin}/${scope}/`))],
  };
};
