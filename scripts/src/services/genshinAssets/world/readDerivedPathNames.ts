import { GENSHIN_ANIMESTUDIO_OPTIONS } from "#src/services/genshinAssets/shared/constants";
import { PREFAB_STEM_REGEX } from "#src/services/genshinAssets/world/constants";
import { matchPrefabPathKeys } from "#src/services/genshinAssets/world/matchPrefabPathKeys";
import { readIndexedAssets } from "#src/services/recreation/animeStudio/readIndexedAssets";

// The paths of the path hash keys the community's index names none of (its 2.6 index stops at game 2.6, and every newer
// Prefab's path is unnamed there), found by hashing the paths the asset index's own names give their folders
export const readDerivedPathNames = async (keys: ReadonlySet<string>): Promise<Map<string, string>> => {
  const names = new Set(
    (await readIndexedAssets(({ name }) => PREFAB_STEM_REGEX.test(name), GENSHIN_ANIMESTUDIO_OPTIONS)).map(
      ({ name }) => name,
    ),
  );
  return matchPrefabPathKeys(names, keys);
};
