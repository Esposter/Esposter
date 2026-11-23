import type { HostedAssetDownloadFile, HostedAssetPreloadSet } from "hosted-assets";

import { readCharacterPackPreloadSet } from "#src/services/character/readCharacterPackPreloadSet";
import { gameDataLock } from "#src/services/data/gameDataLock";
import { getHostedAssetPath, getHostedAssetUrl } from "hosted-assets";

// Everything the opening preloads from the origin: each object the game data lock names under its hosted url, once.
// The character packs follow it.
// The scope prefixes are the lock's scopes, so a successful preload evicts only this product's stale entries.
// The cache is shared by every product, which is why the eviction is scoped.
export const readGameDataPreloadSet = async (gameDataBaseUrl: string): Promise<HostedAssetPreloadSet> => {
  const objects = [...Object.values(gameDataLock.objects), ...Object.values(gameDataLock.indexes)];
  const lockFiles: HostedAssetDownloadFile[] = objects.map((object) => ({
    bytes: object.bytes,
    path: getHostedAssetPath(object),
    url: getHostedAssetUrl(gameDataBaseUrl, object),
  }));
  const characterPackPreloadSet = await readCharacterPackPreloadSet(gameDataBaseUrl);
  const scopes = new Set(objects.map(({ scope }) => scope));
  const files = new Map([...lockFiles, ...characterPackPreloadSet.files].map((file) => [file.url, file]));
  return {
    files: [...files.values()],
    scopePrefixes: [
      ...Array.from(scopes, (scope) => `${gameDataBaseUrl}/${scope}/`),
      ...characterPackPreloadSet.scopePrefixes,
    ],
  };
};
