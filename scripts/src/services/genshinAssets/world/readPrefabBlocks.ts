import type { CabEntry } from "#src/models/recreation/animeStudio/CabEntry";
import type { IndexedAsset } from "#src/models/recreation/animeStudio/IndexedAsset";

import { GENSHIN_ANIMESTUDIO_OPTIONS } from "#src/services/genshinAssets/shared/constants";
import { getDependantFiles } from "#src/services/genshinAssets/world/getDependantFiles";
import { toFileKey } from "#src/services/genshinAssets/world/toFileKey";
import { readIndexedAssets } from "#src/services/recreation/animeStudio/readIndexedAssets";
import { getOrCreate } from "@esposter/shared";

// The blocks the game object of each asset's name may stand in, by that name.
// Those are the block indexing the asset, plus, for an asset the caller follows, the blocks below.
// A Building's mesh and a held weapon's are such assets.
// It also takes the block of each file depending on the file holding it that the asset index lists no asset in.
// A Building's LOD level is a prefab file of its own, depending on its mesh's, in a block that need not index it.
// A file the index lists assets in (a MonoBehaviour, an Animator) is a gadget or a scene drawing the mesh as a child.
// It is almost never the prefab, and those files fill the largest blocks the game has.
// An asset the caller does not follow keeps its own block alone.
// Its game object is looked for in every block dumped, where a block holds none (`deriveCapitalWorld`).
export const readPrefabBlocks = async (
  assets: readonly IndexedAsset[],
  cabMap: ReadonlyMap<string, CabEntry>,
  checkIsFollowed: (asset: IndexedAsset) => boolean,
): Promise<Map<string, string[]>> => {
  const nameDependantFilesMap = getDependantFiles(
    assets.filter((asset) => checkIsFollowed(asset)),
    cabMap,
  );
  const dependantFileKeys = new Set([...nameDependantFilesMap.values()].flat().map((file) => toFileKey(file)));
  const listedFileKeys = new Set(
    (await readIndexedAssets((asset) => dependantFileKeys.has(toFileKey(asset)), GENSHIN_ANIMESTUDIO_OPTIONS)).map(
      (asset) => toFileKey(asset),
    ),
  );
  const namePrefabBlocksMap = new Map<string, Set<string>>();
  for (const { block, name } of assets) {
    const prefabBlocks = getOrCreate(namePrefabBlocksMap, name, () => new Set()).add(block);
    for (const file of nameDependantFilesMap.get(name) ?? [])
      if (!listedFileKeys.has(toFileKey(file))) prefabBlocks.add(file.block);
  }
  return new Map(Array.from(namePrefabBlocksMap, ([name, prefabBlocks]) => [name, [...prefabBlocks]]));
};
