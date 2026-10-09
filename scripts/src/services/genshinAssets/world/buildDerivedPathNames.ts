import { readIndexedAssets } from "#src/services/genshinAssets/shared/readIndexedAssets";
import { DERIVED_ASSET_PATH_INDEX_PATH, PREFAB_STEM_REGEX } from "#src/services/genshinAssets/world/constants";
import { matchPrefabPathKeys } from "#src/services/genshinAssets/world/matchPrefabPathKeys";
import { writeFile } from "node:fs/promises";

// Names the path hashes of a set of open-world placements that the community's index names none of (its 2.6 index stops
// At game 2.6, and every newer prefab's path is unnamed there), by hashing the paths the asset index's own names give
// Their folders. Each match is written to the derived index beside the community's, which `readAssetPathNames` reads
export const buildDerivedPathNames = async (keys: ReadonlySet<string>): Promise<Map<string, string>> => {
  const names = new Set((await readIndexedAssets(({ name }) => PREFAB_STEM_REGEX.test(name))).map(({ name }) => name));
  const matches = matchPrefabPathKeys(names, keys);
  const entries = Array.from(matches, ([key, path]) => ({
    Name: path,
    PathHashLast: Number(BigInt(key) >> 8n),
    PathHashPre: Number(BigInt(key) & 0xffn),
  }));
  await writeFile(DERIVED_ASSET_PATH_INDEX_PATH, JSON.stringify({ SubAssets: { derived: entries } }));
  return matches;
};
