import type { HostedAssetPreloadSet } from "hosted-assets";

import { CHARACTER_PACKS_FOLDER } from "#src/services/character/constants";
import { getCharacterPackDownloadFiles } from "#src/services/character/getCharacterPackDownloadFiles";
import { readCharacterPackIndex } from "#src/services/character/readCharacterPackIndex";

// The files of every published character pack, and the scope their cache entries are kept under.
// A successful preload evicts the stale entries of that scope.
// The cache lists its keys as absolute urls, so the base is made absolute the same way.
// An origin's href ends in a slash that its paths would repeat, so the slash is dropped.
export const readCharacterPackPreloadSet = async (gameDataBaseUrl: string): Promise<HostedAssetPreloadSet> => {
  const index = await readCharacterPackIndex(gameDataBaseUrl);
  const absoluteGameDataBaseUrl = new URL(gameDataBaseUrl, window.location.href).href.replace(/\/$/u, "");
  return {
    files: getCharacterPackDownloadFiles(index, absoluteGameDataBaseUrl),
    scopePrefixes: [`${absoluteGameDataBaseUrl}/${CHARACTER_PACKS_FOLDER}/`],
  };
};
