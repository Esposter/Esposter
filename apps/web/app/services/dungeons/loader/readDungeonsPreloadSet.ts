import type { HostedAssetPreloadSet } from "hosted-assets";

import { DUNGEONS_LICENSE_NOTICE_REGEX } from "#src/services/dungeons/loader/constants";
import { dungeonsLock } from "#src/services/dungeons/loader/dungeonsLock";
import { getHostedAssetPath, getHostedAssetUrl } from "hosted-assets";

// Every object the dungeons lock names but the license notices, each under its hosted url once. The scope prefixes are
// The lock's scopes, so a successful preload evicts only this product's stale entries from the cache every product
// Shares
export const readDungeonsPreloadSet = (origin: string): HostedAssetPreloadSet => {
  const objects = Object.entries(dungeonsLock.objects)
    .filter(([key]) => !DUNGEONS_LICENSE_NOTICE_REGEX.test(key))
    .map(([, object]) => object);
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
