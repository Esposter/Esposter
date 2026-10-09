import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { getAssetPathKey } from "#src/services/genshinAssets/shared/getAssetPathKey";
import { getPrefabPathCandidates } from "#src/services/genshinAssets/world/getPrefabPathCandidates";
import { getPrefabStemVariants } from "#src/services/genshinAssets/world/getPrefabStemVariants";

// The path each of the keys names, among the paths the candidate names of the given asset names give, each hashed as a
// Prefab. A key no candidate gives is left out, and so is a key a second candidate gives, since the first keeps it
export const matchPrefabPathKeys = (names: Iterable<string>, keys: ReadonlySet<string>): Map<string, string> => {
  const matches = new Map<string, string>();
  for (const name of names)
    for (const stem of getPrefabStemVariants(name))
      for (const path of getPrefabPathCandidates(stem)) {
        const key = getAssetPathKey(path, AssetType.GameObject);
        if (keys.has(key) && !matches.has(key)) matches.set(key, path);
      }
  return matches;
};
