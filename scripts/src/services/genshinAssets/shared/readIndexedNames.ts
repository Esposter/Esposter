import type { IndexedAsset } from "#src/models/recreation/animeStudio/IndexedAsset";

import { GENSHIN_ANIMESTUDIO_OPTIONS } from "#src/services/genshinAssets/shared/constants";
import { readIndexedAssets } from "#src/services/recreation/animeStudio/readIndexedAssets";

// The name of each kept asset under the key the caller derives from it.
// An asset the caller has no key for gets no entry.
// A key two assets share keeps the later name, as the index lists them.
export const readIndexedNames = async (
  predicate: (asset: IndexedAsset) => boolean,
  toKey: (asset: IndexedAsset) => string | undefined,
): Promise<Map<string, string>> => {
  const keyNameMap = new Map<string, string>();
  for (const asset of await readIndexedAssets(predicate, GENSHIN_ANIMESTUDIO_OPTIONS)) {
    const key = toKey(asset);
    if (key !== undefined) keyNameMap.set(key, asset.name);
  }
  return keyNameMap;
};
