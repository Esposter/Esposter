import { readIndexedAssets } from "#src/services/genshinAssets/shared/readIndexedAssets";
import { PREFAB_STEM_REGEX } from "#src/services/genshinAssets/world/constants";
import { matchPrefabPathKeys } from "#src/services/genshinAssets/world/matchPrefabPathKeys";

// The paths of the path hash keys the community's index names none of (its 2.6 index stops at game 2.6, and every newer
// Prefab's path is unnamed there), found by hashing the paths the asset index's own names give their folders
export const readDerivedPathNames = async (keys: ReadonlySet<string>): Promise<Map<string, string>> => {
  const names = new Set((await readIndexedAssets(({ name }) => PREFAB_STEM_REGEX.test(name))).map(({ name }) => name));
  return matchPrefabPathKeys(names, keys);
};
